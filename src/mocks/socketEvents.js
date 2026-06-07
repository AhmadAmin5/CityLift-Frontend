const listeners = new Map();

function getSet(eventName) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  return listeners.get(eventName);
}

export function onMockSocketEvent(eventName, callback) {
  getSet(eventName).add(callback);
  return () => offMockSocketEvent(eventName, callback);
}

export function offMockSocketEvent(eventName, callback) {
  const eventListeners = listeners.get(eventName);
  if (!eventListeners) return;
  eventListeners.delete(callback);
}

export function emitMockSocketEvent(eventName, payload) {
  const eventListeners = listeners.get(eventName);
  if (!eventListeners) return;

  for (const callback of eventListeners) {
    callback(payload);
  }
}

export function createMockSocket() {
  const socket = {
    connected: true,
    on(eventName, callback) {
      onMockSocketEvent(eventName, callback);
      return socket;
    },
    off(eventName, callback) {
      offMockSocketEvent(eventName, callback);
      return socket;
    },
    emit(eventName, payload, callback) {
      if (eventName === "ride:join") {
        emitMockSocketEvent("ride:joined", payload);
        if (typeof callback === "function") {
          callback({
            success: true,
            message: "Joined ride room",
            data: { ride_id: payload.ride_id },
          });
        }
      }

      if (eventName === "ride:leave") {
        emitMockSocketEvent("ride:left", payload);
      }

      if (eventName === "driver:location:update") {
        emitMockSocketEvent("ride:live:update", payload);
      }

      if (eventName === "ride:tracking:update") {
        emitMockSocketEvent("ride:live:update", {
          live_state: {
            ride_id: payload.ride_id,
            rider_id: payload.rider_id || "rider_001",
            driver_id: payload.driver_id || "driver_001",
            status: payload.status || "started",
            current_location: {
              latitude: payload.latitude,
              longitude: payload.longitude,
            },
            current_route_id: payload.current_route_id || "route_uuid",
            eta_min: payload.eta_min,
            distance_remaining_km: payload.distance_remaining_km,
            updated_at: new Date().toISOString(),
          },
        });
      }

      return socket;
    },
    disconnect() {
      socket.connected = false;
    },
    connect() {
      socket.connected = true;
      return socket;
    },
  };

  return socket;
}
