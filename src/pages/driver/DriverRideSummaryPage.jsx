import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock,
  Flag,
  Home,
  MapPin,
  ReceiptText,
  Route,
  ShieldCheck,
  Star,
  Timer,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { useRide } from "@/hooks/rides/useRide";
import { useRideReceipt } from "@/hooks/rides/useRideReceipt";
import { getReceiptFromResponse, getRideFromResponse } from "@/utils/apiShapes";
import { toDriverSummaryView } from "@/utils/rideUi";

const demoSummary = {
  ride_id: "ride_123",
  completed_at: "May 27, 2026 · 4:58 PM",
  rider: {
    name: "Ali Khan",
    initials: "AK",
    rating: 5.0,
  },
  pickup: {
    address: "Gulberg, Lahore",
    time: "4:22 PM",
  },
  dropoff: {
    address: "Johar Town, Lahore",
    time: "4:58 PM",
  },
  trip: {
    distance_km: 12.4,
    duration_min: 36,
    waiting_min: 4,
    traffic_delay_min: 6,
  },
  fare: {
    currency: "PKR",
    final_fare: 760,
    base_fare: 100,
    distance_fare: 496,
    duration_fare: 264,
    waiting_fare: 25,
    traffic_delay_fare: 28,
    surge_amount: 72,
    platform_fee: 95,
    driver_earnings: 665,
    payment_method: "Cash",
    payment_status: "paid",
  },
};

function SummaryHero({ summary }) {
  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Ride completed
          </Badge>

          <p className="mt-5 text-sm font-medium text-[#4B5563]">
            Your earnings
          </p>

          <h1 className="mt-1 text-[42px] font-bold leading-[48px] tracking-[-0.05em] text-[#101820]">
            {summary.fare.currency} {summary.fare.driver_earnings}
          </h1>

          <p className="mt-2 text-sm text-[#4B5563]">
            Completed {summary.completed_at}
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white shadow-soft">
          <Wallet className="h-8 w-8 text-[#008C78]" />
        </div>
      </div>
    </Card>
  );
}

function CompletedMapMock() {
  return (
    <Card className="overflow-hidden rounded-[28px] border-[#E1E5EA] bg-[#EAF2F0] p-0 shadow-sm">
      <div className="relative h-[220px]">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-20%] top-8 h-24 w-[140%] rotate-[-12deg] rounded-full border-[16px] border-white/80" />
          <div className="absolute left-[-10%] top-28 h-20 w-[120%] rotate-[18deg] rounded-full border-[12px] border-white/70" />
          <div className="absolute bottom-8 left-[-15%] h-20 w-[130%] rotate-[-5deg] rounded-full border-[10px] border-white/70" />
        </div>

        <div className="absolute left-[24%] top-[64%] h-[6px] w-[44%] rotate-[-18deg] rounded-full bg-[#008C78]" />
        <div className="absolute left-[48%] top-[48%] h-[6px] w-[28%] rotate-[20deg] rounded-full bg-[#008C78]" />

        <div className="absolute left-[22%] top-[68%] z-20 -translate-x-1/2 -translate-y-full">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#008C78]" />
        </div>

        <div className="absolute right-[16%] top-[36%] z-20 -translate-x-1/2 -translate-y-full">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101820] text-white shadow-card">
            <Flag className="h-5 w-5" />
          </div>
          <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#101820]" />
        </div>

        <div className="absolute left-[55%] top-[48%] z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card">
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
              12.4 km
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TripStatsCard({ summary }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Trip stats</h2>
      <p className="mt-1 text-sm text-[#4B5563]">
        Distance, time, waiting, and traffic details.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[18px] bg-[#F7F8FA] p-3">
          <Route className="h-5 w-5 text-[#008C78]" />
          <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-[#101820]">
            {summary.trip.distance_km} km
          </p>
          <p className="text-sm text-[#8A9099]">Distance</p>
        </div>

        <div className="rounded-[18px] bg-[#F7F8FA] p-3">
          <Clock className="h-5 w-5 text-[#008C78]" />
          <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-[#101820]">
            {summary.trip.duration_min} min
          </p>
          <p className="text-sm text-[#8A9099]">Duration</p>
        </div>

        <div className="rounded-[18px] bg-[#F7F8FA] p-3">
          <Timer className="h-5 w-5 text-[#F59E0B]" />
          <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-[#101820]">
            {summary.trip.waiting_min} min
          </p>
          <p className="text-sm text-[#8A9099]">Waiting</p>
        </div>

        <div className="rounded-[18px] bg-[#F7F8FA] p-3">
          <TrendingUp className="h-5 w-5 text-[#F59E0B]" />
          <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-[#101820]">
            {summary.trip.traffic_delay_min} min
          </p>
          <p className="text-sm text-[#8A9099]">Traffic delay</p>
        </div>
      </div>
    </Card>
  );
}

function RiderCard({ summary }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border border-[#E1E5EA]">
          <AvatarFallback className="bg-[#E8F7F4] text-base font-bold text-[#008C78]">
            {summary.rider.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-bold text-[#101820]">
              {summary.rider.name}
            </p>
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#008C78]" />
          </div>

          <div className="mt-1 flex items-center gap-2 text-sm text-[#4B5563]">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-[#101820]">
              {summary.rider.rating}
            </span>
            <span>rider rating</span>
          </div>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
          Completed
        </Badge>
      </div>
    </Card>
  );
}

function RouteSummaryCard({ summary }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Route</h2>
      <p className="mt-1 text-sm text-[#4B5563]">
        Completed pickup and dropoff timeline.
      </p>

      <div className="mt-5 flex gap-3">
        <div className="flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F4]">
            <MapPin className="h-4 w-4 text-[#008C78]" />
          </div>

          <div className="h-10 w-px bg-[#D7DCE2]" />

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101820]">
            <Flag className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[#8A9099]">Pickup</p>
              <p className="text-xs font-semibold text-[#4B5563]">
                {summary.pickup.time}
              </p>
            </div>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {summary.pickup.address}
            </p>
          </div>

          <Separator className="my-3 bg-[#E1E5EA]" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[#8A9099]">Dropoff</p>
              <p className="text-xs font-semibold text-[#4B5563]">
                {summary.dropoff.time}
              </p>
            </div>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {summary.dropoff.address}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EarningsBreakdownCard({ summary }) {
  const rows = [
    {
      label: "Base fare",
      value: summary.fare.base_fare,
    },
    {
      label: "Distance fare",
      value: summary.fare.distance_fare,
    },
    {
      label: "Duration fare",
      value: summary.fare.duration_fare,
    },
    {
      label: "Waiting fare",
      value: summary.fare.waiting_fare,
    },
    {
      label: "Traffic delay fare",
      value: summary.fare.traffic_delay_fare,
    },
    {
      label: "Surge amount",
      value: summary.fare.surge_amount,
      highlight: true,
    },
    {
      label: "Platform fee",
      value: -summary.fare.platform_fee,
      muted: true,
    },
  ];

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">
            Earnings breakdown
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Driver earnings after platform fee.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <Banknote className="h-5 w-5 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <p className="text-sm text-[#4B5563]">{row.label}</p>
            <p
              className={
                row.highlight
                  ? "text-sm font-bold text-[#C2410C]"
                  : row.muted
                    ? "text-sm font-bold text-[#8A9099]"
                    : "text-sm font-bold text-[#101820]"
              }
            >
              {row.value < 0 ? "-" : ""}
              {summary.fare.currency} {Math.abs(row.value)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-[#101820]">Your earnings</p>
        <p className="text-xl font-bold tracking-[-0.03em] text-[#101820]">
          {summary.fare.currency} {summary.fare.driver_earnings}
        </p>
      </div>
    </Card>
  );
}

function PaymentStatusCard({ summary }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <ReceiptText className="h-5 w-5 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#101820]">
            {summary.fare.payment_method}
          </p>
          <p className="mt-0.5 text-xs text-[#4B5563]">
            Payment marked as {summary.fare.payment_status}
          </p>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 capitalize text-[#008C78] hover:bg-[#E8F7F4]">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          {summary.fare.payment_status}
        </Badge>
      </div>
    </Card>
  );
}

export default function DriverRideSummaryPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();
  const rideQuery = useRide(ride_id);
  const receiptQuery = useRideReceipt(ride_id);

  const rideData = getRideFromResponse(rideQuery.data);
  const receiptData = getReceiptFromResponse(receiptQuery.data);
  const summary = toDriverSummaryView(receiptData, rideData);
  const rideId = ride_id || summary.ride_id;

  if (rideQuery.isLoading || receiptQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading ride summary..." />
      </main>
    );
  }

  if (rideQuery.isError || !rideData) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Ride summary not found." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => navigate(`/driver/rides/${rideId}/active`)}
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Ride summary</h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
            <CheckCircle2 className="h-5 w-5 text-[#008C78]" />
          </div>
        </header>

        <div className="mt-8 space-y-4">
          <SummaryHero summary={summary} />

          <CompletedMapMock />

          <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
                <CalendarClock className="h-5 w-5 text-[#008C78]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#101820]">
                  Ride completed
                </p>
                <p className="mt-0.5 text-xs text-[#4B5563]">
                  {summary.completed_at}
                </p>
              </div>

              <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
                ID {rideId}
              </Badge>
            </div>
          </Card>

          <TripStatsCard summary={summary} />
          <RiderCard summary={summary} />
          <RouteSummaryCard summary={summary} />
          <EarningsBreakdownCard summary={summary} />
          <PaymentStatusCard summary={summary} />

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/driver/earnings")}
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              <Wallet className="mr-2 h-5 w-5 text-[#008C78]" />
              Earnings
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/driver/rides")}
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              <ReceiptText className="mr-2 h-5 w-5 text-[#008C78]" />
              History
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/driver/home")}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to driver home
          </Button>
        </div>
      </section>
    </main>
  );
}
