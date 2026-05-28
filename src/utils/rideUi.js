function initials(name = "RideFlow User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDateTime(value) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getDriverUser(driver) {
  return driver?.user || driver || {};
}

function getRiderUser(ride) {
  return ride?.rider?.user || ride?.rider || {};
}

export function getDriverName(driver) {
  const user = getDriverUser(driver);
  return driver?.name || user?.name || "Ahmed Raza";
}

export function getRiderName(ride) {
  const user = getRiderUser(ride);
  return ride?.rider?.name || user?.name || "Ali Khan";
}

export function makeFareRange(fare = {}) {
  const currency = fare.currency || "PKR";
  if (fare.estimated_min_fare && fare.estimated_max_fare) {
    return `${currency} ${fare.estimated_min_fare}-${fare.estimated_max_fare}`;
  }
  if (fare.final_fare) return `${currency} ${fare.final_fare}`;
  return `${currency} --`;
}

export function toSearchRideView(ride) {
  return {
    pickup: ride?.pickup || { address: "Pickup" },
    dropoff: ride?.dropoff || { address: "Dropoff" },
    fare: ride?.fare || {
      currency: "PKR",
      estimated_min_fare: 0,
      estimated_max_fare: 0,
    },
    estimated_distance_km: ride?.fare?.estimated_distance_km || 0,
    estimated_duration_min: ride?.fare?.estimated_duration_min || 0,
    nearby_drivers_count: 6,
    search_radius_km: 3,
  };
}

export function toLiveRideView(ride, liveState) {
  const driver = ride?.driver || {};
  const vehicle = ride?.vehicle || {};
  const driverName = getDriverName(driver);
  return {
    driver: {
      name: driverName,
      rating: driver.average_rating || 4.8,
      total_rides: driver.total_rides || 0,
      phone: getDriverUser(driver).phone || "+92 300 9876543",
    },
    vehicle: {
      make: vehicle.make || "Toyota",
      model: vehicle.model || "Corolla",
      color: vehicle.color || "White",
      plate_number: vehicle.plate_number || "LEA-1234",
    },
    pickup: ride?.pickup || { address: "Pickup" },
    dropoff: ride?.dropoff || { address: "Dropoff" },
    fare: ride?.fare || { currency: "PKR" },
    live: {
      eta_min: liveState?.eta_min || 5,
      distance_remaining_km: liveState?.distance_remaining_km || 0,
      total_distance_km: ride?.fare?.estimated_distance_km || 0,
      traffic_delay_min: ride?.fare?.estimated_traffic_delay_min || 0,
    },
    driver_initials: initials(driverName),
  };
}

export function toDriverTripView(ride, liveState, route) {
  const riderName = getRiderName(ride);
  const fare = ride?.fare || {};
  return {
    ride_id: ride?.id,
    status: ride?.status,
    arrived_at: formatDateTime(ride?.arrived_at),
    started_at: formatDateTime(ride?.started_at),
    free_waiting_min: 3,
    waiting_min: ride?.status === "arrived" ? 4 : 0,
    rider: {
      name: riderName,
      initials: initials(riderName),
      rating: 5.0,
      phone: getRiderUser(ride).phone || "+92 300 1234567",
    },
    pickup: {
      address: ride?.pickup?.address || "Pickup",
      detail: ride?.pickup?.address || "Pickup point",
      landmark: ride?.pickup?.address || "Pickup point",
    },
    dropoff: {
      address: ride?.dropoff?.address || "Dropoff",
      detail: ride?.dropoff?.address || "Dropoff point",
      landmark: ride?.dropoff?.address || "Dropoff point",
    },
    route_to_pickup: {
      eta_min: liveState?.eta_min || route?.traffic_duration_min || 5,
      distance_km: liveState?.distance_remaining_km || route?.distance_km || 1.4,
      traffic_delay_min: route?.traffic_delay_min || 0,
      next_instruction: route?.steps?.[0]?.instruction || "Head to pickup",
    },
    full_trip: {
      estimated_distance_km: fare.estimated_distance_km || route?.distance_km || 0,
      estimated_duration_min:
        fare.estimated_duration_min || route?.traffic_duration_min || 0,
      fare_range: makeFareRange(fare),
    },
    trip: {
      estimated_distance_km: fare.estimated_distance_km || 0,
      estimated_duration_min: fare.estimated_duration_min || 0,
      fare_range: makeFareRange(fare),
      distance_total_km: fare.estimated_distance_km || 0,
      distance_remaining_km: liveState?.distance_remaining_km || 0,
      duration_total_min: fare.estimated_duration_min || 0,
      eta_min: liveState?.eta_min || 14,
      traffic_delay_min: fare.estimated_traffic_delay_min || 0,
      progress_percent:
        fare.estimated_distance_km && liveState?.distance_remaining_km
          ? Math.round(
              ((fare.estimated_distance_km - liveState.distance_remaining_km) /
                fare.estimated_distance_km) *
                100
            )
          : 50,
    },
    next_instruction: route?.steps?.[0]?.instruction || "Continue to destination",
    note: ride?.rider_note_to_driver || null,
  };
}

export function toReceiptView(receiptData, rideData) {
  const receipt = receiptData?.fare_breakdown
    ? receiptData
    : receiptData?.receipt || receiptData || {};
  const ride = receipt.ride || rideData || {};
  const fareBreakdown = receipt.fare_breakdown || receipt;
  const fare = ride.fare || {};
  const driver = receipt.driver || ride.driver || {};
  const vehicle = receipt.vehicle || ride.vehicle || {};

  return {
    receipt_number: receipt.receipt_number || receipt.id || "RF-00001",
    issued_at: formatDateTime(receipt.issued_at || ride.completed_at),
    payment_method: receipt.payment_method || "Cash",
    payment_status: receipt.payment_status || "Paid",
    driver: {
      name: driver.name || getDriverName(driver),
      rating: driver.average_rating || 4.8,
    },
    vehicle: {
      color: vehicle.color || "White",
      make: vehicle.make || "Toyota",
      model: vehicle.model || "Corolla",
      plate_number: vehicle.plate_number || "LEA-1234",
    },
    pickup: receipt.pickup || ride.pickup || { address: "Pickup" },
    dropoff: receipt.dropoff || ride.dropoff || { address: "Dropoff" },
    trip: {
      distance_km:
        receipt.actual_distance_km ||
        fare.actual_distance_km ||
        fare.estimated_distance_km ||
        0,
      duration_min:
        receipt.actual_duration_min ||
        fare.actual_duration_min ||
        fare.estimated_duration_min ||
        0,
      traffic_delay_min:
        fare.actual_traffic_delay_min || fare.estimated_traffic_delay_min || 0,
    },
    fare: {
      currency: receipt.currency || fare.currency || "PKR",
      final_fare: fareBreakdown.final_fare || fare.final_fare || 0,
      base_fare: fareBreakdown.base_fare || fare.base_fare || 0,
      distance_fare: fareBreakdown.distance_fare || 0,
      duration_fare: fareBreakdown.duration_fare || 0,
      waiting_fare: fareBreakdown.waiting_fare || 0,
      traffic_delay_fare: fareBreakdown.traffic_delay_fare || 0,
      surge_amount: fareBreakdown.surge_amount || 0,
      discount_amount: fareBreakdown.discount_amount || 0,
    },
  };
}

export function toDriverSummaryView(receiptData, rideData) {
  const receipt = toReceiptView(receiptData, rideData);
  const finalFare = Number(receipt.fare.final_fare || 0);
  const driverEarnings = Math.round(finalFare * 0.8);

  return {
    ride_id: rideData?.id || receiptData?.ride_id,
    completed_at: formatDateTime(rideData?.completed_at || receiptData?.issued_at),
    rider: {
      name: getRiderName(rideData),
      initials: initials(getRiderName(rideData)),
      rating: 5.0,
    },
    pickup: {
      address: receipt.pickup.address,
      time: formatDateTime(rideData?.started_at || rideData?.requested_at),
    },
    dropoff: {
      address: receipt.dropoff.address,
      time: formatDateTime(rideData?.completed_at),
    },
    trip: {
      distance_km: receipt.trip.distance_km,
      duration_min: receipt.trip.duration_min,
      waiting_min: rideData?.fare?.waiting_time_min || 0,
      traffic_delay_min: receipt.trip.traffic_delay_min,
    },
    fare: {
      ...receipt.fare,
      platform_fee: Math.max(0, finalFare - driverEarnings),
      driver_earnings: driverEarnings,
      payment_method: receipt.payment_method,
      payment_status: receipt.payment_status.toLowerCase(),
    },
  };
}

export function toRatingDriverView(ride) {
  const driver = ride?.driver || {};
  const vehicle = ride?.vehicle || {};
  const name = getDriverName(driver);

  return {
    name,
    initials: initials(name),
    rating: driver.average_rating || 4.8,
    total_rides: driver.total_rides || 0,
    vehicle: `${vehicle.color || "White"} ${vehicle.make || "Toyota"} ${
      vehicle.model || "Corolla"
    }`,
    plate_number: vehicle.plate_number || "LEA-1234",
  };
}
