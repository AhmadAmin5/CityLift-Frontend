import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ReceiptText,
  Route,
  ShieldCheck,
  Star,
  Timer,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const demoRide = {
  driver: {
    name: "Ahmed Raza",
    rating: 4.8,
    total_rides: 215,
    phone: "+92 300 9876543",
  },
  vehicle: {
    make: "Toyota",
    model: "Corolla",
    color: "White",
    plate_number: "LEA-1234",
  },
  pickup: {
    address: "Gulberg, Lahore",
  },
  dropoff: {
    address: "Johar Town, Lahore",
  },
  fare: {
    currency: "PKR",
    estimated_min_fare: 630,
    estimated_max_fare: 770,
  },
  live: {
    eta_min: 5,
    distance_remaining_km: 1.4,
    total_distance_km: 12.4,
    traffic_delay_min: 7,
  },
};

const statusCopy = {
  accepted: {
    badge: "Driver assigned",
    title: "Ahmed is on the way",
    subtitle: "Your driver is heading to the pickup point.",
    etaLabel: "Pickup ETA",
    primaryAction: "Driver arriving soon",
  },
  arrived: {
    badge: "Driver arrived",
    title: "Your driver is here",
    subtitle: "Meet your driver at the pickup location.",
    etaLabel: "Waiting",
    primaryAction: "Meet driver",
  },
  started: {
    badge: "Ride in progress",
    title: "On your way",
    subtitle: "Relax while we track your trip to the destination.",
    etaLabel: "Dropoff ETA",
    primaryAction: "Trip ongoing",
  },
  completed: {
    badge: "Ride completed",
    title: "You have arrived",
    subtitle: "Review your receipt and rate the driver.",
    etaLabel: "Completed",
    primaryAction: "View receipt",
  },
};

function LiveMapMock({ status }) {
  const isTripStarted = status === "started" || status === "completed";

  return (
    <div className="relative h-full min-h-[390px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
        <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
        <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
      </div>

      <div className="absolute left-[26%] top-[46%] h-[6px] w-[48%] rotate-[-18deg] rounded-full bg-[#008C78]" />
      <div className="absolute left-[46%] top-[36%] h-[6px] w-[30%] rotate-[26deg] rounded-full bg-[#008C78]" />

      <div className="absolute left-[22%] top-[54%] z-20 -translate-x-1/2 -translate-y-full">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
          <MapPin className="h-6 w-6" />
        </div>
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#008C78]" />
      </div>

      <div className="absolute right-[17%] top-[28%] z-20 -translate-x-1/2 -translate-y-full">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101820] text-white shadow-card">
          <Navigation className="h-5 w-5" />
        </div>
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#101820]" />
      </div>

      <div
        className={
          isTripStarted
            ? "absolute left-[56%] top-[38%] z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card"
            : "absolute left-[32%] top-[50%] z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card"
        }
      >
        <Car className="h-6 w-6" />
      </div>

      {status === "arrived" ? (
        <div className="absolute left-[22%] top-[54%] z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#008C78]/10">
          <div className="absolute inset-4 rounded-full bg-[#008C78]/10" />
        </div>
      ) : null}

      <div className="absolute left-5 top-6 z-30">
        <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
          <Car className="mr-1 h-3.5 w-3.5 text-[#008C78]" />
          Live tracking
        </Badge>
      </div>

      <div className="absolute bottom-8 left-6 right-6 z-30 rounded-[22px] border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#101820]">
              {statusCopy[status].title}
            </p>
            <p className="mt-1 truncate text-xs text-[#4B5563]">
              {statusCopy[status].subtitle}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F7F4]">
            <Timer className="h-5 w-5 text-[#008C78]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DriverInfoCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border border-[#E1E5EA]">
          <AvatarFallback className="bg-[#E8F7F4] text-base font-bold text-[#008C78]">
            AR
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

function RideProgressCard({ ride, status }) {
  const progressByStatus = {
    accepted: 18,
    arrived: 32,
    started: 68,
    completed: 100,
  };

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#4B5563]">
            {statusCopy[status].etaLabel}
          </p>
          <h3 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
            {status === "completed" ? "Done" : `${ride.live.eta_min} min`}
          </h3>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
          {statusCopy[status].badge}
        </Badge>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-[#E1E5EA]">
          <div
            className="h-full rounded-full bg-[#008C78]"
            style={{ width: `${progressByStatus[status]}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-[16px] bg-[#F7F8FA] p-3">
            <Route className="h-4 w-4 text-[#008C78]" />
            <p className="mt-2 text-sm font-bold text-[#101820]">
              {ride.live.distance_remaining_km} km
            </p>
            <p className="text-xs text-[#8A9099]">Remaining</p>
          </div>

          <div className="rounded-[16px] bg-[#F7F8FA] p-3">
            <Clock className="h-4 w-4 text-[#008C78]" />
            <p className="mt-2 text-sm font-bold text-[#101820]">
              {ride.live.traffic_delay_min}m
            </p>
            <p className="text-xs text-[#8A9099]">Traffic</p>
          </div>

          <div className="rounded-[16px] bg-[#F7F8FA] p-3">
            <ReceiptText className="h-4 w-4 text-[#008C78]" />
            <p className="mt-2 text-sm font-bold text-[#101820]">
              {ride.fare.currency} {ride.fare.estimated_min_fare}
            </p>
            <p className="text-xs text-[#8A9099]">From</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RouteSummaryCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F4]">
            <MapPin className="h-4 w-4 text-[#008C78]" />
          </div>

          <div className="h-9 w-px bg-[#D7DCE2]" />

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101820]">
            <Navigation className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div>
            <p className="text-xs font-medium text-[#8A9099]">Pickup</p>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {ride.pickup.address}
            </p>
          </div>

          <Separator className="my-3 bg-[#E1E5EA]" />

          <div>
            <p className="text-xs font-medium text-[#8A9099]">Dropoff</p>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {ride.dropoff.address}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function RiderLiveRidePage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();
  const [status, setStatus] = useState("accepted");

  const canCancel = status === "accepted" || status === "arrived";
  const isCompleted = status === "completed";

  function handlePrimaryAction() {
    if (isCompleted) {
      navigate(`/rider/ride/${ride_id || "demo_ride_001"}/receipt`);
    }
  }

  function handleCancelUiOnly() {
    navigate("/rider/home", { replace: true });
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
        <div className="relative h-[45vh] min-h-[390px]">
          <LiveMapMock status={status} />

          <header className="absolute left-0 right-0 top-0 z-40 px-5 pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-[22px] border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#E8F7F4]">
                    <Car className="h-5 w-5 text-[#008C78]" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#008C78]">
                      RideFlow
                    </p>
                    <p className="max-w-[170px] truncate text-sm font-bold text-[#101820]">
                      {statusCopy[status].badge}
                    </p>
                  </div>
                </div>
              </div>

              <Badge className="rounded-full bg-white px-3 py-2 text-[#101820] shadow-soft hover:bg-white">
                ID {ride_id || "demo"}
              </Badge>
            </div>
          </header>
        </div>

        <div className="-mt-7 relative z-50 rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-6 pt-4 shadow-sheet">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

          <Tabs value={status} onValueChange={setStatus} className="mb-5">
            <TabsList className="grid h-12 w-full grid-cols-4 rounded-[16px] bg-[#F7F8FA] p-1">
              <TabsTrigger
                value="accepted"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Assigned
              </TabsTrigger>
              <TabsTrigger
                value="arrived"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Arrived
              </TabsTrigger>
              <TabsTrigger
                value="started"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Started
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Done
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
                {statusCopy[status].title}
              </h1>
              <p className="mt-2 text-base leading-6 text-[#4B5563]">
                {statusCopy[status].subtitle}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#F1FBF9]">
              {isCompleted ? (
                <CheckCircle2 className="h-7 w-7 text-[#16A34A]" />
              ) : (
                <Navigation className="h-7 w-7 text-[#008C78]" />
              )}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <RideProgressCard ride={demoRide} status={status} />
            <DriverInfoCard ride={demoRide} />
            <RouteSummaryCard ride={demoRide} />

            {status === "arrived" ? (
              <Card className="rounded-[24px] border-[#F59E0B]/30 bg-[#FFF7ED] p-4 shadow-none">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-bold text-[#92400E]">
                      Driver is waiting
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[#92400E]">
                      Please meet the driver at the pickup point. Waiting time
                      may apply after the free window.
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            <Button
              type="button"
              onClick={handlePrimaryAction}
              disabled={!isCompleted}
              className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isCompleted ? (
                <>
                  <ReceiptText className="mr-2 h-5 w-5" />
                  View receipt
                </>
              ) : (
                statusCopy[status].primaryAction
              )}
            </Button>

            {canCancel ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[52px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#DC2626]"
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Cancel ride
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="max-w-[360px] rounded-[24px] border-[#E1E5EA] bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-[#101820]">
                      Cancel this ride?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base leading-6 text-[#4B5563]">
                      This is UI-only for now. Later, this action will call the
                      cancel ride endpoint and update the live ride state.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                      Keep ride
                    </AlertDialogCancel>

                    <AlertDialogAction
                      onClick={handleCancelUiOnly}
                      className="h-12 rounded-[14px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C]"
                    >
                      Cancel ride
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}