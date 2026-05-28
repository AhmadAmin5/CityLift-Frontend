export const queryKeys = {
  me: ["me"],

  riderProfile: ["rider", "me"],
  savedPlaces: ["rider", "saved_places"],

  driverProfile: ["driver", "me"],
  driverVehicles: ["driver", "vehicles"],
  driverDocuments: ["driver", "documents"],
  driverOffers: (status) => ["driver", "offers", status || "all"],
  driverEarnings: (period, from, to) => [
    "driver",
    "earnings",
    period,
    from,
    to,
  ],
  driverRatings: ["driver", "ratings"],

  rides: (filters) => ["rides", filters || {}],
  ride: (rideId) => ["rides", rideId],
  rideLive: (rideId) => ["rides", rideId, "live"],
  rideRoute: (rideId, routeType) => [
    "rides",
    rideId,
    "route",
    routeType || "default",
  ],
  rideTracking: (rideId) => ["rides", rideId, "tracking"],
  rideReceipt: (rideId) => ["rides", rideId, "receipt"],

  mapConfig: ["maps", "config"],
  nearbyDrivers: (lat, lng, radiusKm) => [
    "maps",
    "nearby_drivers",
    lat,
    lng,
    radiusKm,
  ],
  surgeZones: (city) => ["maps", "surge_zones", city || "default"],

  adminPricingRules: ["admin", "pricing_rules"],
  adminMlModels: ["admin", "ml_models"],
  adminPredictionLogs: (rideId) => [
    "admin",
    "rides",
    rideId,
    "fare_prediction_logs",
  ],
};