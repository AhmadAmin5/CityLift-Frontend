export function unwrapEntity(data, key) {
  if (!data) return null;
  return data[key] || data;
}

export function getRideFromResponse(data) {
  return unwrapEntity(data, "ride");
}

export function getDriverFromResponse(data) {
  return unwrapEntity(data, "driver");
}

export function getReceiptFromResponse(data) {
  return unwrapEntity(data, "receipt");
}

export function getLiveStateFromResponse(data) {
  return unwrapEntity(data, "live_state");
}

export function getRouteFromResponse(data) {
  return unwrapEntity(data, "route");
}

export function getRatingFromResponse(data) {
  return unwrapEntity(data, "rating");
}
