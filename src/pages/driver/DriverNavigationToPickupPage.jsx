import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Flag,
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
import { useRideLive } from "@/hooks/rides/useRideLive";
import { useRideRoute } from "@/hooks/rides/useRideRoute";
import { useArriveRide, useSubmitRideTracking } from "@/hooks/rides/useRideActions";
import { useRideSocket } from "@/hooks/socket/useRideSocket";
import { getAccessToken } from "@/utils/tokenStorage";
import { createSocket } from "@/socket/socket";
import { PlatformGeolocation } from "@/utils/geolocation";
import { toast } from "sonner";
import {
  getLiveStateFromResponse,
  getRideFromResponse,
  getRouteFromResponse,
} from "@/utils/apiShapes";
import { toDriverTripView } from "@/utils/rideUi";
import { MapboxMap } from "@/components/map/MapboxMap";
import { useMapConfig } from "@/hooks/maps/useMapConfig";



function NavigationMapMock({ trip }) {
  const driverPositions = useMemo(
    () => [
      { left: "30%", top: "68%" },
      { left: "40%", top: "56%" },
      { left: "50%", top: "45%" },
      { left: "58%", top: "34%" },
    ],
    []
  );

  return (
    <div className="relative h-full min-h-[410px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
        <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
        <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
      </div>

      <div className="absolute left-[34%] top-[64%] h-[6px] w-[42%] rotate-[-36deg] rounded-full bg-[#008C78]" />
      <div className="absolute left-[52%] top-[39%] h-[6px] w-[24%] rotate-[-12deg] rounded-full bg-[#008C78]" />

      {driverPositions.map((position, index) => (
        <div
          key={index}
          className="absolute h-2.5 w-2.5 rounded-full bg-[#008C78]"
          style={{
            left: position.left,
            top: position.top,
            opacity: 0.3 + index * 0.18,
          }}
        />
      ))}

      <div className="absolute left-[29%] top-[70%] z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card">
        <Car className="h-7 w-7" />
      </div>

      <div className="absolute right-[21%] top-[30%] z-30 -translate-x-1/2 -translate-y-full">
        <div className="absolute inset-0 h-14 w-14 animate-ping rounded-full bg-[#008C78]/20" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#101820] text-white shadow-card">
          <MapPin className="h-7 w-7" />
        </div>
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#101820]" />
      </div>

      <div className="absolute left-5 top-6 z-30">
        <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
          <Navigation className="mr-1 h-3.5 w-3.5 text-[#008C78]" />
          To pickup
        </Badge>
      </div>

      <div className="absolute bottom-8 left-6 right-6 z-30 rounded-[22px] border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#101820]">
              {trip.route_to_pickup.next_instruction}
            </p>
            <p className="mt-1 truncate text-xs text-[#4B5563]">
              Pickup: {trip.pickup.address}
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F7F4]">
            <Compass className="h-6 w-6 text-[#008C78]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RiderInfoCard({ trip }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border border-[#E1E5EA]">
          <AvatarFallback className="bg-[#E8F7F4] text-base font-bold text-[#008C78]">
            {trip.rider.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-bold text-[#101820]">
              {trip.rider.name}
            </p>
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#008C78]" />
          </div>

          <div className="mt-1 flex items-center gap-2 text-sm text-[#4B5563]">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-[#101820]">
              {trip.rider.rating}
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

      {trip.note ? (
        <>
          <Separator className="my-4 bg-[#E1E5EA]" />

          <div className="rounded-[18px] bg-[#F7F8FA] p-3">
            <p className="text-xs font-medium text-[#8A9099]">Rider note</p>
            <p className="mt-1 text-sm font-semibold text-[#101820]">
              “{trip.note}”
            </p>
          </div>
        </>
      ) : null}
    </Card>
  );
}

function PickupProgressCard({ trip }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#4B5563]">Pickup ETA</p>
          <h2 className="mt-1 text-[34px] font-bold leading-10 tracking-[-0.05em] text-[#101820]">
            {trip.route_to_pickup.eta_min} min
          </h2>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
          <Car className="mr-1 h-3.5 w-3.5" />
          En route
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {trip.route_to_pickup.distance_km} km
          </p>
          <p className="text-xs text-[#8A9099]">Distance</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {trip.route_to_pickup.eta_min} min
          </p>
          <p className="text-xs text-[#8A9099]">ETA</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Timer className="h-4 w-4 text-[#F59E0B]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {trip.route_to_pickup.traffic_delay_min}m
          </p>
          <p className="text-xs text-[#8A9099]">Traffic</p>
        </div>
      </div>
    </Card>
  );
}

function RouteSummaryCard({ trip }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Trip route</h2>
      <p className="mt-1 text-sm text-[#4B5563]">
        Go to pickup first, then start the ride.
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
              {trip.pickup.address}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#4B5563]">
              {trip.pickup.detail}
            </p>
          </div>

          <Separator className="my-3 bg-[#E1E5EA]" />

          <div>
            <p className="text-xs font-medium text-[#8A9099]">Dropoff later</p>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {trip.dropoff.address}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#4B5563]">
              {trip.dropoff.detail}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TripMetaCard({ trip }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-[#8A9099]">Trip distance</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {trip.full_trip.estimated_distance_km} km
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8A9099]">Trip time</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {trip.full_trip.estimated_duration_min} min
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8A9099]">Fare</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {trip.full_trip.fare_range}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function DriverNavigationToPickupPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();

  const [navigationMode, setNavigationMode] = useState("in_app");
  const [driverCoords, setDriverCoords] = useState(null);
  const lastEmitTimeRef = useRef(0);
  const rideQuery = useRide(ride_id);
  const liveQuery = useRideLive(ride_id);
  const routeQuery = useRideRoute(ride_id, "driver_to_pickup");
  const arriveMutation = useArriveRide(ride_id);
  const cancelRideMutation = useCancelRide(ride_id);
  const trackingMutation = useSubmitRideTracking(ride_id);

  const mapConfigQuery = useMapConfig();

  const ride = getRideFromResponse(rideQuery.data);
  const liveState = getLiveStateFromResponse(liveQuery.data);
  const route = getRouteFromResponse(routeQuery.data);
  const trip = toDriverTripView(ride, liveState, route);
  const rideId = ride_id || trip.ride_id;

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
        console.log("[DriverNavigation] 🔔 ride:status:update received:", payload);
        const newStatus = payload?.new_status || payload?.status;
        if (payload?.ride_id !== ride_id) return;
        if (newStatus === "cancelled") {
          toast.error("Ride was cancelled by the rider");
          navigate("/driver/home", { replace: true });
        }
      },
      onCancelled: (payload) => {
        console.log("[DriverNavigation] 🔔 ride:cancelled received:", payload);
        if (!payload?.ride_id || payload.ride_id === ride_id) {
          toast.error("Ride was cancelled");
          navigate("/driver/home", { replace: true });
        }
      },
      onLiveUpdate: (payload) => {
        console.log("[DriverNavigation] 🔔 ride:live:update received:", payload);
        liveQuery.refetch();
      },
      onRouteUpdate: (payload) => {
        console.log("[DriverNavigation] 🔔 ride:route:update received:", payload);
        routeQuery.refetch();
      },
    },
    enabled: Boolean(ride_id),
  });

  useEffect(() => {
    let watchId = null;

    async function startWatching() {
      if (!ride_id) return;

      try {
        const permissionStatus = await PlatformGeolocation.checkPermissions();
        if (permissionStatus.location !== "granted") {
          const requestStatus = await PlatformGeolocation.requestPermissions();
          if (requestStatus.location !== "granted") {
            toast.error("Location permission is required for navigation");
            return;
          }
        }

        watchId = await PlatformGeolocation.watchPosition(
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
            if (position?.coords) {
              const nextLoc = {
                latitude: Number(position.coords.latitude),
                longitude: Number(position.coords.longitude),
              };
              setDriverCoords(nextLoc);

              const speed_kmph = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
              const heading = position.coords.heading || 90;
              const eta_min = trip.route_to_pickup?.eta_min || 5;
              const distance_remaining_km = trip.route_to_pickup?.distance_km || 1.4;

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
                eta_min,
                distance_remaining_km,
              };

              let sentSuccessfully = false;
              const token = getAccessToken();
              const socket = createSocket(token);

              if (navigator.onLine && socket?.connected) {
                try {
                  console.log("[DriverNavigation] 📡 Emitting ride:tracking:update:", { ride_id, ...trackingPayload });
                  socket.emit("ride:tracking:update", { ride_id, ...trackingPayload });
                  sentSuccessfully = true;
                } catch (socketErr) {
                  console.error("[DriverNavigation] Socket emit failed:", socketErr);
                }
              }

              if (!sentSuccessfully && navigator.onLine) {
                try {
                  console.log("[DriverNavigation] 📡 Falling back to HTTP tracking POST...");
                  await submitRideTracking({ rideId: ride_id, ...trackingPayload });
                  sentSuccessfully = true;
                } catch (httpErr) {
                  console.error("[DriverNavigation] HTTP fallback failed:", httpErr);
                }
              }

              if (!sentSuccessfully) {
                console.log("[DriverNavigation] 💾 Storing telemetry locally...");
                const stored = localStorage.getItem(`offline_points_${ride_id}`);
                const points = stored ? JSON.parse(stored) : [];
                points.push(trackingPayload);
                localStorage.setItem(`offline_points_${ride_id}`, JSON.stringify(points));
                localStorage.setItem(`offline_occurred_${ride_id}`, "true");
              }
            }
          }
        );
      } catch (error) {
        console.error("Failed to start watching location:", error);
      }
    }

    startWatching();

    return () => {
      if (watchId !== null) {
        PlatformGeolocation.clearWatch({ id: watchId });
      }
    };
  }, [ride_id, trip.route_to_pickup?.eta_min, trip.route_to_pickup?.distance_km]);

  async function handleArrived() {
    try {
      await arriveMutation.mutateAsync();
      navigate(`/driver/rides/${rideId}/arrived`);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  async function handleCancelRide() {
    try {
      await cancelRideMutation.mutateAsync("Driver cancelled before pickup");
      navigate("/driver/home", { replace: true });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  if (rideQuery.isLoading || liveQuery.isLoading || routeQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading pickup navigation..." />
      </main>
    );
  }

  if (rideQuery.isError || !ride) {
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
            pickup={trip.pickup}
            dropoff={trip.dropoff}
            route={route}
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
                : (liveState?.latitude || liveState?.current_location?.latitude)
                ? [
                    {
                      driver_id: "driver",
                      latitude: liveState.latitude || liveState.current_location?.latitude,
                      longitude: liveState.longitude || liveState.current_location?.longitude,
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
                onClick={() => navigate("/driver/home")}
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
                  <Navigation className="h-5 w-5 text-[#008C78]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#008C78]">
                    Navigate to pickup
                  </p>
                  <p className="truncate text-sm font-bold text-[#101820]">
                    {trip.pickup.address}
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
                Head to pickup
              </h1>
              <p className="mt-2 text-base leading-6 text-[#4B5563]">
                Drive to the rider pickup point and mark arrived when you reach.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#F1FBF9]">
              <MapPin className="h-7 w-7 text-[#008C78]" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <PickupProgressCard trip={trip} />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNavigationMode("in_app")}
                className={
                  navigationMode === "in_app"
                    ? "h-12 rounded-[14px] bg-[#E8F7F4] text-sm font-semibold text-[#008C78]"
                    : "h-12 rounded-[14px] border border-[#E1E5EA] bg-white text-sm font-semibold text-[#4B5563]"
                }
              >
                In-app route
              </button>

              <button
                type="button"
                onClick={() => setNavigationMode("external")}
                className={
                  navigationMode === "external"
                    ? "h-12 rounded-[14px] bg-[#E8F7F4] text-sm font-semibold text-[#008C78]"
                    : "h-12 rounded-[14px] border border-[#E1E5EA] bg-white text-sm font-semibold text-[#4B5563]"
                }
              >
                Maps app
              </button>
            </div>

            {navigationMode === "external" ? (
              <Card className="rounded-[22px] border-[#F59E0B]/25 bg-[#FFF7ED] p-4 shadow-none">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-bold text-[#92400E]">
                      External navigation preview
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[#92400E]">
                      Later this button can open Google Maps, Apple Maps, or
                      Mapbox navigation.
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            <RiderInfoCard trip={trip} />
            <RouteSummaryCard trip={trip} />
            <TripMetaCard trip={trip} />

            <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
                  <UserRound className="h-5 w-5 text-[#008C78]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#101820]">
                    Pickup reminder
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#4B5563]">
                    Confirm rider identity before starting the trip.
                  </p>
                </div>
              </div>
            </Card>

            <Button
              type="button"
              onClick={handleArrived}
              className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              I’ve arrived
            </Button>

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
                    This will cancel the ride and notify the rider.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 sm:gap-2">
                  <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                    Keep ride
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
