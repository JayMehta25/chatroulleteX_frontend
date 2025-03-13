// socket.js
import { io } from "socket.io-client";

const socket = io("https://chatroulletexbackend-production-adb8.up.railway.app", {
  withCredentials: true,
  transports: ['websocket'], // Force WebSocket first
  reconnectionAttempts: 5,
  path: '/socket.io/'
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});

export default socket;
