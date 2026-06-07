/**
 * Platform-aware geolocation helpers.
 *
 * On native (Capacitor), we use @capacitor/geolocation which requires explicit
 * permission requests.  On the **web** the Capacitor plugin throws
 * "Not implemented on web" for checkPermissions / requestPermissions /
 * watchPosition, so we fall back to the standard browser Geolocation API.
 */

import { Geolocation } from "@capacitor/geolocation";

/* ------------------------------------------------------------------ */
/*  Detect runtime                                                     */
/* ------------------------------------------------------------------ */

function isNativePlatform() {
  try {
    // Capacitor exposes window.Capacitor on native shells
    return (
      typeof window !== "undefined" &&
      window.Capacitor &&
      window.Capacitor.isNativePlatform &&
      window.Capacitor.isNativePlatform()
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Web fallback helpers                                                */
/* ------------------------------------------------------------------ */

function webCheckPermissions() {
  return Promise.resolve({ location: "granted" });
}

function webRequestPermissions() {
  return Promise.resolve({ location: "granted" });
}

let _nextWebWatchId = 1;

function webWatchPosition(options, callback) {
  if (!navigator.geolocation) {
    callback(null, new Error("Geolocation not supported in this browser"));
    return Promise.resolve(String(_nextWebWatchId++));
  }

  const id = navigator.geolocation.watchPosition(
    (position) => callback(position, null),
    (error) => callback(null, error),
    {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 15000,
      maximumAge: options?.maximumAge ?? 0,
    }
  );

  return Promise.resolve(String(id));
}

function webClearWatch({ id }) {
  if (navigator.geolocation && id != null) {
    navigator.geolocation.clearWatch(Number(id));
  }
  return Promise.resolve();
}

function webGetCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported in this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 0,
      }
    );
  });
}

/* ------------------------------------------------------------------ */
/*  Unified API                                                        */
/* ------------------------------------------------------------------ */

const PlatformGeolocation = isNativePlatform()
  ? Geolocation
  : {
      checkPermissions: webCheckPermissions,
      requestPermissions: webRequestPermissions,
      watchPosition: webWatchPosition,
      clearWatch: webClearWatch,
      getCurrentPosition: webGetCurrentPosition,
    };

export { PlatformGeolocation };
