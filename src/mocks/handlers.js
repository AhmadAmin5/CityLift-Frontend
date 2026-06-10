import { http, HttpResponse } from "msw";
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

const mockPlaceDetails = [
  {
    provider: "google",
    provider_place_id: "ChIJ_mock_gulberg_lahore",
    place_id: "ChIJ_mock_gulberg_lahore",
    name: "Gulberg III",
    address: "Gulberg III, Lahore, Pakistan",
    latitude: 31.5102,
    longitude: 74.3441,
    place_type: ["neighborhood", "political"],
    primary_type: "neighborhood",
    business_status: null,
  },
  {
    provider: "google",
    provider_place_id: "ChIJ_mock_packages_mall",
    place_id: "ChIJ_mock_packages_mall",
    name: "Packages Mall",
    address: "Walton Road, Lahore, Pakistan",
    latitude: 31.4697,
    longitude: 74.2728,
    place_type: ["shopping_mall", "point_of_interest", "establishment"],
    primary_type: "shopping_mall",
    business_status: "OPERATIONAL",
  },
  {
    provider: "google",
    provider_place_id: "ChIJ_mock_tcs_express",
    place_id: "ChIJ_mock_tcs_express",
    name: "TCS Express Center",
    address: "Gulberg III, Lahore, Pakistan",
    latitude: 31.5001,
    longitude: 74.3442,
    place_type: ["courier_service", "point_of_interest", "establishment"],
    primary_type: "courier_service",
    business_status: "OPERATIONAL",
  },
  {
    provider: "google",
    provider_place_id: "ChIJ_mock_johar_town",
    place_id: "ChIJ_mock_johar_town",
    name: "Johar Town",
    address: "Johar Town, Lahore, Pakistan",
    latitude: 31.4697,
    longitude: 74.2728,
    place_type: ["neighborhood", "political"],
    primary_type: "neighborhood",
    business_status: null,
  },
  {
    provider: "google",
    provider_place_id: "ChIJ_mock_emporium_mall",
    place_id: "ChIJ_mock_emporium_mall",
    name: "Emporium Mall",
    address: "Abdul Haque Road, Johar Town, Lahore, Pakistan",
    latitude: 31.4621,
    longitude: 74.2766,
    place_type: ["shopping_mall", "point_of_interest", "establishment"],
    primary_type: "shopping_mall",
    business_status: "OPERATIONAL",
  },
  {
    provider: "google",
    provider_place_id: "ChIJ_mock_mall_road",
    place_id: "ChIJ_mock_mall_road",
    name: "Mall Road",
    address: "Mall Road, Lahore, Pakistan",
    latitude: 31.5497,
    longitude: 74.3436,
    place_type: ["route"],
    primary_type: "route",
    business_status: null,
  },
];

function makeAutocompleteSuggestion(place) {
  return {
    provider: place.provider,
    provider_place_id: place.provider_place_id,
    place_id: place.place_id,
    name: place.name,
    address: place.address,
    full_address: `${place.name}, ${place.address}`,
    latitude: null,
    longitude: null,
    place_type: place.place_type,
    primary_type: place.primary_type,
    requires_details: true,
  };
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
    const wasAvailable = driver.is_available;
    driver.is_available = Boolean(body.is_available);

    if (driver.is_available && !wasAvailable) {
      driver.online_session_start = new Date().toISOString();
    } else if (!driver.is_available && wasAvailable) {
      if (driver.online_session_start) {
        const elapsed = Date.now() - new Date(driver.online_session_start).getTime();
        driver.online_accumulated_ms = (driver.online_accumulated_ms || 0) + elapsed;
      }
      driver.online_session_start = null;
    }

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

    return ok({ offer }, "Ride offer declined successfully");
  }),

  http.get(`${API}/drivers/me/earnings`, async ({ request }) => {
    await mockDelay();
    const { user, response } = requireRole(request, "driver");
    if (response) return response;

    const driver = getCurrentDriver(user);
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "daily";
    const fromStr = url.searchParams.get("from");
    const toStr = url.searchParams.get("to");

    const completedRides = db.rides.filter(
      (ride) => ride.driver_id === driver.id && ride.status === "completed"
    );

    const dailyData = {};
    completedRides.forEach((ride) => {
      const dateVal = ride.completed_at || ride.updated_at || new Date().toISOString();
      const dateStr = dateVal.split("T")[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          gross: 0,
          rides: 0,
        };
      }
      const fare = Number(ride.fare?.final_fare || 0);
      dailyData[dateStr].gross += fare;
      dailyData[dateStr].rides += 1;
    });

    let startDate = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let endDate = toStr ? new Date(toStr) : new Date();

    const items = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];
      const dataForDay = dailyData[dateStr] || { gross: 0, rides: 0 };
      
      items.push({
        period_start: dateStr,
        period_end: dateStr,
        completed_rides: dataForDay.rides,
        gross_earnings: dataForDay.gross,
        estimated_driver_earning: Math.round(dataForDay.gross * 0.8),
        estimated_platform_commission: Math.round(dataForDay.gross * 0.2),
      });

      current.setDate(current.getDate() + 1);
    }

    const totalRides = items.reduce((sum, item) => sum + item.completed_rides, 0);
    const grossEarnings = items.reduce((sum, item) => sum + item.gross_earnings, 0);
    const estimatedDriverEarning = items.reduce((sum, item) => sum + item.estimated_driver_earning, 0);
    const estimatedPlatformCommission = items.reduce((sum, item) => sum + item.estimated_platform_commission, 0);

    const totalMs = (driver.online_accumulated_ms || 0) + 
      (driver.is_available && driver.online_session_start ? (Date.now() - new Date(driver.online_session_start).getTime()) : 0);
    const onlineHours = Math.round((totalMs / 3600000) * 10) / 10;

    return ok(
      {
        period,
        currency: "PKR",
        summary: {
          total_rides: totalRides,
          gross_earnings: grossEarnings,
          estimated_driver_earning: estimatedDriverEarning,
          estimated_platform_commission: estimatedPlatformCommission,
          online_hours: onlineHours,
        },
        items: items.filter(item => item.completed_rides > 0 || (fromStr && toStr)),
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

    const data = ratings.length
      ? ratings.map((rating) => {
          const riderUser = db.users.find(u => u.id === rating.rider_id) || { name: "Rider", profile_photo_url: null };
          return {
            id: rating.id,
            ride_id: rating.ride_id,
            rider_id: rating.rider_id,
            driver_id: rating.driver_id,
            rating: rating.rating,
            comment: rating.comment,
            created_at: rating.created_at,
            rider: {
              name: riderUser.name,
              profile_photo_url: riderUser.profile_photo_url,
            },
          };
        })
      : [
          {
            id: "rating_seed_001",
            ride_id: "ride_seed_001",
            rider_id: "rider_001",
            driver_id: driver.id,
            rating: 5,
            comment: "Great driver",
            created_at: "2026-05-23T13:00:00Z",
            rider: {
              name: "Ali Khan",
              profile_photo_url: null,
            },
          },
        ];

    return ok(data, "Driver ratings fetched successfully");
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
    const q = (searchParams.get("query") || searchParams.get("q") || "")
      .trim()
      .toLowerCase();
    const limit = Number(searchParams.get("limit") || 5);
    const sessionToken = searchParams.get("session_token");
    const typePreset = searchParams.get("type_preset") || "all";
    const suggestions = mockPlaceDetails
      .filter((place) => {
        if (typePreset === "courier" && place.primary_type !== "courier_service") {
          return false;
        }

        if (!q) return true;

        return [place.name, place.address, place.primary_type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .slice(0, limit)
      .map(makeAutocompleteSuggestion);

    return ok(
      suggestions,
      "Autocomplete results fetched successfully",
      {
        provider: "google",
        city: "Lahore",
        country: "PK",
        requires_place_details: true,
        session_token: sessionToken,
      }
    );
  }),

  http.get(`${API}/maps/place-details`, async ({ request }) => {
    await mockDelay(180);
    const searchParams = new URL(request.url).searchParams;
    const placeId = searchParams.get("place_id");
    const sessionToken = searchParams.get("session_token");
    const details = mockPlaceDetails.find(
      (place) =>
        place.place_id === placeId ||
        place.provider_place_id === placeId
    );

    if (!details) {
      return fail("Place details not found", "PLACE_NOT_FOUND", 404);
    }

    return ok(
      details,
      "Place details fetched successfully",
      {
        provider: "google",
        session_token: sessionToken,
      }
    );
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

    const body = await readJson(request);

    ride.status = "completed";
    ride.completed_at = nowIso();
    ride.updated_at = nowIso();

    const driverObj = db.drivers.find((d) => d.id === ride.driver_id);
    if (driverObj) {
      driverObj.total_rides = (driverObj.total_rides || 0) + 1;
    }

    if (ride.fare) {
      ride.fare.actual_distance_km = typeof body.actual_distance_km === "number" ? body.actual_distance_km : 12.8;
      ride.fare.actual_duration_min = typeof body.actual_duration_min === "number" ? body.actual_duration_min : 35;
      ride.fare.actual_traffic_delay_min = typeof body.actual_traffic_delay_min === "number" ? body.actual_traffic_delay_min : 8;
      ride.fare.waiting_time_min = typeof body.waiting_time_min === "number" ? body.waiting_time_min : 0;
      
      const distFare = Math.round(ride.fare.actual_distance_km * 40);
      const durFare = Math.round(ride.fare.actual_duration_min * 10);
      const waitFare = Math.round(ride.fare.waiting_time_min * 5);
      const total = 100 + distFare + durFare + waitFare;

      ride.fare.final_ml_predicted_fare = total - 10;
      ride.fare.final_formula_fare = total;
      ride.fare.final_fare = total;
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
    return created({ pricing_rule: rule }, "Pricing rule created successfully");
  }),

  http.patch(`${API}/admin/pricing-rules/:pricing_rule_id`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const rule = db.pricingRules.find((item) => item.id === params.pricing_rule_id);
    if (!rule) return fail("Pricing rule not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    Object.assign(rule, body, { updated_at: nowIso() });
    return ok({ pricing_rule: rule }, "Pricing rule updated successfully");
  }),

  http.get(`${API}/admin/driver-documents`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    return ok(db.driverDocuments, "Driver documents fetched successfully");
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

    if (document.document_type === "vehicle_registration" && document.vehicle_id) {
      const vehicle = db.vehicles.find((item) => item.id === document.vehicle_id);
      if (vehicle) {
        vehicle.verification_status = document.status;
        vehicle.rejection_reason = document.rejection_reason;
        vehicle.updated_at = nowIso();
      }
    }

    return ok({ document }, "Driver document reviewed successfully");
  }),

  http.patch(`${API}/admin/drivers/:driver_id/approval`, async ({ request, params }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    const driver = db.drivers.find((item) => item.id === params.driver_id);
    if (!driver) return fail("Driver not found", "NOT_FOUND", 404);

    const body = await readJson(request);
    driver.approval_status = body.approval_status || "approved";

    return ok({ driver: getDriverWithRelations(driver) }, "Driver approval updated successfully");
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

    return created({ surge_zone: zone }, "Surge zone created successfully");
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

  http.get(`${API}/admin/analytics/graph/popular-routes`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    if (localStorage.getItem("mock_neo4j_offline") === "true") {
      return HttpResponse.json(
        {
          success: false,
          statusCode: 503,
          message: "Neo4j database service is unavailable",
          errors: []
        },
        { status: 503 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Popular routes fetched successfully",
        data: {
          routes: [
            { pickup_area: "Gulberg", dropoff_area: "DHA Phase 5", ride_count: 18 },
            { pickup_area: "Johar Town", dropoff_area: "Gulberg", ride_count: 15 },
            { pickup_area: "Model Town", dropoff_area: "Faisal Town", ride_count: 12 },
            { pickup_area: "Samanabad", dropoff_area: "Anarkali", ride_count: 10 },
            { pickup_area: "DHA Phase 3", dropoff_area: "Gulberg", ride_count: 9 },
            { pickup_area: "Gulberg", dropoff_area: "Mall Road", ride_count: 8 },
            { pickup_area: "Wapda Town", dropoff_area: "Johar Town", ride_count: 7 },
            { pickup_area: "Lahore Cantt", dropoff_area: "DHA Phase 5", ride_count: 6 },
            { pickup_area: "Iqbal Town", dropoff_area: "Samanabad", ride_count: 5 },
            { pickup_area: "Baghbanpura", dropoff_area: "Shalimar", ride_count: 4 }
          ]
        }
      },
      { status: 200 }
    );
  }),

  http.get(`${API}/admin/analytics/graph/collusion-detection`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    if (localStorage.getItem("mock_neo4j_offline") === "true") {
      return HttpResponse.json(
        {
          success: false,
          statusCode: 503,
          message: "Neo4j database service is unavailable",
          errors: []
        },
        { status: 503 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Potential collusion records fetched successfully",
        data: {
          collusion_records: [
            {
              rider_id: "dc4f7eb8-5c26-49c4-ae65-b2fb99fcd254",
              rider_name: "Hamza Ali",
              driver_id: "d292c920-49c0-4880-879a-05d16fbb52f5",
              driver_name: "Ahmad Amin",
              completed_count: 7
            },
            {
              rider_id: "rider_001",
              rider_name: "Ali Khan",
              driver_id: "driver_002",
              driver_name: "Bilal Ahmed",
              completed_count: 6
            },
            {
              rider_id: "rider_002",
              rider_name: "Zainab Bibi",
              driver_id: "driver_003",
              driver_name: "Usman Tariq",
              completed_count: 8
            }
          ]
        }
      },
      { status: 200 }
    );
  }),

  http.get(`${API}/admin/analytics/graph/driver-density`, async ({ request }) => {
    await mockDelay();
    const { response } = requireRole(request, "admin");
    if (response) return response;

    if (localStorage.getItem("mock_neo4j_offline") === "true") {
      return HttpResponse.json(
        {
          success: false,
          statusCode: 503,
          message: "Neo4j database service is unavailable",
          errors: []
        },
        { status: 503 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Driver density metrics fetched successfully",
        data: {
          density: [
            { area_name: "Gulberg", driver_count: 5 },
            { area_name: "DHA Phase 5", driver_count: 4 },
            { area_name: "Johar Town", driver_count: 3 },
            { area_name: "Model Town", driver_count: 2 },
            { area_name: "Faisal Town", driver_count: 1 }
          ]
        }
      },
      { status: 200 }
    );
  }),
];
