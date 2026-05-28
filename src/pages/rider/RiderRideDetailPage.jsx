import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ReceiptText,
  Route,
  ShieldCheck,
  Star,
  Timer,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const demoRideDetail = {
  id: "ride_001",
  status: "completed",
  requested_at: "May 27, 2026 · 4:05 PM",
  completed_at: "May 27, 2026 · 4:42 PM",
  ride_type: "standard",
  pickup: {
    address: "Gulberg, Lahore",
  },
  dropoff: {
    address: "Johar Town, Lahore",
  },
  stops: [
    {
      id: "stop_001",
      stop_order: 1,
      stop_type: "pickup",
      address: "Gulberg, Lahore",
      arrived_at: "4:05 PM",
    },
    {
      id: "stop_002",
      stop_order: 2,
      stop_type: "dropoff",
      address: "Johar Town, Lahore",
      arrived_at: "4:42 PM",
    },
  ],
  driver: {
    name: "Ahmed Raza",
    initials: "AR",
    rating: 4.8,
    total_rides: 215,
    phone: "+92 300 9876543",
  },
  vehicle: {
    make: "Toyota",
    model: "Corolla",
    color: "White",
    plate_number: "LEA-1234",
    vehicle_type: "car",
  },
  fare: {
    currency: "PKR",
    final_fare: 760,
    estimated_min_fare: 630,
    estimated_max_fare: 770,
    base_fare: 100,
    distance_fare: 496,
    duration_fare: 264,
    traffic_delay_fare: 28,
    surge_amount: 72,
    payment_status: "paid",
    payment_method: "Cash",
  },
  trip: {
    distance_km: 12.8,
    duration_min: 35,
    traffic_delay_min: 8,
  },
  rating: {
    submitted: true,
    rating: 5,
    comment: "Great driver, clean car, smooth ride.",
  },
};

function getStatusConfig(status) {
  if (status === "completed") {
    return {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
    };
  }

  return {
    label: "Ride",
    icon: Car,
    className: "bg-[#F7F8FA] text-[#4B5563] hover:bg-[#F7F8FA]",
  };
}

function DetailMapMock() {
  return (
    <Card className="overflow-hidden rounded-[28px] border-[#E1E5EA] bg-[#EAF2F0] p-0 shadow-sm">
      <div className="relative h-[220px]">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-20%] top-8 h-24 w-[140%] rotate-[-12deg] rounded-full border-[16px] border-white/80" />
          <div className="absolute left-[-10%] top-28 h-20 w-[120%] rotate-[18deg] rounded-full border-[12px] border-white/70" />
          <div className="absolute bottom-8 left-[-15%] h-20 w-[130%] rotate-[-5deg] rounded-full border-[10px] border-white/70" />
        </div>

        <div className="absolute left-[26%] top-[58%] h-[6px] w-[46%] rotate-[-18deg] rounded-full bg-[#008C78]" />
        <div className="absolute left-[48%] top-[42%] h-[6px] w-[28%] rotate-[24deg] rounded-full bg-[#008C78]" />

        <div className="absolute left-[22%] top-[64%] z-20 -translate-x-1/2 -translate-y-full">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#008C78]" />
        </div>

        <div className="absolute right-[16%] top-[32%] z-20 -translate-x-1/2 -translate-y-full">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101820] text-white shadow-card">
            <Navigation className="h-5 w-5" />
          </div>
          <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#101820]" />
        </div>

        <div className="absolute left-[55%] top-[44%] z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card">
          <Car className="h-6 w-6" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-[20px] border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#101820]">
                Completed route
              </p>
              <p className="mt-0.5 text-xs text-[#4B5563]">
                Gulberg to Johar Town
              </p>
            </div>

            <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
              12.8 km
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RideOverviewCard({ ride }) {
  const statusConfig = getStatusConfig(ride.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className={`rounded-full px-3 py-1.5 ${statusConfig.className}`}>
            <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>

          <h1 className="mt-4 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
            Ride details
          </h1>

          <p className="mt-2 text-sm leading-5 text-[#4B5563]">
            {ride.requested_at}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-soft">
          <ReceiptText className="h-7 w-7 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.distance_km} km
          </p>
          <p className="text-xs text-[#8A9099]">Distance</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.duration_min} min
          </p>
          <p className="text-xs text-[#8A9099]">Duration</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <Wallet className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.fare.currency} {ride.fare.final_fare}
          </p>
          <p className="text-xs text-[#8A9099]">Fare</p>
        </div>
      </div>
    </Card>
  );
}

function RouteCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Route</h2>
      <p className="mt-1 text-sm text-[#4B5563]">
        Pickup, dropoff, and completed stop timeline.
      </p>

      <div className="mt-5 space-y-4">
        {ride.stops.map((stop, index) => {
          const isPickup = stop.stop_type === "pickup";
          const isLast = index === ride.stops.length - 1;

          return (
            <div key={stop.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={
                    isPickup
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F4]"
                      : "flex h-9 w-9 items-center justify-center rounded-full bg-[#101820]"
                  }
                >
                  {isPickup ? (
                    <MapPin className="h-4 w-4 text-[#008C78]" />
                  ) : (
                    <Navigation className="h-4 w-4 text-white" />
                  )}
                </div>

                {!isLast ? <div className="mt-1 h-10 w-px bg-[#D7DCE2]" /> : null}
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold capitalize text-[#8A9099]">
                    {stop.stop_type}
                  </p>
                  <p className="text-xs font-semibold text-[#4B5563]">
                    {stop.arrived_at}
                  </p>
                </div>

                <p className="mt-1 truncate text-sm font-bold text-[#101820]">
                  {stop.address}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DriverCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border border-[#E1E5EA]">
          <AvatarFallback className="bg-[#E8F7F4] text-base font-bold text-[#008C78]">
            {ride.driver.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-bold text-[#101820]">
              {ride.driver.name}
            </p>
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#008C78]" />
          </div>

          <div className="mt-1 flex items-center gap-2 text-sm text-[#4B5563]">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-[#101820]">
              {ride.driver.rating}
            </span>
            <span>·</span>
            <span>{ride.driver.total_rides} rides</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white"
          >
            <Phone className="h-5 w-5 text-[#008C78]" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white"
          >
            <MessageCircle className="h-5 w-5 text-[#008C78]" />
          </Button>
        </div>
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="rounded-[18px] bg-[#F7F8FA] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#8A9099]">Vehicle</p>
            <p className="mt-1 text-sm font-bold text-[#101820]">
              {ride.vehicle.color} {ride.vehicle.make} {ride.vehicle.model}
            </p>
          </div>

          <div className="rounded-[12px] border border-[#E1E5EA] bg-white px-3 py-2">
            <p className="text-sm font-bold tracking-wide text-[#101820]">
              {ride.vehicle.plate_number}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FareDetailCard({ ride }) {
  const rows = [
    ["Base fare", ride.fare.base_fare],
    ["Distance fare", ride.fare.distance_fare],
    ["Duration fare", ride.fare.duration_fare],
    ["Traffic delay", ride.fare.traffic_delay_fare],
    ["Surge amount", ride.fare.surge_amount],
  ];

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Fare</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Paid with {ride.fare.payment_method}
          </p>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 capitalize text-[#008C78] hover:bg-[#E8F7F4]">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          {ride.fare.payment_status}
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <p className="text-sm text-[#4B5563]">{label}</p>
            <p className="text-sm font-bold text-[#101820]">
              {ride.fare.currency} {value}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-[#101820]">Total</p>
        <p className="text-xl font-bold tracking-[-0.03em] text-[#101820]">
          {ride.fare.currency} {ride.fare.final_fare}
        </p>
      </div>
    </Card>
  );
}

function RatingSummaryCard({ ride }) {
  if (!ride.rating?.submitted) return null;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF7ED]">
          <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#101820]">
            Your rating
          </h2>

          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={
                  star <= ride.rating.rating
                    ? "h-5 w-5 fill-[#F59E0B] text-[#F59E0B]"
                    : "h-5 w-5 text-[#CED4DA]"
                }
              />
            ))}
          </div>

          <p className="mt-3 text-sm leading-5 text-[#4B5563]">
            “{ride.rating.comment}”
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function RiderRideDetailPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => navigate("/rider/rides")}
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Ride detail</h1>
          </div>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </header>

        <div className="mt-8 space-y-4">
          <RideOverviewCard ride={demoRideDetail} />

          <DetailMapMock />

          <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-[#F7F8FA] p-3">
                <CalendarClock className="h-4 w-4 text-[#008C78]" />
                <p className="mt-2 text-xs text-[#8A9099]">Requested</p>
                <p className="mt-1 text-sm font-bold text-[#101820]">
                  4:05 PM
                </p>
              </div>

              <div className="rounded-[16px] bg-[#F7F8FA] p-3">
                <Timer className="h-4 w-4 text-[#008C78]" />
                <p className="mt-2 text-xs text-[#8A9099]">Completed</p>
                <p className="mt-1 text-sm font-bold text-[#101820]">
                  4:42 PM
                </p>
              </div>
            </div>
          </Card>

          <RouteCard ride={demoRideDetail} />
          <DriverCard ride={demoRideDetail} />
          <FareDetailCard ride={demoRideDetail} />
          <RatingSummaryCard ride={demoRideDetail} />

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(`/rider/ride/${ride_id || demoRideDetail.id}/receipt`)
              }
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              <ReceiptText className="mr-2 h-5 w-5 text-[#008C78]" />
              Receipt
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              <CreditCard className="mr-2 h-5 w-5 text-[#008C78]" />
              Payment
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/rider/home")}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            Book another ride
          </Button>
        </div>
      </section>
    </main>
  );
}