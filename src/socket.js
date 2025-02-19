// socket.js
import { io } from "socket.io-client";

const socket = io("chatroulletexbackend-production.up.railway.app", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
