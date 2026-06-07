import { useEffect, useMemo } from "react";
import { createSocket } from "@/socket/socket";
import { getAccessToken } from "@/utils/tokenStorage";

export function useRideSocket({ rideId, handlers = {}, enabled = true }) {
  const accessToken = getAccessToken();
  const stableHandlers = useMemo(() => handlers, [handlers]);

  const socket = useMemo(() => {
    if (!enabled || !accessToken) return null;
    return createSocket(accessToken);
  }, [accessToken, enabled]);

  useEffect(() => {
    if (!socket) return undefined;

    const subscriptions = [
      ["ride:status:update", stableHandlers.onStatusUpdate],
      ["ride:live:update", stableHandlers.onLiveUpdate],
      ["ride:route:update", stableHandlers.onRouteUpdate],
      ["ride:cancelled", stableHandlers.onCancelled],
      ["ride:offer", stableHandlers.onOffer],
      ["ride:offer:expired", stableHandlers.onOfferExpired],
      ["nearby_drivers:update", stableHandlers.onNearbyDriversUpdate],
      ["surge:update", stableHandlers.onSurgeUpdate],
    ].filter(([, handler]) => Boolean(handler));

    subscriptions.forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
    });

    if (rideId) {
      socket.emit("ride:join", { ride_id: rideId });
    }

    return () => {
      if (rideId) {
        socket.emit("ride:leave", { ride_id: rideId });
      }

      subscriptions.forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });
    };
  }, [socket, rideId, stableHandlers]);

  return socket;
}

