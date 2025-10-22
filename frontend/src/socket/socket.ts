import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:8088";
let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    // Chỉ log sau khi connect thành công
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket!.id);
      console.log("📡 Emitting register event with userId:", userId);
      socket!.emit("register", userId); // Gửi event "register" sau khi connect
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });
  }

  return socket;
};

export const getSocket = () => socket;
