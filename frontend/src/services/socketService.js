import { io } from "socket.io-client";

const SOCKET_URL = "http://127.0.0.1:8000";

// Single shared socket instance
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

/**
 * Call this once the Firebase user is known.
 * The user joins their own room so only their events are received.
 */
export const joinUserRoom = (userId) => {
  if (userId) {
    socket.emit("join", { user_id: userId });
  }
};

export default socket;
