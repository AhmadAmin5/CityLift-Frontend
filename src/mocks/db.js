const timestamp = "2026-05-23T10:00:00Z";

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix) {
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${random}`;
}

export const TOKENS = {
  rider: "mock_access_token_rider",
  driver: "mock_access_token_driver",
  admin: "mock_access_token_admin",
};

export const db = {
  users: [
    {
      id: "user_rider_001",
      name: "Ali Khan",
      email: "rider@test.com",
      phone: "+923001234567",
      password: "password123",
      role: "rider",
      profile_photo_url: null,
      email_verified_at: timestamp,
      phone_verified_at: timestamp,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "user_driver_001",
      name: "Ahmed Raza",
      email: "driver@test.com",
      phone: "+923009876543",
      password: "password123",
      role: "driver",
      profile_photo_url: null,
      email_verified_at: timestamp,
      phone_verified_at: timestamp,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "user_admin_001",
      name: "Admin User",
      email: "admin@test.com",
      phone: "+923001111111",
      password: "password123",
      role: "admin",
      profile_photo_url: null,
      email_verified_at: timestamp,
      phone_verified_at: timestamp,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],

  riders: [
    {
      id: "rider_001",
      user_id: "user_rider_001",
      average_rating: 5.0,
      total_rides: 3,
    },
  ],

  drivers: [
    {
      id: "driver_001",
      user_id: "user_driver_001",
      average_rating: 4.8,
      total_rides: 15,
      is_available: false,
      approval_status: "approved",
      online_accumulated_ms: 16200000,
      online_session_start: null,
    },
  ],

  vehicles: [
    {
      id: "vehicle_001",
      driver_id: "driver_001",
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      plate_number: "LEA-1234",
      color: "White",
      vehicle_type: "car",
      is_active: true,
      verification_status: "approved",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],

  driverDocuments: [
    {
      id: "document_001",
      driver_id: "driver_001",
      vehicle_id: null,
      document_type: "cnic",
      file_url: "https://example.com/uploads/cnic.jpg",
      status: "pending",
      rejection_reason: null,
      uploaded_at: timestamp,
      verified_at: null,
    },
    {
      id: "document_002",
      driver_id: "driver_001",
      vehicle_id: "vehicle_001",
      document_type: "vehicle_registration",
      file_url: "https://example.com/uploads/vehicle-registration.jpg",
      status: "approved",
      rejection_reason: null,
      uploaded_at: timestamp,
      verified_at: timestamp,
    },
  ],

  savedPlaces: [
    {
      id: "saved_place_001",
      rider_id: "rider_001",
      label: "Home",
      place_type: "home",
      latitude: 31.5204,
      longitude: 74.3587,
      address: "Gulberg, Lahore",
      provider: "mapbox",
      provider_place_id: "mapbox.place.home",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "saved_place_002",
      rider_id: "rider_001",
      label: "Work",
      place_type: "work",
      latitude: 31.4697,
      longitude: 74.2728,
      address: "Johar Town, Lahore",
      provider: "mapbox",
      provider_place_id: "mapbox.place.work",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],

  pricingRules: [
    {
      id: "pricing_rule_001",
      city: "Lahore",
      vehicle_type: "car",
      base_fare: 100,
      per_km_rate: 40,
      per_min_rate: 8,
      waiting_per_min_rate: 5,
      traffic_delay_per_min_rate: 4,
      minimum_fare: 250,
      peak_start_time: "17:00:00",
      peak_end_time: "21:00:00",
      peak_multiplier: 1.2,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],

  surgeZones: [
    {
      id: "lahore_gulberg",
      city: "Lahore",
      area_name: "Gulberg",
      center: {
        latitude: 31.5204,
        longitude: 74.3587,
      },
      radius_km: 3,
      demand_count: 25,
      available_drivers: 8,
      supply_demand_ratio: 3.13,
      surge_multiplier: 1.5,
      updated_at: timestamp,
    },
    {
      id: "lahore_johar_town",
      city: "Lahore",
      area_name: "Johar Town",
      center: {
        latitude: 31.4697,
        longitude: 74.2728,
      },
      radius_km: 2.5,
      demand_count: 18,
      available_drivers: 10,
      supply_demand_ratio: 1.8,
      surge_multiplier: 1.2,
      updated_at: timestamp,
    },
  ],

  nearbyDrivers: [
    {
      driver_id: "driver_001",
      vehicle_id: "vehicle_001",
      is_available: true,
      average_rating: 4.8,
      latitude: 31.5212,
      longitude: 74.3568,
      heading: 90,
      speed_kmph: 28,
      current_area: "Gulberg",
      updated_at: timestamp,
    },
    {
      driver_id: "driver_002",
      vehicle_id: "vehicle_002",
      is_available: true,
      average_rating: 4.6,
      latitude: 31.5188,
      longitude: 74.3611,
      heading: 120,
      speed_kmph: 22,
      current_area: "Gulberg",
      updated_at: timestamp,
    },
  ],

  rides: [],
  rideOffers: [],
  ratings: [],
  trackingPoints: [],
  receipts: [],

  mlModels: [
    {
      id: "ml_model_001",
      model_name: "fare_prediction_linear_regression_v1",
      model_type: "linear_regression",
      status: "active",
      version: "1.0.0",
      accuracy_score: 0.88,
      trained_at: timestamp,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],

  farePredictionLogs: [],
};

export function publicUser(user) {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
}

export function getUserByToken(token) {
  if (!token) return null;

  if (token === TOKENS.rider) {
    return db.users.find((user) => user.role === "rider");
  }

  if (token === TOKENS.driver) {
    return db.users.find((user) => user.role === "driver");
  }

  if (token === TOKENS.admin) {
    return db.users.find((user) => user.role === "admin");
  }

  if (token.startsWith("mock_access_token_user_")) {
    const userId = token.replace("mock_access_token_", "");
    return db.users.find((user) => user.id === userId);
  }

  return null;
}

export function getAuthUser(request) {
  const header = request.headers.get("Authorization") || "";
  const token = header.replace("Bearer ", "").trim();
  return getUserByToken(token);
}

export function getAuthPayload(user) {
  const rider = db.riders.find((item) => item.user_id === user.id) || null;
  const driver = db.drivers.find((item) => item.user_id === user.id) || null;

  return {
    user: publicUser(user),
    rider,
    driver: driver
      ? {
          ...driver,
          user: publicUser(user),
          active_vehicle:
            db.vehicles.find(
              (vehicle) => vehicle.driver_id === driver.id && vehicle.is_active
            ) || null,
        }
      : null,
  };
}

export function requireAuth(request) {
  return getAuthUser(request);
}

export function getCurrentRider(user) {
  return db.riders.find((rider) => rider.user_id === user?.id) || null;
}

export function getCurrentDriver(user) {
  return db.drivers.find((driver) => driver.user_id === user?.id) || null;
}

export function getDriverWithRelations(driver) {
  if (!driver) return null;
  const user = db.users.find((item) => item.id === driver.user_id);

  // Dynamic online hours calculation
  const totalMs = (driver.online_accumulated_ms || 0) + 
    (driver.is_available && driver.online_session_start ? (Date.now() - new Date(driver.online_session_start).getTime()) : 0);
  const onlineHours = Math.round((totalMs / 3600000) * 10) / 10;

  // Dynamic acceptance rate calculation
  const driverOffers = db.rideOffers.filter((o) => o.driver_id === driver.id);
  const accepted = driverOffers.filter((o) => o.status === "accepted").length;
  const baselineAccepted = driver.total_rides || 15;
  const baselineTotal = Math.round(baselineAccepted * 1.07) || 16;
  const total = baselineTotal + driverOffers.length;
  const totalAccepted = baselineAccepted + accepted;
  const acceptanceRate = total > 0 ? Math.round((totalAccepted / total) * 100) : 100;

  return {
    ...driver,
    online_hours: onlineHours,
    acceptance_rate: acceptanceRate,
    user: publicUser(user),
    active_vehicle:
      db.vehicles.find(
        (vehicle) => vehicle.driver_id === driver.id && vehicle.is_active
      ) || null,
  };
}

export function getRiderWithRelations(rider) {
  if (!rider) return null;
  const user = db.users.find((item) => item.id === rider.user_id);
  return {
    ...rider,
    user: publicUser(user),
  };
}

export function getRideById(rideId) {
  return db.rides.find((ride) => ride.id === rideId) || null;
}

export function makeLocation(input = {}) {
  return {
    latitude: Number(input.latitude || 31.5204),
    longitude: Number(input.longitude || 74.3587),
    address: input.address || "Gulberg, Lahore",
    provider: input.provider || "mapbox",
    provider_place_id: input.provider_place_id || null,
  };
}

export function makeRoute(rideId, routeType = "pickup_to_dropoff") {
  return {
    route_id: `route_${rideId}_${routeType}`,
    ride_id: rideId,
    route_type: routeType,
    provider: "mapbox",
    selected: true,
    distance_km: 12.4,
    normal_duration_min: 26,
    traffic_duration_min: 33,
    traffic_delay_min: 7,
    polyline: "}_p~F~ps|U_ulLnnqC_mqNvxq`@",
    steps: [
      {
        instruction: "Head east on Main Boulevard",
        distance_meters: 800,
        duration_seconds: 180,
        start_location: {
          latitude: 31.5204,
          longitude: 74.3587,
        },
        end_location: {
          latitude: 31.522,
          longitude: 74.36,
        },
      },
      {
        instruction: "Continue toward Johar Town",
        distance_meters: 11600,
        duration_seconds: 1800,
        start_location: {
          latitude: 31.522,
          longitude: 74.36,
        },
        end_location: {
          latitude: 31.4697,
          longitude: 74.2728,
        },
      },
    ],
    created_at: nowIso(),
  };
}

export function makeFareEstimate(overrides = {}) {
  const base = {
    currency: "PKR",
    estimated_distance_km: 12.4,
    estimated_duration_min: 33,
    estimated_traffic_delay_min: 7,
    base_fare: 100,
    per_km_rate: 40,
    per_min_rate: 8,
    waiting_per_min_rate: 5,
    traffic_delay_per_min_rate: 4,
    minimum_fare: 250,
    peak_multiplier: 1.2,
    surge_multiplier: 1.2,
    surge_zone_id: "lahore_gulberg",
    pre_ride_formula_fare: 700,
    pre_ride_ml_predicted_fare: 720,
    estimated_min_fare: 630,
    estimated_max_fare: 770,
    model_used: "fare_prediction_linear_regression_v1",
  };

  return {
    ...base,
    ...overrides,
  };
}

export function makeRideFare(rideId, estimate = makeFareEstimate()) {
  return {
    id: makeId("fare"),
    ride_id: rideId,
    pricing_rule_id: "pricing_rule_001",
    currency: estimate.currency,
    estimated_distance_km: estimate.estimated_distance_km,
    estimated_duration_min: estimate.estimated_duration_min,
    estimated_traffic_delay_min: estimate.estimated_traffic_delay_min,
    pre_ride_ml_predicted_fare: estimate.pre_ride_ml_predicted_fare,
    pre_ride_formula_fare: estimate.pre_ride_formula_fare,
    estimated_min_fare: estimate.estimated_min_fare,
    estimated_max_fare: estimate.estimated_max_fare,
    actual_distance_km: null,
    actual_duration_min: null,
    actual_traffic_delay_min: null,
    waiting_time_min: 0,
    base_fare: estimate.base_fare,
    per_km_rate: estimate.per_km_rate,
    per_min_rate: estimate.per_min_rate,
    waiting_per_min_rate: estimate.waiting_per_min_rate,
    traffic_delay_per_min_rate: estimate.traffic_delay_per_min_rate,
    peak_multiplier: estimate.peak_multiplier,
    surge_multiplier: estimate.surge_multiplier,
    minimum_fare: estimate.minimum_fare,
    final_ml_predicted_fare: null,
    final_formula_fare: null,
    cancellation_fee: 0,
    final_fare: null,
    fare_policy: "metered_after_ride",
    model_used: estimate.model_used,
    created_at: nowIso(),
    finalized_at: null,
  };
}

export function makeRideLiveState(ride) {
  const driverLocation = db.nearbyDrivers[0];

  return {
    ride_id: ride.id,
    rider_id: ride.rider_id,
    driver_id: ride.driver_id || "driver_001",
    status: ride.status,
    current_location: {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
    },
    current_route_id: ride.selected_route_id || `route_${ride.id}`,
    eta_min: ride.status === "started" ? 14 : 5,
    distance_remaining_km: ride.status === "started" ? 6.3 : 1.4,
    updated_at: nowIso(),
  };
}

export function attachRideRelations(ride) {
  if (!ride) return null;

  const driver = db.drivers.find((item) => item.id === ride.driver_id) || null;
  const vehicle = db.vehicles.find((item) => item.id === ride.vehicle_id) || null;

  return {
    ...ride,
    driver: driver ? getDriverWithRelations(driver) : null,
    vehicle,
  };
}

export function paginate(items, page = 1, limit = 20) {
  const normalizedPage = Number(page || 1);
  const normalizedLimit = Number(limit || 20);
  const start = (normalizedPage - 1) * normalizedLimit;
  const data = items.slice(start, start + normalizedLimit);

  return {
    data,
    meta: {
      page: normalizedPage,
      limit: normalizedLimit,
      total: items.length,
      total_pages: Math.max(1, Math.ceil(items.length / normalizedLimit)),
    },
  };
}
