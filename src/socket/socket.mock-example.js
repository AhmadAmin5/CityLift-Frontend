import { io } from "socket.io-client";
import { createMockSocket } from "@/mocks/socketEvents";

export function createSocket(accessToken) {
  if (import.meta.env.VITE_USE_MOCK_API === "true") {
    return createMockSocket(accessToken);
  }

  const baseUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_ORIGIN ||
    "http://localhost:5000";

  return io(`${baseUrl}/realtime`, {
    auth: {
      token: accessToken,
    },
    transports: ["websocket"],
  });
}
