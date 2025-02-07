import io from "socket.io-client";

// Replace with your actual Ngrok backend URL
const socket = io("https://ec9d-14-139-125-227.ngrok-free.app", {
    transports: ["websocket"],
});

export default socket;
