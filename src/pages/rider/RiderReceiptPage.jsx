import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  MapPin,
  Navigation,
  ReceiptText,
  Route,
  Share2,
  Sparkles,
  Star,
  Timer,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { useRide } from "@/hooks/rides/useRide";
import { useRideReceipt } from "@/hooks/rides/useRideReceipt";
import { getReceiptFromResponse, getRideFromResponse } from "@/utils/apiShapes";
import { toReceiptView, formatUuid } from "@/utils/rideUi";



function ReceiptHero({ receipt }) {
  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {receipt.payment_status}
          </Badge>

          <p className="mt-5 text-sm font-medium text-[#4B5563]">
            Final fare
          </p>

          <h1 className="mt-1 text-[42px] font-bold leading-[48px] tracking-[-0.05em] text-[#101820]">
            {receipt.fare.currency} {receipt.fare.final_fare}
          </h1>

          <p className="mt-2 text-sm text-[#4B5563]">
            Receipt #{formatUuid(receipt.receipt_number)}
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white shadow-soft">
          <ReceiptText className="h-8 w-8 text-[#008C78]" />
        </div>
      </div>
    </Card>
  );
}

function TripSummaryCard({ receipt }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F4]">
            <MapPin className="h-4 w-4 text-[#008C78]" />
          </div>

          <div className="h-10 w-px bg-[#D7DCE2]" />

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101820]">
            <Navigation className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div>
            <p className="text-xs font-medium text-[#8A9099]">Pickup</p>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {receipt.pickup.address}
            </p>
          </div>

          <Separator className="my-3 bg-[#E1E5EA]" />

          <div>
            <p className="text-xs font-medium text-[#8A9099]">Dropoff</p>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {receipt.dropoff.address}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {receipt.trip.distance_km} km
          </p>
          <p className="text-xs text-[#8A9099]">Distance</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {receipt.trip.duration_min} min
          </p>
          <p className="text-xs text-[#8A9099]">Duration</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Timer className="h-4 w-4 text-[#F59E0B]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {receipt.trip.traffic_delay_min}m
          </p>
          <p className="text-xs text-[#8A9099]">Traffic</p>
        </div>
      </div>
    </Card>
  );
}

function DriverReceiptCard({ receipt }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F7F4]">
          <Car className="h-6 w-6 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-[#101820]">
            {receipt.driver.name}
          </p>
          <div className="mt-1 flex items-center gap-1 text-sm text-[#4B5563]">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-[#101820]">
              {receipt.driver.rating}
            </span>
            <span>·</span>
            <span>
              {receipt.vehicle.color} {receipt.vehicle.make}{" "}
              {receipt.vehicle.model}
            </span>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E1E5EA] bg-[#F7F8FA] px-3 py-2">
          <p className="text-sm font-bold tracking-wide text-[#101820]">
            {receipt.vehicle.plate_number}
          </p>
        </div>
      </div>
    </Card>
  );
}

function FareBreakdownCard({ receipt }) {
  const rows = [
    {
      label: "Base fare",
      value: receipt.fare.base_fare,
    },
    {
      label: "Distance fare",
      value: receipt.fare.distance_fare,
    },
    {
      label: "Duration fare",
      value: receipt.fare.duration_fare,
    },
    {
      label: "Traffic delay",
      value: receipt.fare.traffic_delay_fare,
    },
    {
      label: "Surge amount",
      value: receipt.fare.surge_amount,
      warning: true,
    },
    {
      label: "Discount",
      value: -receipt.fare.discount_amount,
      success: true,
    },
  ];

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Fare breakdown</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Final fare generated after ride completion.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
          <Sparkles className="h-5 w-5 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <p className="text-sm text-[#4B5563]">{row.label}</p>
            <p
              className={
                row.success
                  ? "text-sm font-bold text-[#16A34A]"
                  : row.warning
                    ? "text-sm font-bold text-[#C2410C]"
                    : "text-sm font-bold text-[#101820]"
              }
            >
              {row.value < 0 ? "-" : ""}
              {receipt.fare.currency} {Math.abs(row.value)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-[#101820]">Total paid</p>
        <p className="text-xl font-bold tracking-[-0.03em] text-[#101820]">
          {receipt.fare.currency} {receipt.fare.final_fare}
        </p>
      </div>
    </Card>
  );
}

function PaymentCard({ receipt }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <Wallet className="h-5 w-5 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#101820]">
            {receipt.payment_method}
          </p>
          <p className="mt-0.5 text-xs text-[#4B5563]">
            Payment marked as {receipt.payment_status.toLowerCase()}
          </p>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Paid
        </Badge>
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="flex items-center gap-3 text-sm text-[#4B5563]">
        <CalendarClock className="h-4 w-4 text-[#7A8088]" />
        <span>{receipt.issued_at}</span>
      </div>
    </Card>
  );
}

export default function RiderReceiptPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();
  const rideQuery = useRide(ride_id);
  const receiptQuery = useRideReceipt(ride_id);
  const rideData = getRideFromResponse(rideQuery.data);
  const receiptData = getReceiptFromResponse(receiptQuery.data);
  const receipt = toReceiptView(receiptData, rideData);

  function goToRating() {
    navigate(`/rider/ride/${ride_id}/rating`);
  }

  if (rideQuery.isLoading || receiptQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading receipt..." />
      </main>
    );
  }

  if (rideQuery.isError || !rideData) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Receipt not found. Return home and try again." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/rider/home", { replace: true })}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] bg-white text-[#101820]"
            aria-label="Back home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Receipt</h1>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] bg-white text-[#101820]"
            aria-label="Share receipt"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-8 space-y-4">
          <ReceiptHero receipt={receipt} />
          <TripSummaryCard receipt={receipt} />
          <DriverReceiptCard receipt={receipt} />
          <FareBreakdownCard receipt={receipt} />
          <PaymentCard receipt={receipt} />

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              <Download className="mr-2 h-5 w-5 text-[#008C78]" />
              Save
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
            onClick={goToRating}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <Star className="mr-2 h-5 w-5" />
            Rate your driver
          </Button>
        </div>
      </section>
    </main>
  );
}
