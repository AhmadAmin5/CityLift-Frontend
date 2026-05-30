export function isRealMapboxToken(token) {
  return Boolean(
    token &&
      typeof token === "string" &&
      token.startsWith("pk.") &&
      !token.toLowerCase().includes("fake") &&
      !token.toLowerCase().includes("mock")
  );
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function normalizeLngLatPair(pair) {
  if (!Array.isArray(pair) || pair.length < 2) return null;

  const first = Number(pair[0]);
  const second = Number(pair[1]);

  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;

  /**
   * Mapbox needs [longitude, latitude].
   *
   * If the backend accidentally sends [latitude, longitude], this fixes it.
   * Lahore example:
   * - latitude is usually around 31
   * - longitude is usually around 74
   */
  const firstLooksLikeLat = Math.abs(first) <= 90;
  const secondLooksLikeLng = Math.abs(second) <= 180;
  const firstLooksLikeLng = Math.abs(first) <= 180;
  const secondLooksLikeLat = Math.abs(second) <= 90;

  if (
    firstLooksLikeLat &&
    secondLooksLikeLng &&
    Math.abs(first) < Math.abs(second)
  ) {
    return [second, first];
  }

  if (firstLooksLikeLng && secondLooksLikeLat) {
    return [first, second];
  }

  return [first, second];
}

function normalizeCoordinates(coordinates) {
  if (!Array.isArray(coordinates)) return [];

  return coordinates
    .map(normalizeLngLatPair)
    .filter(Boolean);
}

function readCoordinatesFromAnyShape(route) {
  const candidates = [
    route?.coordinates,
    route?.geometry?.coordinates,
    route?.route?.coordinates,
    route?.route?.geometry?.coordinates,
    route?.data?.coordinates,
    route?.data?.geometry?.coordinates,
    route?.data?.route?.coordinates,
    route?.data?.route?.geometry?.coordinates,
    route?.overview_polyline?.coordinates,
    route?.polyline?.coordinates,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeCoordinates(candidate);

    if (normalized.length >= 2) {
      return normalized;
    }
  }

  return [];
}

function readPolylineFromAnyShape(route) {
  const candidates = [
    route?.polyline,
    route?.encoded_polyline,
    route?.overview_polyline,
    route?.geometry,
    route?.route?.polyline,
    route?.route?.encoded_polyline,
    route?.route?.overview_polyline,
    route?.route?.geometry,
    route?.data?.polyline,
    route?.data?.encoded_polyline,
    route?.data?.overview_polyline,
    route?.data?.geometry,
    route?.data?.route?.polyline,
    route?.data?.route?.encoded_polyline,
    route?.data?.route?.overview_polyline,
    route?.data?.route?.geometry,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    if (typeof candidate?.points === "string" && candidate.points.trim()) {
      return candidate.points;
    }

    if (typeof candidate?.polyline === "string" && candidate.polyline.trim()) {
      return candidate.polyline;
    }
  }

  return null;
}

function readFallbackLineFromStops(route) {
  const pickup =
    route?.pickup ||
    route?.origin ||
    route?.start ||
    route?.from ||
    route?.route?.pickup ||
    route?.route?.origin;

  const dropoff =
    route?.dropoff ||
    route?.destination ||
    route?.end ||
    route?.to ||
    route?.route?.dropoff ||
    route?.route?.destination;

  if (
    isFiniteNumber(pickup?.latitude) &&
    isFiniteNumber(pickup?.longitude) &&
    isFiniteNumber(dropoff?.latitude) &&
    isFiniteNumber(dropoff?.longitude)
  ) {
    return [
      [Number(pickup.longitude), Number(pickup.latitude)],
      [Number(dropoff.longitude), Number(dropoff.latitude)],
    ];
  }

  return [];
}

export function getRouteCoordinates(route) {
  if (!route) return [];

  const directCoordinates = readCoordinatesFromAnyShape(route);

  if (directCoordinates.length >= 2) {
    return directCoordinates;
  }

  const encodedPolyline = readPolylineFromAnyShape(route);

  if (encodedPolyline) {
    const decoded = decodePolyline(encodedPolyline);

    if (decoded.length >= 2) {
      return decoded;
    }
  }

  return readFallbackLineFromStops(route);
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
    } while (byte >= 0x20 && index < encoded.length);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return normalizeCoordinates(coordinates);
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