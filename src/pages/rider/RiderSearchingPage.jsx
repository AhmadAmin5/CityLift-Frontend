import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Car,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Radar,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { getApiErrorMessage } from "@/api/client";
import { useCancelRide } from "@/hooks/rides/useCancelRide";
import { useRide } from "@/hooks/rides/useRide";
import { useRideSocket } from "@/hooks/socket/useRideSocket";
import { getRideFromResponse } from "@/utils/apiShapes";
import { toSearchRideView, formatUuid } from "@/utils/rideUi";
import { MapboxMap } from "@/components/map/MapboxMap";
import { useMapConfig } from "@/hooks/maps/useMapConfig";

const searchSteps = [
  {
    title: "Request sent",
    description: "We shared your ride with nearby drivers.",
    active: true,
  },
  {
    title: "Finding best driver",
    description: "Checking distance, rating, and availability.",
    active: true,
  },
  {
    title: "Waiting for acceptance",
    description: "A driver will accept your ride shortly.",
    active: false,
  },
];

function SearchingMapMock() {
  const driverDots = useMemo(
    () => [
      { left: "18%", top: "30%", delay: "0ms" },
      { left: "76%", top: "28%", delay: "250ms" },
      { left: "64%", top: "56%", delay: "500ms" },
      { left: "24%", top: "66%", delay: "750ms" },
      { left: "48%", top: "20%", delay: "1000ms" },
    ],
    []
  );

  return (
    <div className="relative h-full min-h-[380px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
        <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
        <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
      </div>

      <div className="absolute left-1/2 top-[48%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#008C78]/20 bg-[#008C78]/5">
        <div className="absolute inset-5 rounded-full border border-[#008C78]/25" />
        <div className="absolute inset-10 rounded-full border border-[#008C78]/30" />
      </div>

      <div className="absolute left-1/2 top-[48%] z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-[#008C78]/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
          <MapPin className="h-8 w-8" />
        </div>
      </div>

      {driverDots.map((dot, index) => (
        <div
          key={index}
          className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white shadow-card"
          style={{
            left: dot.left,
            top: dot.top,
            animationDelay: dot.delay,
          }}
        >
          <Car className="h-5 w-5 text-[#008C78]" />
        </div>
      ))}

      <div className="absolute left-5 top-6 z-30">
        <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
          <Radar className="mr-1 h-3.5 w-3.5 animate-pulse text-[#008C78]" />
          Searching nearby
        </Badge>
      </div>

      <div className="absolute bottom-8 left-6 right-6 z-30 rounded-[22px] border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F7F4]">
            <Loader2 className="h-5 w-5 animate-spin text-[#008C78]" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-[#101820]">
              Matching your ride
            </p>
            <p className="truncate text-xs text-[#4B5563]">
              Looking for the closest available driver
            </p>
          </div>
        </div>
      </div>
    </div>
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

function SearchProgressCard() {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#101820]">
            Driver matching
          </h3>
          <p className="mt-1 text-sm text-[#4B5563]">
            This usually takes less than a minute.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <Loader2 className="h-5 w-5 animate-spin text-[#008C78]" />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {searchSteps.map((step, index) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={
                  step.active
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#008C78] text-white"
                    : "flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F8FA] text-[#8A9099]"
                }
              >
                {step.active ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>

              {index !== searchSteps.length - 1 ? (
                <div className="mt-1 h-8 w-px bg-[#E1E5EA]" />
              ) : null}
            </div>

            <div className="pt-1">
              <p className="text-sm font-bold text-[#101820]">{step.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-[#4B5563]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FareMiniCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-[#8A9099]">Fare</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {ride.fare.currency} {ride.fare.estimated_min_fare}-
            {ride.fare.estimated_max_fare}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8A9099]">Distance</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {ride.estimated_distance_km} km
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8A9099]">ETA</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {ride.estimated_duration_min} min
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function RiderSearchingPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();
  const [showHelp, setShowHelp] = useState(false);
  const rideQuery = useRide(ride_id);
  const mapConfigQuery = useMapConfig();
  const cancelRideMutation = useCancelRide(ride_id);

  const ride = getRideFromResponse(rideQuery.data);
  const rideView = toSearchRideView(ride);

  useRideSocket({
    rideId: ride_id,
    handlers: {
      onStatusUpdate: (payload) => {
        console.log("[RiderSearching] \ud83d\udd14 ride:status:update received:", payload);
        if (payload?.ride_id !== ride_id) return;
        const status = payload.new_status || payload.status;
        if (status === "accepted" || status === "driver_assigned") {
          navigate(`/rider/ride/${ride_id}/live`, { replace: true });
        }
        if (status === "cancelled") {
          navigate("/rider/home", { replace: true });
        }
      },
      onCancelled: (payload) => {
        console.log("[RiderSearching] \ud83d\udd14 ride:cancelled received:", payload);
        if (!payload?.ride_id || payload.ride_id === ride_id) {
          navigate("/rider/home", { replace: true });
        }
      },
    },
    enabled: Boolean(ride_id),
  });

  async function handleCancelRide() {
    try {
      await cancelRideMutation.mutateAsync("Rider cancelled while searching");
      navigate("/rider/home", { replace: true });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  if (rideQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading ride request..." />
      </main>
    );
  }

  if (rideQuery.isError || !ride) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Ride request not found. Return home and try again." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
        <div className="relative h-[44vh] min-h-[360px]">
          <MapboxMap
            pickup={rideView.pickup}
            dropoff={rideView.dropoff}
            mapConfig={mapConfigQuery.data}
          />

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
                    <p className="text-sm font-bold text-[#101820]">
                      Finding driver
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#101820] shadow-soft"
                aria-label="Help"
              >
                <AlertCircle className="h-5 w-5" />
              </button>
            </div>

            {showHelp ? (
              <div className="mt-3 rounded-[18px] border border-white/70 bg-white/95 p-3 text-sm leading-5 text-[#4B5563] shadow-soft backdrop-blur">
                You can cancel before a driver accepts. Once a driver accepts,
                the app will move to live tracking.
              </div>
            ) : null}
          </header>
        </div>

        <div className="-mt-7 relative z-50 rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-6 pt-4 shadow-sheet">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
                {rideView.nearby_drivers_count} drivers nearby
              </Badge>

              <h1 className="mt-4 text-[30px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
                Looking for your driver
              </h1>

              <p className="mt-2 text-base leading-6 text-[#4B5563]">
                We are checking nearby drivers within {rideView.search_radius_km}
                km of your pickup.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#F1FBF9]">
              <Radar className="h-7 w-7 animate-pulse text-[#008C78]" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <RouteSummaryCard ride={rideView} />
            <FareMiniCard ride={rideView} />
            <SearchProgressCard />

            <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F8FA]">
                  <UserRound className="h-5 w-5 text-[#008C78]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#101820]">
                    Ride request ID
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#4B5563]">
                    {formatUuid(ride_id)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-[#E1E5EA] px-3 text-sm font-semibold text-[#101820]"
                >
                  <Phone className="mr-1.5 h-4 w-4 text-[#008C78]" />
                  Help
                </Button>
              </div>
            </Card>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-[52px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#DC2626]"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Cancel ride request
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-[360px] rounded-[24px] border-[#E1E5EA] bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-[#101820]">
                    Cancel ride request?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-base leading-6 text-[#4B5563]">
                    You can cancel now because no driver has accepted yet.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 sm:gap-2">
                  <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                    Keep searching
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleCancelRide}
                    className="h-12 rounded-[14px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C]"
                  >
                    Cancel ride
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    </main>
  );
}
