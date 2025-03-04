import { useEffect, useRef, useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useWebSocket } from "./WebSocketContext";
import RoomLayout from "./RoomLayout";
import { use } from "react";

function Room() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useWebSocket();

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const userName = location.state?.userName;

  if (!userName) {
    console.log(1);
    window.location.href = "/";
    return null;
  }

  if (!socket) {
    console.error("WebSocket not initialized!");
    window.location.href = "/";
    return null;
  }

  const [users, setUsers] = useState(new Map());
  const peerConnections = useRef(new Map());
  const dataChannels = useRef(new Map());
  const userId = useRef();

  useEffect(() => {
    socket.send(
      JSON.stringify({ type: "join-room", roomId: roomId, userName: userName })
    );

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "new-member":
          handleNewMember(message);
          break;
        case "offer":
          await handleOffer(message);
          break;
        case "answer":
          await handleAnswer(message);
          break;
        case "user":
          userId.current = message.userId;
          console.log(`${message.userId} has joined the room ${roomId}`);
          break;
        case "member-left":
          handleMemberLeft(message);
          break;
        case "ice-candidate":
          await handleIceCandidates(message);
          break;
        case "error":
          alert(message.message);
          navigate("/");
          break;
        default:
          console.log("Unknown message type", message);
      }
    };
  }, []);

  const handleNewMember = async (message) => {
    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);
      newUsers.set(message.userId, message.userName);
      return newUsers;
    });

    console.log(`${message.userId} has joined the room`);

    if (!peerConnections.current.has(message.userId)) {
      await createPeerConnection(userId.current, message.userId);
    }
  };

  const createPeerConnection = async (userId, targetUserId) => {
    if (peerConnections.current.has(targetUserId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnections.current.set(targetUserId, pc);

    const dataChannel = pc.createDataChannel("File Sharing");
    setUpDataChannel(dataChannel, targetUserId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (pc.localDescription) {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Ice Candidates Generated");
          socket?.send(
            JSON.stringify({
              type: "ice-candidate",
              candidate: event.candidate,
              targetUserId: targetUserId,
              userId: userId,
            })
          );
        }
      };
    }

    socket.send(
      JSON.stringify({
        type: "create-offer",
        sdp: pc.localDescription,
        targetUserId: targetUserId,
        userId: userId,
        userName: userName,
      })
    );

    console.log(`Offer sent from ${userId} to ${targetUserId}`);
  };

  const handleOffer = async (message) => {
    if (peerConnections.current.has(message.userId)) {
      await peerConnections.current
        .get(message.userId)
        .setRemoteDescription(message.sdp);
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnections.current.set(message.userId, pc);
    await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));

    pc.ondatachannel = (event) => {
      setUpDataChannel(event.channel, message.userId);
    };

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            targetUserId: message.userId,
            userId: userId.current,
          })
        );
      }
    };

    socket.send(
      JSON.stringify({
        type: "create-answer",
        sdp: pc.localDescription,
        targetUserId: message.userId,
        userId: userId.current,
        userName: userName,
      })
    );

    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);
      newUsers.set(message.userId, message.userName);
      return newUsers;
    });

    console.log(`${message.userId} has sent the offer`);
  };

  const handleAnswer = async (message) => {
    const pc = peerConnections.current.get(message.userId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
    }
    console.log(`${message.userId} has sent the answer`);
  };

  const handleIceCandidates = async (message) => {
    const pc = peerConnections.current.get(message.userId);
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
    console.log(`${message.userId} has sent ICE candidates`);
  };

  const handleMemberLeft = (message) => {
    peerConnections.current.delete(message.userId);
    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);
      newUsers.delete(message.userId);
      return newUsers;
    });
  };

  const setUpDataChannel = (dataChannel, targetUserId) => {
    dataChannels.current.set(targetUserId, dataChannel);

    dataChannel.onopen = () =>
      console.log(`Data channel open with ${targetUserId}`);
    // dataChannel.onmessage = handleFileReceive;
    dataChannel.onclose = () => dataChannels.current.delete(targetUserId);
  };

  const sendFile = (targetUserId, file) => {
    const dataChannel = dataChannels.get(targetUserId);
    if (!dataChannel || dataChannel.readyState !== "open") {
      console.log("Data Channel Not Open");
      return;
    }

    dataChannel.send(
      JSON.stringify({
        type: "metadata",
        fileName: file.name,
        fileSize: file.size,
      })
    );

    const chunkSize = 16 * 1024;
    let offset = 0;

    const sendNextChunk = () => {
      if (offset < file.size) {
        const chunk = file.slice(offset, offset + chunkSize);
        chunk.arrayBuffer().then((buffer) => {
          dataChannel.send(buffer);
          offset += chunkSize;
          setTimeout(sendNextChunk, 10);
        });
      } else {
        dataChannel.send("EOF"); // Marks end of file
      }
    };

    sendNextChunk();
  };

  

  return (
    <RoomLayout hostName={userName} users={users} roomId={roomId}></RoomLayout>
  );
}

export default Room;
