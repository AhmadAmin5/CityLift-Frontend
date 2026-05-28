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
    emit(eventName, payload) {
      if (eventName === "ride:join") {
        emitMockSocketEvent("ride:joined", payload);
      }

      if (eventName === "ride:leave") {
        emitMockSocketEvent("ride:left", payload);
      }

      if (eventName === "driver:location:update") {
        emitMockSocketEvent("ride:live:update", payload);
      }

      if (eventName === "ride:tracking:update") {
        emitMockSocketEvent("ride:live:update", payload);
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
