import { http } from "msw";
import { ok, created, fail, mockDelay } from "./responses";
import { emitMockSocketEvent } from "./socketEvents";
import {
  TOKENS,
  attachRideRelations,
  db,
  getAuthPayload,
  getAuthUser,
  getCurrentDriver,
  getCurrentRider,
  getDriverWithRelations,
  getRideById,
  getRiderWithRelations,
  makeFareEstimate,
  makeId,
  makeLocation,
  makeRideFare,
  makeRideLiveState,
  makeRoute,
  nowIso,
  paginate,
  publicUser,
} from "./db";

const API = "/api/v1";

function authOrFail(request) {
  const user = getAuthUser(request);
  if (!user) {
    return {
      user: null,
      response: fail("Unauthenticated", "UNAUTHENTICATED", 401),
    };
  }

  return { user, response: null };
}

function requireRole(request, role) {
  const { user, response } = authOrFail(request);
  if (response) return { user: null, response };
  if (user.role !== role) {
    return {
      user: null,
      response: fail("You are not allowed to perform this action", "FORBIDDEN", 403),
    };
  }
  return { user, response: null };
}

function getSearchParam(request, key, fallback = null) {
  const url = new URL(request.url);
  return url.searchParams.get(key) || fallback;
}

async function readJson(request, fallback = {}) {
  try {
    return await request.json();
  } catch {
    return fallback;
  }
}

function createOfferForRide(ride) {
  const existingOffer = db.rideOffers.find((offer) => offer.ride_id === ride.id);
  if (existingOffer) return existingOffer;

  const offer = {
    id: makeId("offer"),
    ride_id: ride.id,
    driver_id: "driver_001",
    status: "sent",
    distance_to_pickup_km: 1.4,
    driver_rating_at_offer: 4.8,
    decline_reason: null,
    offered_at: nowIso(),
    responded_at: null,
    expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
    ride: {
      id: ride.id,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      estimated_fare: {
        currency: ride.fare.currency,
        estimated_min_fare: ride.fare.estimated_min_fare,
        estimated_max_fare: ride.fare.estimated_max_fare,
      },
      rider_note_to_driver: ride.rider_note_to_driver,
    },
  };

  db.rideOffers.unshift(offer);

  globalThis.setTimeout(() => {
    emitMockSocketEvent("ride:offer", offer);
  }, 900);

  return offer;
}

function emitRideStatus(ride) {
  emitMockSocketEvent("ride:status:update", {
    ride_id: ride.id,
    status: ride.status,
    driver_id: ride.driver_id,
    vehicle_id: ride.vehicle_id,
    updated_at: nowIso(),
  });
}

function emitLiveUpdate(ride) {
  emitMockSocketEvent("ride:live:update", makeRideLiveState(ride));
}

function makeReceipt(ride) {
  const existing = db.receipts.find((receipt) => receipt.ride_id === ride.id);
  if (existing) return existing;

  const receipt = {
    id: makeId("receipt"),
    ride_id: ride.id,
    receipt_number: `RF-${String(db.receipts.length + 1).padStart(5, "0")}`,
    currency: "PKR",
    final_fare: ride.fare?.final_fare || 760,
    base_fare: ride.fare?.base_fare || 100,
    distance_fare: 496,
    duration_fare: 264,
    waiting_fare: ride.fare?.waiting_time_min ? ride.fare.waiting_time_min * 5 : 0,
    traffic_delay_fare: 28,
    surge_amount: 72,
    cancellation_fee: ride.fare?.cancellation_fee || 0,
    payment_method: "cash",
    payment_status: "paid",
    issued_at: nowIso(),
    ride: attachRideRelations(ride),
  };

  db.receipts.unshift(receipt);
  return receipt;
}

export const handlers = [
  // Auth
  http.post(`${API}/auth/login`, async ({ request }) => {
    await mockDelay();
    const body = await readJson(request);

    const user = db.users.find(
      (item) =>
        (item.email === body.email_or_phone || item.phone === body.email_or_phone) &&
        item.password === body.password
    );

    if (!user) {
      return fail("Invalid email/phone or password", "INVALID_CREDENTIALS", 401);
    }

    return ok(
      {
        access_token: TOKENS[user.role] || `mock_access_token_${user.id}`,
        ...getAuthPayload(user),
      },
      "Logged in successfully"
    );
  }),

  http.post(`${API}/auth/register/rider`, async ({ request }) => {
    await mockDelay();
    const body = await readJson(request);

    if (!body.name || !body.email || !body.phone || !body.password) {
      return fail("Validation failed", "VALIDATION_ERROR", 400, {
        fields: ["name", "email", "phone", "password"],
      });
    }

    if (db.users.some((user) => user.email === body.email || user.phone === body.phone)) {
      return fail("User already exists", "CONFLICT", 409);
    }

    const user = {
      id: makeId("user"),
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      role: "rider",
      profile_photo_url: null,
      email_verified_at: null,
      phone_verified_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    const rider = {
      id: makeId("rider"),
      user_id: user.id,
      average_rating: 5.0,
      total_rides: 0,
    };

    db.users.push(user);
    db.riders.push(rider);

    return created(
      {
        access_token: `mock_access_token_${user.id}`,
        user: publicUser(user),
        rider,
      },
      "Rider registered successfully"
    );
  }),

  http.post(`${API}/auth/register/driver`, async ({ request }) => {
    await mockDelay();
    const body = await readJson(request);

    if (!body.name || !body.email || !body.phone || !body.password) {
      return fail("Validation failed", "VALIDATION_ERROR", 400, {
        fields: ["name", "email", "phone", "password"],
      });
    }

    if (db.users.some((user) => user.email === body.email || user.phone === body.phone)) {
      return fail("User already exists", "CONFLICT", 409);
    }

    const user = {
      id: makeId("user"),
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      role: "driver",
      profile_photo_url: null,
      email_verified_at: null,
      phone_verified_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    const driver = {
      id: makeId("driver"),
      user_id: user.id,
      average_rating: 5.0,
      total_rides: 0,
      is_available: false,
      approval_status: "pending",
    };

    db.users.push(user);
    db.drivers.push(driver);

    return created(
      {
        access_token: `mock_access_token_${user.id}`,
        user: publicUser(user),
        driver,
      },
      "Driver registered successfully"
    );
  }),

  http.get(`${API}/auth/me`, async ({ request }) => {
    await mockDelay(150);
    const { user, response } = authOrFail(request);
    if (response) return response;

    return ok(getAuthPayload(user), "Current user fetched successfully");
  }),

  http.post(`${API}/auth/otp/send`, async ({ request }) => {
    await mockDelay();
    const { user, response } = authOrFail(request);
    if (response) return response;

    const body = await readJson(request);
    const channel = body.channel || "phone";

    return ok(
      {
        channel,
        destination: channel === "email" ? user.email : user.phone,
        mock_otp: "123456",
        expires_in_seconds: 300,
      },
      "Mock OTP sent successfully"
    );
  }),

  http.post(`${API}/auth/otp/verify`, async ({ request }) => {
    await mockDelay();
    const { user, response } = authOrFail(request);
    if (response) return response;

    const body = await readJson(request);

    if (body.otp !== "123456") {
      return fail("Invalid OTP", "INVALID_OTP", 400);
    }

    if (body.channel === "email") {
      user.email_verified_at = nowIso();
    } else {
      user.phone_verified_at = nowIso();
    }

    user.updated_at = nowIso();

    return ok({ user: publicUser(user) }, "OTP verified successfully");
  }),

  http.post(`${API}/auth/logout`, async () => {
    await mockDelay();
    return ok(null, "Logged out successfully");
  }),

  // Users
  http.patch(`${API}/users/me`, async ({ request }) => {
    await mockDelay();
    const { user, response } = authOrFail(request);
    if (response) return response;

    const body = await readJson(request);

    if (body.name !== undefined) user.name = body.name;
    if (body.email !== undefined && body.email !== user.email) {
      user.email = body.email;
      user.email_verified_at = null;
    }
    if (body.phone !== undefined && body.phone !== user.phone) {
      user.phone = body.phone;
      user.phone_verified_at = null;
    }
    user.updated_at = nowIso();

    return ok({ user: publicUser(user) }, "Profile updated successfully");
  }),

  http.post(`${API}/users/me/profile-photo`, async ({ request }) => {
    await mockDelay();
    const { user, response } = authOrFail(request);
    if (response) return response;

    user.profile_photo_url = "https://example.com/uploads/mock-profile-photo.jpg";
    user.updated_at = nowIso();

    return ok(
      {
        profile_photo_url: user.profile_photo_url,
        user: publicUser(user),
      },
      "Profile photo uploaded successfully"
    );
  }),

  // Rider
  http.get(`${API}/riders/me`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "rider");
    if (response) return response;

    return ok(getRiderWithRelations(getCurrentRider(user)), "Rider profile fetched successfully");
  }),

  http.get(`${API}/riders/me/saved-places`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "rider");
    if (response) return response;

    const rider = getCurrentRider(user);
    const places = db.savedPlaces.filter((place) => place.rider_id === rider.id);
    return ok(places, "Saved places fetched successfully");
  }),

  http.post(`${API}/riders/me/saved-places`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "rider");
    if (response) return response;

    const rider = getCurrentRider(user);
    const body = await readJson(request);
    const place = {
      id: makeId("saved_place"),
      rider_id: rider.id,
      label: body.label,
      place_type: body.place_type || "favorite",
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      address: body.address || null,
      provider: body.provider || "mapbox",
      provider_place_id: body.provider_place_id || null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.savedPlaces.push(place);
    return created(place, "Saved place created successfully");
  }),

  http.patch(`${API}/riders/me/saved-places/:saved_place_id`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "rider");
    if (response) return response;

    const rider = getCurrentRider(user);
    const place = db.savedPlaces.find(
      (item) => item.id === params.saved_place_id && item.rider_id === rider.id
    );
    if (!place) return fail("Saved place not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    Object.assign(place, body, { updated_at: nowIso() });
    return ok(place, "Saved place updated successfully");
  }),

  http.delete(`${API}/riders/me/saved-places/:saved_place_id`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "rider");
    if (response) return response;

    const rider = getCurrentRider(user);
    const index = db.savedPlaces.findIndex(
      (item) => item.id === params.saved_place_id && item.rider_id === rider.id
    );
    if (index === -1) return fail("Saved place not found", "NOT_FOUND", 404);

    db.savedPlaces.splice(index, 1);
    return ok(null, "Saved place deleted successfully");
  }),

  // Driver
  http.get(`${API}/drivers/me`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    return ok(getDriverWithRelations(getCurrentDriver(user)), "Driver profile fetched successfully");
  }),

  http.patch(`${API}/drivers/me/availability`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const body = await readJson(request);
    const driver = getCurrentDriver(user);
    driver.is_available = Boolean(body.is_available);

    if (driver.is_available) {
      globalThis.setTimeout(() => {
        const offer = db.rideOffers.find((item) => item.status === "sent");
        if (offer) emitMockSocketEvent("ride:offer", offer);
      }, 700);
    }

    return ok(getDriverWithRelations(driver), "Driver availability updated successfully");
  }),

  http.post(`${API}/drivers/me/location`, async ({ request }) => {
    await mockDelay(100);
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const body = await readJson(request);
    const location = {
      driver_id: driver.id,
      vehicle_id: body.vehicle_id || "vehicle_001",
      is_available: driver.is_available,
      average_rating: driver.average_rating,
      latitude: Number(body.latitude || 31.5204),
      longitude: Number(body.longitude || 74.3587),
      heading: Number(body.heading || 90),
      speed_kmph: Number(body.speed_kmph || 35),
      current_area: body.current_area || "Gulberg",
      updated_at: nowIso(),
    };

    const existing = db.nearbyDrivers.find((item) => item.driver_id === driver.id);
    if (existing) Object.assign(existing, location);
    else db.nearbyDrivers.push(location);

    emitMockSocketEvent("nearby_drivers:update", {
      city: "Lahore",
      drivers: db.nearbyDrivers,
    });

    return ok(location, "Driver location updated successfully");
  }),

  http.get(`${API}/drivers/me/documents`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    return ok(
      db.driverDocuments.filter((document) => document.driver_id === driver.id),
      "Driver documents fetched successfully"
    );
  }),

  http.post(`${API}/drivers/me/documents`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    let documentType = "cnic";
    let vehicleId = null;

    try {
      const formData = await request.formData();
      documentType = formData.get("document_type") || documentType;
      vehicleId = formData.get("vehicle_id") || null;
    } catch {
      const body = await readJson(request);
      documentType = body.document_type || documentType;
      vehicleId = body.vehicle_id || null;
    }

    const document = {
      id: makeId("document"),
      driver_id: driver.id,
      vehicle_id: vehicleId,
      document_type: documentType,
      file_url: `https://example.com/uploads/${documentType}.jpg`,
      status: "pending",
      rejection_reason: null,
      uploaded_at: nowIso(),
      verified_at: null,
    };

    db.driverDocuments.push(document);
    return created(document, "Driver document uploaded successfully");
  }),

  http.get(`${API}/drivers/me/vehicles`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    return ok(
      db.vehicles.filter((vehicle) => vehicle.driver_id === driver.id),
      "Driver vehicles fetched successfully"
    );
  }),

  http.post(`${API}/drivers/me/vehicles`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const body = await readJson(request);
    const vehicle = {
      id: makeId("vehicle"),
      driver_id: driver.id,
      make: body.make,
      model: body.model,
      year: Number(body.year),
      plate_number: body.plate_number,
      color: body.color,
      vehicle_type: body.vehicle_type || "car",
      is_active: false,
      verification_status: "pending",
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.vehicles.push(vehicle);
    return created(vehicle, "Vehicle created successfully");
  }),

  http.patch(`${API}/drivers/me/vehicles/:vehicle_id`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const vehicle = db.vehicles.find(
      (item) => item.id === params.vehicle_id && item.driver_id === driver.id
    );
    if (!vehicle) return fail("Vehicle not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    Object.assign(vehicle, body, { updated_at: nowIso() });
    return ok(vehicle, "Vehicle updated successfully");
  }),

  http.post(`${API}/drivers/me/vehicles/:vehicle_id/set-active`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const vehicle = db.vehicles.find(
      (item) => item.id === params.vehicle_id && item.driver_id === driver.id
    );
    if (!vehicle) return fail("Vehicle not found", "NOT_FOUND", 404);

    db.vehicles.forEach((item) => {
      if (item.driver_id === driver.id) item.is_active = false;
    });
    vehicle.is_active = true;
    vehicle.updated_at = nowIso();

    return ok(vehicle, "Active vehicle updated successfully");
  }),

  http.get(`${API}/drivers/me/ride-offers`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const status = getSearchParam(request, "status", null);
    let offers = db.rideOffers.filter((offer) => offer.driver_id === driver.id);
    if (status) offers = offers.filter((offer) => offer.status === status);

    return ok(offers, "Ride offers fetched successfully");
  }),

  http.post(`${API}/drivers/me/ride-offers/:offer_id/accept`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const offer = db.rideOffers.find(
      (item) => item.id === params.offer_id && item.driver_id === driver.id
    );
    if (!offer) return fail("Ride offer not found", "NOT_FOUND", 404);
    if (offer.status !== "sent") return fail("Ride offer is no longer available", "INVALID_STATE", 409);

    const ride = getRideById(offer.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    offer.status = "accepted";
    offer.responded_at = nowIso();
    ride.status = "accepted";
    ride.driver_id = driver.id;
    ride.vehicle_id = db.vehicles.find((vehicle) => vehicle.driver_id === driver.id && vehicle.is_active)?.id || "vehicle_001";
    ride.accepted_at = nowIso();
    ride.updated_at = nowIso();

    emitRideStatus(ride);
    emitLiveUpdate(ride);

    return ok(
      {
        offer,
        ride: attachRideRelations(ride),
      },
      "Ride offer accepted successfully"
    );
  }),

  http.post(`${API}/drivers/me/ride-offers/:offer_id/decline`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const offer = db.rideOffers.find(
      (item) => item.id === params.offer_id && item.driver_id === driver.id
    );
    if (!offer) return fail("Ride offer not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    offer.status = "declined";
    offer.decline_reason = body.decline_reason || null;
    offer.responded_at = nowIso();

    return ok(offer, "Ride offer declined successfully");
  }),

  http.get(`${API}/drivers/me/earnings`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const completedRides = db.rides.filter(
      (ride) => ride.driver_id === driver.id && ride.status === "completed"
    );
    const totalEarnings = completedRides.reduce(
      (sum, ride) => sum + Number(ride.fare?.final_fare || 0),
      0
    );

    return ok(
      {
        driver_id: driver.id,
        currency: "PKR",
        period: getSearchParam(request, "period", "week"),
        total_earnings: totalEarnings || 18500,
        total_rides: completedRides.length || 15,
        average_earning_per_ride: completedRides.length ? Math.round(totalEarnings / completedRides.length) : 1233,
        daily_breakdown: [
          { date: "2026-05-20", earnings: 4200, rides: 3 },
          { date: "2026-05-21", earnings: 5100, rides: 4 },
          { date: "2026-05-22", earnings: 3900, rides: 3 },
          { date: "2026-05-23", earnings: 5300, rides: 5 },
        ],
      },
      "Driver earnings fetched successfully"
    );
  }),

  http.get(`${API}/drivers/me/ratings`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const ratings = db.ratings.filter((rating) => rating.driver_id === driver.id);

    return ok(
      {
        average_rating: driver.average_rating,
        total_ratings: ratings.length || 12,
        ratings: ratings.length
          ? ratings
          : [
              {
                id: "rating_seed_001",
                ride_id: "ride_seed_001",
                rider_id: "rider_001",
                driver_id: driver.id,
                rating: 5,
                comment: "Great driver",
                created_at: "2026-05-23T13:00:00Z",
              },
            ],
      },
      "Driver ratings fetched successfully"
    );
  }),

  // Maps
  http.get(`${API}/maps/config`, () => {
    const mapboxPublicToken =
      import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN ||
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
      "mock_mapbox_public_token";

    return ok(
      {
        provider: "mapbox",
        public_token: mapboxPublicToken,
        mapbox_public_token: mapboxPublicToken,
        style_url: "mapbox://styles/mapbox/streets-v12",
        default_center: {
          latitude: 31.5204,
          longitude: 74.3587,
          city: "Lahore",
        },
        default_zoom: 12,
      },
      "Map config fetched successfully"
    );
  }),

  http.get(`${API}/maps/autocomplete`, async ({ request }) => {
    await mockDelay(180);
    const searchParams = new URL(request.url).searchParams;
const q = searchParams.get("query") || searchParams.get("q") || "";
    const suggestions = [
      {
        latitude: 31.5204,
        longitude: 74.3587,
        address: "Gulberg, Lahore",
        provider: "mapbox",
        provider_place_id: "mapbox.place.gulberg",
      },
      {
        latitude: 31.4697,
        longitude: 74.2728,
        address: "Johar Town, Lahore",
        provider: "mapbox",
        provider_place_id: "mapbox.place.johar_town",
      },
      {
        latitude: 31.5497,
        longitude: 74.3436,
        address: "Mall Road, Lahore",
        provider: "mapbox",
        provider_place_id: "mapbox.place.mall_road",
      },
      {
        latitude: 31.4621,
        longitude: 74.2766,
        address: "Emporium Mall, Lahore",
        provider: "mapbox",
        provider_place_id: "mapbox.place.emporium_mall",
      },
    ].filter((item) => !q || item.address.toLowerCase().includes(q));

    return ok(suggestions, "Address suggestions fetched successfully");
  }),

  http.get(`${API}/maps/reverse-geocode`, async ({ request }) => {
    await mockDelay(180);
    const latitude = Number(getSearchParam(request, "latitude", 31.5204));
    const longitude = Number(getSearchParam(request, "longitude", 74.3587));

    return ok(
      {
        latitude,
        longitude,
        address: latitude > 31.5 ? "Gulberg, Lahore" : "Johar Town, Lahore",
        provider: "mapbox",
        provider_place_id: `mapbox.reverse.${latitude}.${longitude}`,
      },
      "Address fetched successfully"
    );
  }),

  http.post(`${API}/maps/route-preview`, async ({ request }) => {
    await mockDelay();
    await readJson(request);
    return ok(makeRoute("preview", "pickup_to_dropoff"), "Route preview fetched successfully");
  }),

  http.get(`${API}/maps/nearby-drivers`, async ({ request }) => {
    await mockDelay();
    const radiusKm = Number(getSearchParam(request, "radius_km", 5));
    const drivers = db.nearbyDrivers.map((driver) => ({ ...driver, radius_km: radiusKm }));
    return ok(drivers, "Nearby drivers fetched successfully");
  }),

  http.get(`${API}/maps/surge-zones`, async ({ request }) => {
    await mockDelay();
    const city = getSearchParam(request, "city", "Lahore");
    const zones = db.surgeZones.filter((zone) => zone.city === city);
    return ok(zones, "Surge zones fetched successfully");
  }),

  // Rides - specific routes before generic /rides/:ride_id
  http.post(`${API}/rides/estimate`, async ({ request }) => {
    await mockDelay();
    const body = await readJson(request);
    const vehicleType = body.vehicle_type || "car";
    return ok(makeFareEstimate({ vehicle_type: vehicleType }), "Fare estimated successfully");
  }),

  http.get(`${API}/rides/:ride_id/route`, async ({ params }) => {
    await mockDelay();
    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    return ok(makeRoute(ride.id), "Ride route fetched successfully");
  }),

  http.get(`${API}/rides/:ride_id/live`, async ({ params }) => {
    await mockDelay();
    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    return ok(makeRideLiveState(ride), "Ride live state fetched successfully");
  }),

  http.post(`${API}/rides/:ride_id/cancel`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = authOrFail(request);
    if (response) return response;

    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);
    if (ride.status === "started" || ride.status === "completed") {
      return fail("Ride cannot be cancelled after it has started", "INVALID_STATE", 409);
    }

    const body = await readJson(request);
    ride.status = "cancelled";
    ride.cancelled_by_user_id = user.id;
    ride.cancellation_reason = body.cancellation_reason || "Cancelled by user";
    ride.cancelled_at = nowIso();
    ride.updated_at = nowIso();
    if (ride.fare) {
      ride.fare.cancellation_fee = ride.status === "accepted" ? 100 : 0;
    }

    emitMockSocketEvent("ride:cancelled", {
      ride_id: ride.id,
      cancelled_by_user_id: user.id,
      cancellation_reason: ride.cancellation_reason,
      cancellation_fee: ride.fare?.cancellation_fee || 0,
      cancelled_at: ride.cancelled_at,
    });

    return ok(attachRideRelations(ride), "Ride cancelled successfully");
  }),

  http.post(`${API}/rides/:ride_id/arrive`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "driver");
    if (response) return response;

    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    ride.status = "arrived";
    ride.arrived_at = nowIso();
    ride.updated_at = nowIso();
    emitRideStatus(ride);
    emitLiveUpdate(ride);

    return ok(attachRideRelations(ride), "Driver marked as arrived successfully");
  }),

  http.post(`${API}/rides/:ride_id/start`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "driver");
    if (response) return response;

    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    ride.status = "started";
    ride.started_at = nowIso();
    ride.updated_at = nowIso();
    emitRideStatus(ride);
    emitLiveUpdate(ride);

    return ok(attachRideRelations(ride), "Ride started successfully");
  }),

  http.post(`${API}/rides/:ride_id/tracking`, async ({ request, params }) => {
    await mockDelay(100);
    const { user, response } = authOrFail(request);
    if (response) return response;

    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    const point = {
      id: makeId("tracking"),
      ride_id: ride.id,
      driver_id: ride.driver_id || getCurrentDriver(user)?.id || "driver_001",
      latitude: Number(body.latitude || 31.5204),
      longitude: Number(body.longitude || 74.3587),
      heading: Number(body.heading || 90),
      speed_kmph: Number(body.speed_kmph || 35),
      recorded_at: nowIso(),
    };

    db.trackingPoints.push(point);

    emitMockSocketEvent("ride:live:update", {
      ride_id: ride.id,
      rider_id: ride.rider_id,
      driver_id: point.driver_id,
      status: ride.status,
      current_location: {
        latitude: point.latitude,
        longitude: point.longitude,
      },
      current_route_id: ride.selected_route_id,
      eta_min: Math.max(1, Math.round(14 - db.trackingPoints.length / 2)),
      distance_remaining_km: Math.max(0.2, 6.3 - db.trackingPoints.length * 0.4),
      updated_at: nowIso(),
    });

    return ok(point, "Ride tracking updated successfully");
  }),

  http.get(`${API}/rides/:ride_id/tracking`, async ({ params }) => {
    await mockDelay();
    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    return ok(
      db.trackingPoints.filter((point) => point.ride_id === ride.id),
      "Ride tracking fetched successfully"
    );
  }),

  http.post(`${API}/rides/:ride_id/complete`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "driver");
    if (response) return response;

    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    ride.status = "completed";
    ride.completed_at = nowIso();
    ride.updated_at = nowIso();
    if (ride.fare) {
      ride.fare.actual_distance_km = 12.8;
      ride.fare.actual_duration_min = 35;
      ride.fare.actual_traffic_delay_min = 8;
      ride.fare.final_ml_predicted_fare = 750;
      ride.fare.final_formula_fare = 760;
      ride.fare.final_fare = 760;
      ride.fare.finalized_at = nowIso();
    }

    const receipt = makeReceipt(ride);

    db.farePredictionLogs.push({
      id: makeId("prediction_log"),
      ride_id: ride.id,
      prediction_stage: "final_after_ride",
      model_used: "fare_prediction_linear_regression_v1",
      formula_fare: ride.fare?.final_formula_fare || 760,
      ml_predicted_fare: ride.fare?.final_ml_predicted_fare || 750,
      actual_final_fare: ride.fare?.final_fare || 760,
      created_at: nowIso(),
    });

    emitRideStatus(ride);

    return ok(
      {
        ride: attachRideRelations(ride),
        receipt,
      },
      "Ride completed successfully"
    );
  }),

  http.post(`${API}/rides/:ride_id/rating`, async ({ request, params }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "rider");
    if (response) return response;

    const rider = getCurrentRider(user);
    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    const rating = {
      id: makeId("rating"),
      ride_id: ride.id,
      rider_id: rider.id,
      driver_id: ride.driver_id || "driver_001",
      rating: Number(body.rating),
      comment: body.comment || null,
      created_at: nowIso(),
    };

    db.ratings.push(rating);
    return created(rating, "Rating submitted successfully");
  }),

  http.get(`${API}/rides/:ride_id/receipt`, async ({ params }) => {
    await mockDelay();
    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    return ok(makeReceipt(ride), "Ride receipt fetched successfully");
  }),

  http.post(`${API}/rides`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "rider");
    if (response) return response;

    const rider = getCurrentRider(user);
    const body = await readJson(request);
    const rideId = makeId("ride");
    const estimate = makeFareEstimate({ vehicle_type: body.vehicle_type || "car" });
    const fare = makeRideFare(rideId, estimate);

    const pickupStop = body.stops?.find((stop) => stop.stop_type === "pickup") || body.pickup || {};
    const dropoffStop = body.stops?.find((stop) => stop.stop_type === "dropoff") || body.dropoff || {};

    const ride = {
      id: rideId,
      rider_id: rider.id,
      driver_id: null,
      vehicle_id: null,
      ride_type: body.ride_type || "standard",
      scheduled_pickup_at: body.scheduled_pickup_at || null,
      recurrence_rule: body.recurrence_rule || null,
      pickup: makeLocation(pickupStop),
      dropoff: makeLocation({
        latitude: dropoffStop.latitude || 31.4697,
        longitude: dropoffStop.longitude || 74.2728,
        address: dropoffStop.address || "Johar Town, Lahore",
        provider: dropoffStop.provider || "mapbox",
        provider_place_id: dropoffStop.provider_place_id || "mapbox.place.johar_town",
      }),
      rider_note_to_driver: body.rider_note_to_driver || null,
      status: "searching_driver",
      selected_route_id: `route_${rideId}`,
      surge_zone_id: estimate.surge_zone_id,
      cancelled_by_user_id: null,
      cancellation_reason: null,
      requested_at: nowIso(),
      accepted_at: null,
      arrived_at: null,
      started_at: null,
      completed_at: null,
      cancelled_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
      stops: (body.stops || []).map((stop, index) => ({
        id: makeId("stop"),
        ride_id: rideId,
        stop_order: stop.stop_order || index + 1,
        stop_type: stop.stop_type,
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
        address: stop.address || null,
        provider: stop.provider || "mapbox",
        provider_place_id: stop.provider_place_id || null,
        arrived_at: null,
        departed_at: null,
        created_at: nowIso(),
      })),
      fare,
    };

    db.rides.unshift(ride);

    db.farePredictionLogs.push({
      id: makeId("prediction_log"),
      ride_id: ride.id,
      prediction_stage: "pre_ride",
      model_used: estimate.model_used,
      formula_fare: estimate.pre_ride_formula_fare,
      ml_predicted_fare: estimate.pre_ride_ml_predicted_fare,
      actual_final_fare: null,
      created_at: nowIso(),
    });

    createOfferForRide(ride);

    return created(attachRideRelations(ride), "Ride created successfully");
  }),

  http.get(`${API}/rides`, async ({ request }) => {
    await mockDelay();
    const { user, response } = authOrFail(request);
    if (response) return response;

    const status = getSearchParam(request, "status", null);
    const page = getSearchParam(request, "page", 1);
    const limit = getSearchParam(request, "limit", 20);

    let rides = db.rides;

    if (user.role === "rider") {
      const rider = getCurrentRider(user);
      rides = rides.filter((ride) => ride.rider_id === rider.id);
    }

    if (user.role === "driver") {
      const driver = getCurrentDriver(user);
      rides = rides.filter((ride) => ride.driver_id === driver.id);
    }

    if (status) {
      rides = rides.filter((ride) => ride.status === status);
    }

    const { data, meta } = paginate(rides.map(attachRideRelations), page, limit);
    return ok(data, "Rides fetched successfully", meta);
  }),

  http.get(`${API}/rides/:ride_id`, async ({ params }) => {
    await mockDelay();
    const ride = getRideById(params.ride_id);
    if (!ride) return fail("Ride not found", "NOT_FOUND", 404);

    return ok(attachRideRelations(ride), "Ride fetched successfully");
  }),

  // Admin
  http.get(`${API}/admin/pricing-rules`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    return ok(db.pricingRules, "Pricing rules fetched successfully");
  }),

  http.post(`${API}/admin/pricing-rules`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const body = await readJson(request);
    const rule = {
      id: makeId("pricing_rule"),
      city: body.city || "Lahore",
      vehicle_type: body.vehicle_type || "car",
      base_fare: Number(body.base_fare || 100),
      per_km_rate: Number(body.per_km_rate || 40),
      per_min_rate: Number(body.per_min_rate || 8),
      waiting_per_min_rate: Number(body.waiting_per_min_rate || 5),
      traffic_delay_per_min_rate: Number(body.traffic_delay_per_min_rate || 4),
      minimum_fare: Number(body.minimum_fare || 250),
      peak_start_time: body.peak_start_time || "17:00:00",
      peak_end_time: body.peak_end_time || "21:00:00",
      peak_multiplier: Number(body.peak_multiplier || 1.2),
      is_active: body.is_active !== false,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.pricingRules.push(rule);
    return created(rule, "Pricing rule created successfully");
  }),

  http.patch(`${API}/admin/pricing-rules/:pricing_rule_id`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const rule = db.pricingRules.find((item) => item.id === params.pricing_rule_id);
    if (!rule) return fail("Pricing rule not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    Object.assign(rule, body, { updated_at: nowIso() });
    return ok(rule, "Pricing rule updated successfully");
  }),

  http.patch(`${API}/admin/driver-documents/:document_id/review`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const document = db.driverDocuments.find((item) => item.id === params.document_id);
    if (!document) return fail("Driver document not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    document.status = body.status || "approved";
    document.rejection_reason = body.rejection_reason || null;
    document.verified_at = document.status === "approved" ? nowIso() : null;

    return ok(document, "Driver document reviewed successfully");
  }),

  http.patch(`${API}/admin/drivers/:driver_id/approval`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const driver = db.drivers.find((item) => item.id === params.driver_id);
    if (!driver) return fail("Driver not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    driver.approval_status = body.approval_status || "approved";

    return ok(getDriverWithRelations(driver), "Driver approval updated successfully");
  }),

  http.post(`${API}/admin/surge-zones`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const body = await readJson(request);
    const zone = {
      id: body.id || makeId("surge_zone"),
      city: body.city || "Lahore",
      area_name: body.area_name || "New Zone",
      center: body.center || {
        latitude: Number(body.latitude || 31.5204),
        longitude: Number(body.longitude || 74.3587),
      },
      radius_km: Number(body.radius_km || 2),
      demand_count: Number(body.demand_count || 10),
      available_drivers: Number(body.available_drivers || 5),
      supply_demand_ratio: Number(body.supply_demand_ratio || 2),
      surge_multiplier: Number(body.surge_multiplier || 1.2),
      updated_at: nowIso(),
    };

    db.surgeZones.push(zone);
    emitMockSocketEvent("surge:update", {
      city: zone.city,
      zones: db.surgeZones.filter((item) => item.city === zone.city),
    });

    return created(zone, "Surge zone created successfully");
  }),

  http.get(`${API}/admin/ml-models`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    return ok(db.mlModels, "ML models fetched successfully");
  }),

  http.get(`${API}/admin/rides/:ride_id/fare-prediction-logs`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const logs = db.farePredictionLogs.filter((log) => log.ride_id === params.ride_id);
    return ok(logs, "Fare prediction logs fetched successfully");
  }),
];
