// socket.js
import { io } from "socket.io-client";

const socket = io("https://chatroulletexbackend-production-adb8.up.railway.app/", {
  transports: ["websocket"],
  methods: ["GET", "POST"],
  withCredentials: true,
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});

// Handle other events as needed

export default socket;
