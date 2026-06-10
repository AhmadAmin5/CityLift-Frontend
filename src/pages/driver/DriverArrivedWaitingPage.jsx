import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Car,
  CheckCircle2,
  Clock,
  Flag,
  Hourglass,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  ShieldCheck,
  Star,
  Timer,
  UserRound,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useStartRide, useSubmitRideTracking } from "@/hooks/rides/useRideActions";
import { getRideFromResponse } from "@/utils/apiShapes";
import { toDriverTripView } from "@/utils/rideUi";
import { MapboxMap } from "@/components/map/MapboxMap";
import { useMapConfig } from "@/hooks/maps/useMapConfig";
import { useRideSocket } from "@/hooks/socket/useRideSocket";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/tokenStorage";
import { createSocket } from "@/socket/socket";
import { PlatformGeolocation } from "@/utils/geolocation";



function ArrivedMapMock({ ride }) {
  return (
    <div className="relative h-full min-h-[410px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
        <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
        <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
      </div>

      <div className="absolute left-1/2 top-[48%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#008C78]/10">
        <div className="absolute inset-5 rounded-full border border-[#008C78]/25" />
        <div className="absolute inset-10 rounded-full border border-[#008C78]/30" />
      </div>

      <div className="absolute left-1/2 top-[48%] z-30 -translate-x-1/2 -translate-y-full">
        <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-[#008C78]/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#101820] text-white shadow-card">
          <MapPin className="h-8 w-8" />
        </div>
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#101820]" />
      </div>

      <div className="absolute left-[42%] top-[56%] z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card">
        <Car className="h-7 w-7" />
      </div>

      <div className="absolute left-[42%] top-[56%] h-[6px] w-[12%] rotate-[-24deg] rounded-full bg-[#008C78]" />

      <div className="absolute left-5 top-6 z-30">
        <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Arrived
        </Badge>
      </div>

      <div className="absolute bottom-8 left-6 right-6 z-30 rounded-[22px] border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#101820]">
              Waiting at pickup
            </p>
            <p className="mt-1 truncate text-xs text-[#4B5563]">
              {ride.pickup.address}
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F7F4]">
            <Hourglass className="h-6 w-6 text-[#008C78]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WaitingTimerCard({ ride }) {
  const isPaidWaiting = ride.waiting_min > ride.free_waiting_min;
  const paidWaitingMin = Math.max(0, ride.waiting_min - ride.free_waiting_min);

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#4B5563]">Waiting time</p>
          <h2 className="mt-1 text-[38px] font-bold leading-[44px] tracking-[-0.05em] text-[#101820]">
            {ride.waiting_min} min
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Arrived at {ride.arrived_at}
          </p>
        </div>

        <Badge
          className={
            isPaidWaiting
              ? "rounded-full bg-[#FFF7ED] px-3 py-1.5 text-[#C2410C] hover:bg-[#FFF7ED]"
              : "rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]"
          }
        >
          <Timer className="mr-1 h-3.5 w-3.5" />
          {isPaidWaiting ? `${paidWaitingMin}m extra` : "Free wait"}
        </Badge>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E1E5EA]">
        <div
          className={
            isPaidWaiting
              ? "h-full rounded-full bg-[#F59E0B]"
              : "h-full rounded-full bg-[#008C78]"
          }
          style={{
            width: `${Math.min(100, (ride.waiting_min / 8) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.free_waiting_min}m
          </p>
          <p className="text-xs text-[#8A9099]">Free wait</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Timer className="h-4 w-4 text-[#F59E0B]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {paidWaitingMin}m
          </p>
          <p className="text-xs text-[#8A9099]">Extra</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <BellRing className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            Sent
          </p>
          <p className="text-xs text-[#8A9099]">Alert</p>
        </div>
      </div>
    </Card>
  );
}

function RiderInfoCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border border-[#E1E5EA]">
          <AvatarFallback className="bg-[#E8F7F4] text-base font-bold text-[#008C78]">
            {ride.rider.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-bold text-[#101820]">
              {ride.rider.name}
            </p>
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#008C78]" />
          </div>

          <div className="mt-1 flex items-center gap-2 text-sm text-[#4B5563]">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-[#101820]">
              {ride.rider.rating}
            </span>
            <span>rider rating</span>
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

      {ride.note ? (
        <>
          <Separator className="my-4 bg-[#E1E5EA]" />

          <div className="rounded-[18px] bg-[#F7F8FA] p-3">
            <p className="text-xs font-medium text-[#8A9099]">Rider note</p>
            <p className="mt-1 text-sm font-semibold text-[#101820]">
              “{ride.note}”
            </p>
          </div>
        </>
      ) : null}
    </Card>
  );
}

function PickupLocationCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#E8F7F4]">
          <MapPin className="h-6 w-6 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#101820]">
            Pickup location
          </h2>

          <p className="mt-1 text-sm leading-5 text-[#4B5563]">
            {ride.pickup.address}
          </p>

          <div className="mt-3 rounded-[16px] bg-[#F7F8FA] p-3">
            <p className="text-xs font-medium text-[#8A9099]">Landmark</p>
            <p className="mt-1 text-sm font-semibold text-[#101820]">
              {ride.pickup.landmark}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TripPreviewCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Next trip</h2>
      <p className="mt-1 text-sm text-[#4B5563]">
        Start the ride after the rider is in the vehicle.
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

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.estimated_distance_km} km
          </p>
          <p className="text-xs text-[#8A9099]">Distance</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.estimated_duration_min} min
          </p>
          <p className="text-xs text-[#8A9099]">ETA</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Car className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.fare_range}
          </p>
          <p className="text-xs text-[#8A9099]">Fare</p>
        </div>
      </div>
    </Card>
  );
}

function SafetyReminderCard() {
  return (
    <Card className="rounded-[24px] border-[#F59E0B]/25 bg-[#FFF7ED] p-4 shadow-none">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />

        <div>
          <p className="text-sm font-bold text-[#92400E]">
            Confirm before starting
          </p>
          <p className="mt-1 text-sm leading-5 text-[#92400E]">
            Start the ride only after the rider enters the vehicle and confirms
            the destination.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function DriverArrivedWaitingPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();
  const [riderNotified, setRiderNotified] = useState(true);
  const [driverCoords, setDriverCoords] = useState(null);
  const lastEmitTimeRef = useRef(0);
  const rideQuery = useRide(ride_id);
  const startRideMutation = useStartRide(ride_id);
  const cancelRideMutation = useCancelRide(ride_id);
  const trackingMutation = useSubmitRideTracking(ride_id);

  const mapConfigQuery = useMapConfig();

  const rideData = getRideFromResponse(rideQuery.data);
  const ride = toDriverTripView(rideData);
  const rideId = ride_id || ride.ride_id;

  useEffect(() => {
    if (rideId) {
      if (!localStorage.getItem(`arrived_time_${rideId}`)) {
        localStorage.setItem(`arrived_time_${rideId}`, Date.now().toString());
      }
    }
  }, [rideId]);

  useEffect(() => {
    const flushOfflineQueue = async () => {
      if (!navigator.onLine || !rideId) return;
      const stored = localStorage.getItem(`offline_points_${rideId}`);
      if (!stored) return;
      try {
        const points = JSON.parse(stored);
        if (points.length === 0) return;
        console.log(`[OfflineSync] Flushing ${points.length} offline points...`);
        for (const pt of points) {
          await submitRideTracking({ rideId, ...pt });
        }
        localStorage.removeItem(`offline_points_${rideId}`);
        console.log(`[OfflineSync] Flush complete.`);
      } catch (e) {
        console.error("Error flushing offline points:", e);
      }
    };

    const handleOnline = () => {
      flushOfflineQueue();
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) {
      flushOfflineQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [rideId]);

  useRideSocket({
    rideId: ride_id,
    handlers: {
      onStatusUpdate: (payload) => {
        console.log("[DriverArrived] 🔔 ride:status:update received:", payload);
        const newStatus = payload?.new_status || payload?.status;
        if (payload?.ride_id !== ride_id) return;
        if (newStatus === "cancelled") {
          toast.error("Ride was cancelled by the rider");
          navigate("/driver/home", { replace: true });
        }
      },
      onCancelled: (payload) => {
        console.log("[DriverArrived] 🔔 ride:cancelled received:", payload);
        if (!payload?.ride_id || payload.ride_id === ride_id) {
          toast.error("Ride was cancelled");
          navigate("/driver/home", { replace: true });
        }
      },
      onLiveUpdate: (payload) => {
        console.log("[DriverArrived] 🔔 ride:live:update received:", payload);
        rideQuery.refetch();
      },
    },
    enabled: Boolean(ride_id),
  });

  useEffect(() => {
    let watchId = null;
    let active = true;

    async function startWatching() {
      if (!ride_id) return;

      try {
        const permissionStatus = await PlatformGeolocation.checkPermissions();
        if (permissionStatus.location !== "granted") {
          const requestStatus = await PlatformGeolocation.requestPermissions();
          if (requestStatus.location !== "granted") {
            toast.error("Location permission is required for tracking");
            return;
          }
        }

        const id = await PlatformGeolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          },
          async (position, err) => {
            if (err) {
              console.error("Continuous tracking error:", err);
              return;
            }
            if (!active) return;
            if (position?.coords) {
              const nextLoc = {
                latitude: Number(position.coords.latitude),
                longitude: Number(position.coords.longitude),
              };
              setDriverCoords(nextLoc);

              const speed_kmph = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
              const heading = position.coords.heading || 90;

              // Throttle to 5 seconds
              const now = Date.now();
              if (now - lastEmitTimeRef.current < 5000) {
                return;
              }
              lastEmitTimeRef.current = now;

              const trackingPayload = {
                latitude: nextLoc.latitude,
                longitude: nextLoc.longitude,
                speed_kmph,
                heading,
                traffic_level: "medium",
                eta_min: 0,
                distance_remaining_km: 0,
              };

              let sentSuccessfully = false;
              const token = getAccessToken();
              const socket = createSocket(token);

              if (navigator.onLine && socket?.connected) {
                try {
                  console.log("[DriverArrived] 📡 Emitting ride:tracking:update:", { ride_id, ...trackingPayload });
                  socket.emit("ride:tracking:update", { ride_id, ...trackingPayload });
                  sentSuccessfully = true;
                } catch (socketErr) {
                  console.error("[DriverArrived] Socket emit failed:", socketErr);
                }
              }

              if (!sentSuccessfully && navigator.onLine) {
                try {
                  console.log("[DriverArrived] 📡 Falling back to HTTP tracking POST...");
                  await submitRideTracking({ rideId: ride_id, ...trackingPayload });
                  sentSuccessfully = true;
                } catch (httpErr) {
                  console.error("[DriverArrived] HTTP fallback failed:", httpErr);
                }
              }

              if (!sentSuccessfully) {
                console.log("[DriverArrived] 💾 Storing telemetry locally...");
                const stored = localStorage.getItem(`offline_points_${ride_id}`);
                const points = stored ? JSON.parse(stored) : [];
                points.push(trackingPayload);
                localStorage.setItem(`offline_points_${ride_id}`, JSON.stringify(points));
                localStorage.setItem(`offline_occurred_${ride_id}`, "true");
              }
            }
          }
        );

        if (!active) {
          PlatformGeolocation.clearWatch({ id: id });
        } else {
          watchId = id;
        }
      } catch (error) {
        console.error("Failed to start watching location:", error);
      }
    }

    startWatching();

    return () => {
      active = false;
      if (watchId !== null) {
        PlatformGeolocation.clearWatch({ id: watchId });
      }
    };
  }, [ride_id]);

  async function handleStartRide() {
    try {
      await startRideMutation.mutateAsync();
      if (rideId) {
        localStorage.setItem(`started_time_${rideId}`, Date.now().toString());
      }
      navigate(`/driver/rides/${rideId}/active`);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  async function handleCancelRide() {
    try {
      await cancelRideMutation.mutateAsync("Driver cancelled after arrival");
      navigate("/driver/home", { replace: true });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  function handleNotifyAgainUiOnly() {
    setRiderNotified(true);
  }

  if (rideQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading arrived ride..." />
      </main>
    );
  }

  if (rideQuery.isError || !rideData) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Ride not found. Return home and try again." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
        <div className="relative h-[47vh] min-h-[410px]">
          <MapboxMap
            pickup={ride.pickup}
            dropoff={ride.dropoff}
            mapConfig={mapConfigQuery.data}
            nearbyDrivers={
              driverCoords
                ? [
                    {
                      driver_id: "driver",
                      latitude: driverCoords.latitude,
                      longitude: driverCoords.longitude,
                    },
                  ]
                : []
            }
          />

          <header className="absolute left-0 right-0 top-0 z-40 px-5 pt-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() =>
                  navigate(`/driver/rides/${rideId}/navigation`)
                }
                className="h-11 w-11 rounded-full border-white/70 bg-white/95 text-[#101820] shadow-soft"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Badge className="rounded-full bg-white px-3 py-2 text-[#101820] shadow-soft hover:bg-white">
                Ride {rideId}
              </Badge>
            </div>

            <div className="mt-3 rounded-[22px] border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#E8F7F4]">
                  <CheckCircle2 className="h-5 w-5 text-[#008C78]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#008C78]">
                    Driver arrived
                  </p>
                  <p className="truncate text-sm font-bold text-[#101820]">
                    Waiting for {ride.rider.name}
                  </p>
                </div>
              </div>
            </div>
          </header>
        </div>

        <div className="-mt-7 relative z-50 rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-8 pt-4 shadow-sheet">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
                You’ve arrived
              </h1>
              <p className="mt-2 text-base leading-6 text-[#4B5563]">
                Wait at the pickup point and start the ride when the rider is
                ready.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#F1FBF9]">
              <UserRound className="h-7 w-7 text-[#008C78]" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <WaitingTimerCard ride={ride} />

            {riderNotified ? (
              <Card className="rounded-[22px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <BellRing className="h-5 w-5 text-[#008C78]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#101820]">
                      Rider notified
                    </p>
                    <p className="mt-0.5 text-xs text-[#4B5563]">
                      We showed the rider that you have arrived.
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            <RiderInfoCard ride={ride} />
            <PickupLocationCard ride={ride} />
            <TripPreviewCard ride={ride} />
            <SafetyReminderCard />

            <Button
              type="button"
              onClick={handleStartRide}
              className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Start ride
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleNotifyAgainUiOnly}
                className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
              >
                <BellRing className="mr-2 h-5 w-5 text-[#008C78]" />
                Notify
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#DC2626]"
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="max-w-[360px] rounded-[24px] border-[#E1E5EA] bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-[#101820]">
                      Cancel after arrival?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-base leading-6 text-[#4B5563]">
                      This will cancel the ride and notify the rider.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                      Keep waiting
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
        </div>
      </section>
    </main>
  );
}
