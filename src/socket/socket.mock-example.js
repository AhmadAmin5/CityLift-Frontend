import { createMockSocket } from "@/mocks/socketEvents";

export function createSocket(accessToken) {
  if (import.meta.env.VITE_USE_MOCK_API === "true") {
    return createMockSocket(accessToken);
  }

  return createMockSocket(accessToken);
}
