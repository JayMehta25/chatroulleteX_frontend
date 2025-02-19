// socket.js
import { io } from "socket.io-client";

const socket = io("https://chatroulletexbackend-production-adb8.up.railway.app", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
