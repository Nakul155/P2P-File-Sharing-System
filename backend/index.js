import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

const userIdWebSocket = new Map();
const webSocketUserId = new Map();
const roomIdMembers = new Map();
const userIdroomId = new Map();

wss.on("connection", (ws) => {
  ws.on("error", (err) => console.error("WebSocket error:", err));

  ws.on("close", () => {
    const userId = webSocketUserId.get(ws);
    if (!userId) {
      return;
    }
    const roomId = userIdroomId.get(userId);
    if (!roomId) {
      userIdWebSocket.delete(userId);
      webSocketUserId.delete(ws);
      return;
    }
    console.log(`${userId} has left the ${roomId}`);
    const members = roomIdMembers.get(roomId);
    members.forEach((memberId) => {
      const memberWs = userIdWebSocket.get(memberId);
      if (memberId !== userId) {
        memberWs.send(JSON.stringify({ type: "member-left", userId: userId }));
      } else {
        userIdWebSocket.delete(memberId);
        webSocketUserId.delete(memberWs);
        userIdroomId.delete(memberId);
      }
    });
    const updatedMembers = members.filter((memberId) => memberId !== userId);
    if (!updatedMembers.length) {
      roomIdMembers.delete(roomId);
    } else {
      roomIdMembers.set(roomId, updatedMembers);
    }
  });

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    if (message.type === "create-room") {
      // {type = "create-room"}
      const roomId = uuidv4();
      roomIdMembers.set(roomId, []);
      ws.send(JSON.stringify({ type: "room", roomId }));
    } else if (message.type === "join-room") {
      // {type = "join-room", roomId}
      const roomId = message.roomId;
      if (!roomIdMembers.has(roomId)) {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
        return;
      }
      const room = roomIdMembers.get(roomId);
      if (room.length == 5) {
        ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
        return;
      }
      const userId = uuidv4();
      userIdWebSocket.set(userId, ws);
      webSocketUserId.set(ws, userId);
      ws.send(JSON.stringify({ type: "user", userId: userId }));
      room.forEach((memberId) => {
        if (memberId !== userId) {
          const memberWs = userIdWebSocket.get(memberId);
          memberWs.send(
            JSON.stringify({
              type: "new-member",
              userId: userId,
              userName: message.userName,
            })
          );
        }
      });
      console.log(`${message.userName} joined the room ${roomId}`);
      room.push(userId);
      roomIdMembers.set(roomId, room);
      userIdroomId.set(userId, roomId);
    } else if (
      message.type === "create-offer" ||
      message.type === "create-answer"
    ) {
      // {type = "create-offer/answer", targetUserId}
      const roomId = userIdroomId.get(message.targetUserId);
      const targetUserId = message.targetUserId;
      const targetPeerWs = userIdWebSocket.get(targetUserId);
      console.log(
        `${message.userId} has sent ${message.type} to ${targetUserId}`
      );
      if (!roomIdMembers.has(roomId) || !targetPeerWs) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Room or target user not found",
          })
        );
        return;
      }
      const type = message.type === "create-offer" ? "offer" : "answer";
      targetPeerWs?.send(
        JSON.stringify({
          type: type,
          sdp: message.sdp,
          userId: message.userId,
          userName: message.userName,
        })
      );
    } else if (message.type === "ice-candidate") {
      const roomId = userIdroomId.get(message.targetUserId);
      const targetUserId = message.targetUserId;
      const targetPeerWs = userIdWebSocket.get(targetUserId);
      if (!roomIdMembers.has(roomId) || !targetPeerWs) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Room or target user not found",
          })
        );
        return;
      }
      targetPeerWs?.send(
        JSON.stringify({
          type: "ice-candidate",
          candidate: message.candidate,
          userId: message.userId,
        })
      );
      console.log(
        `${message.userId} has sent ice-candidate to ${targetUserId}`
      );
    } else if (message.type === "chat-message") {
      // {type = "chat-message", roomId, msg, senderId}
      const roomId = userIdroomId.get(message.senderId);
      const room = roomIdMembers.get(roomId);
      console.log(message);
      room.forEach((memberId) => {
        if (memberId !== message.senderId) {
          const memberWs = userIdWebSocket.get(memberId);
          memberWs.send(
            JSON.stringify({
              type: "chat-message",
              senderId: message.senderId,
              msg: message.msg,
            })
          );
        }
      });
    }
  });
});
