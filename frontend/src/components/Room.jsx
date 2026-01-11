import { useEffect, useRef, useState } from "react";
import { useSearchParams, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useWebSocket } from "./WebSocketContext";
import RoomLayout from "./RoomLayout";

function Room() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const socket = useWebSocket();

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const userName = location.state?.userName;

  if (!userName) {
    window.location.href = "/";
    return null;
  }

  if (!socket) {
    console.error("WebSocket not initialized!");
    window.location.href = "/";
    return null;
  }

  const [users, setUsers] = useState(new Map());
  const [msg, setMsg] = useState([]);
  const peerConnections = useRef(new Map());
  const dataChannels = useRef(new Map());
  const userId = useRef();
  const usersRef = useRef(users);

  // Cleanup function
  const cleanup = () => {
    // Clean up peer connections
    peerConnections.current.forEach((pc) => {
      try {
        pc.close();
      } catch (e) {
        console.error("Error closing peer connection:", e);
      }
    });
    peerConnections.current.clear();

    // Clean up data channels
    dataChannels.current.forEach((dc) => {
      try {
        if (dc.readyState === "open" || dc.readyState === "connecting") {
          dc.close();
        }
      } catch (e) {
        console.error("Error closing data channel:", e);
      }
    });
    dataChannels.current.clear();
  };

  // Handle browser back button - intercept and redirect
  useEffect(() => {
    // Push a state when entering room to intercept back button
    // This creates a history entry so we can detect when user presses back
    const currentUrl = window.location.href;
    window.history.pushState({ preventBack: true, roomPage: true }, "", currentUrl);

    const handlePopState = (event) => {
      // Only handle if we're leaving the room
      if (event.state?.roomPage || !event.state) {
        // Clean up connections
        cleanup();
        
        // Immediately redirect to landing page with full reload
        window.location.href = "/";
      }
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Also handle navigationType as additional check
  useEffect(() => {
    if (navigationType === "POP") {
      cleanup();
      window.location.href = "/";
    }
  }, [navigationType]);

  // Handle page unload (browser close, refresh, etc.)
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanup();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

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
        case "chat-message":
          setMsg((prev) => [
            ...prev,
            { senderId: message.senderId, msg: message.msg },
          ]);
          break;
        case "error":
          alert(message.message);
          console.log(message);
          //window.location.href = "/";
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

    let incomingFileInfo = null;
    let incomingFileData = [];

    dataChannel.onopen = () =>
      console.log(`Data channel open with ${targetUserId}`);

    dataChannel.onmessage = (event) => {
      if (typeof event.data === "string") {
        if (event.data === "EOF") {
          const receivedBlob = new Blob(incomingFileData);
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(receivedBlob);
          downloadLink.download = incomingFileInfo?.fileName || "download";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          downloadLink.remove();
          URL.revokeObjectURL(downloadLink.href);

          console.log(`Download complete: ${incomingFileInfo?.fileName}`);
          incomingFileInfo = null;
          incomingFileData = [];
        } else {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "metadata") {
            incomingFileInfo = parsed;
            incomingFileData = [];
            console.log(
              `Receiving file: ${parsed.fileName} (${parsed.fileSize} bytes)`
            );
          }
        }
      } else {
        incomingFileData.push(event.data);
      }
    };

    dataChannel.onclose = () => dataChannels.current.delete(targetUserId);
  };

  const sendFile = (targetUserId, file) => {
    const dataChannel = dataChannels.current.get(targetUserId);
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
        dataChannel.send("EOF");
      }
    };

    sendNextChunk();
  };

  const sendMessage = (textMsg) => {
    if (textMsg.trim() !== "") {
      socket.send(
        JSON.stringify({
          type: "chat-message",
          senderId: userId.current,
          msg: textMsg,
        })
      );
      setMsg((prev) => [
        ...prev,
        { senderId: userId.current, msg: textMsg },
      ]);
    }
  };

  console.log(users);

  return (
    <RoomLayout
      hostName={userName}
      hostId = {userId.current}
      users={users}
      roomId={roomId}
      sendFile={sendFile}
      msg={msg}
      sendMessage={sendMessage}
    ></RoomLayout>
  );
}

export default Room;
