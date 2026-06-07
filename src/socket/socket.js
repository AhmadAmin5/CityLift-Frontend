import { io } from "socket.io-client";
import { API_BASE_URL } from "@/api/client";
import { createMockSocket } from "@/mocks/socketEvents";

let socketInstance = null;
let currentToken = null;

export function createSocket(accessToken) {
  const isMock = import.meta.env.VITE_USE_MOCK_API === "true";

  if (!accessToken) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      currentToken = null;
    }
    return null;
  }

  if (isMock) {
    if (!socketInstance || currentToken !== accessToken) {
      console.log("[SocketManager] Creating mock socket connection...");
      socketInstance = createMockSocket(accessToken);
      currentToken = accessToken;
    }
    return socketInstance;
  }

  // Real Socket.IO connection
  if (socketInstance && currentToken === accessToken) {
    return socketInstance;
  }

  if (socketInstance) {
    console.log("[SocketManager] Disconnecting existing socket...");
    socketInstance.disconnect();
  }

  // Dynamically resolve URL:
  // e.g. "http://localhost:8000/api/v1" -> "http://localhost:8000/realtime"
  // e.g. "/api/v1" -> "/realtime"
  const socketUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "") + "/realtime";
  console.log(`[SocketManager] Connecting to real Socket.IO at ${socketUrl}...`);

  socketInstance = io(socketUrl, {
    auth: {
      token: accessToken,
    },
    transports: ["websocket", "polling"],
  });

  socketInstance.on("connect", () => {
    console.log("[SocketManager] Socket connected successfully! ID:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("[SocketManager] Socket disconnected. Reason:", reason);
  });

  socketInstance.on("connect_error", (error) => {
    console.error("[SocketManager] Socket connection error:", error);
  });

  currentToken = accessToken;
  return socketInstance;
}
