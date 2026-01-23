// test-socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // URL server NestJS của bạn

socket.on("connect", () => {
  //console.log("✅ Connected to server:", socket.id);

  // 1️⃣ Test join room
  socket.emit("room:join", { roomId: "conversationId123" });

  // 2️⃣ Test create message
  socket.emit("message:create", {
    content: "Hello world",
    conversationId: "conversationId123",
    memberId: "memberId123",
  });
});

// Lắng nghe broadcast từ server
socket.on("message:all", (payload) => {
  //console.log("▼ message:all", payload);
});

socket.on("chat:conversationId123:messages", (payload) => {
  //console.log("▼ chat:conversationId123:messages", payload);
});

socket.on("Connected", (payload) => {
  //console.log("Phat:", payload);
});

socket.on("disconnect", () => {
  //console.log("❌ Disconnected from server");
});
