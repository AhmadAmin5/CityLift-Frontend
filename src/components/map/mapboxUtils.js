export function isRealMapboxToken(token) {
  return Boolean(
    token &&
      typeof token === "string" &&
      token.startsWith("pk.") &&
      !token.toLowerCase().includes("fake") &&
      !token.toLowerCase().includes("mock")
  );
}

export function getRouteCoordinates(route) {
  if (!route) return [];

  if (Array.isArray(route.coordinates)) {
    return route.coordinates;
  }

  if (Array.isArray(route.geometry?.coordinates)) {
    return route.geometry.coordinates;
  }

  if (typeof route.polyline === "string" && route.polyline.trim()) {
    return decodePolyline(route.polyline);
  }

  return [];
}

export function decodePolyline(encoded) {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];

  while (index < encoded.length) {
    let byte = null;
    let shift = 0;
    let result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

export function makeDriverMarkerElement() {
  const markerEl = document.createElement("div");

  markerEl.className =
    "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#008C78] shadow-card";

  markerEl.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8l-2 4-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  `;

  return markerEl;
}