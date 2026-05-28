import { useState } from "react";
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
import { useRide } from "@/hooks/rides/useRide";
import { useRideLive } from "@/hooks/rides/useRideLive";
import { useRideRoute } from "@/hooks/rides/useRideRoute";
import {
  useCompleteRide,
  useSubmitRideTracking,
} from "@/hooks/rides/useRideActions";
import {
  getLiveStateFromResponse,
  getRideFromResponse,
  getRouteFromResponse,
} from "@/utils/apiShapes";
import { toDriverTripView } from "@/utils/rideUi";

const demoRide = {
  ride_id: "ride_123",
  status: "started",
  started_at: "4:22 PM",
  rider: {
    name: "Ali Khan",
    initials: "AK",
    rating: 5.0,
    phone: "+92 300 1234567",
  },
  pickup: {
    address: "Gulberg, Lahore",
    detail: "Main Boulevard, near Liberty signal",
  },
  dropoff: {
    address: "Johar Town, Lahore",
    detail: "Near Emporium Mall",
    landmark: "Gate 3 entrance",
  },
  trip: {
    distance_total_km: 12.4,
    distance_remaining_km: 7.8,
    duration_total_min: 33,
    eta_min: 21,
    traffic_delay_min: 6,
    fare_range: "PKR 630-770",
    progress_percent: 38,
  },
  next_instruction: "Continue on Canal Road for 4.2 km",
  note: "Call me when arrived",
};

function ActiveTripMapMock({ ride }) {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
        <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
        <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
      </div>

      <div className="absolute left-[23%] top-[66%] h-[6px] w-[36%] rotate-[-22deg] rounded-full bg-[#D7DCE2]" />
      <div className="absolute left-[45%] top-[50%] h-[6px] w-[34%] rotate-[-8deg] rounded-full bg-[#D7DCE2]" />
      <div className="absolute left-[57%] top-[41%] h-[6px] w-[24%] rotate-[24deg] rounded-full bg-[#D7DCE2]" />

      <div className="absolute left-[23%] top-[66%] h-[6px] w-[30%] rotate-[-22deg] rounded-full bg-[#008C78]" />

      <div className="absolute left-[20%] top-[70%] z-20 -translate-x-1/2 -translate-y-full">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
          <MapPin className="h-6 w-6" />
        </div>
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#008C78]" />
      </div>

      <div className="absolute right-[15%] top-[34%] z-20 -translate-x-1/2 -translate-y-full">
        <div className="absolute inset-0 h-14 w-14 animate-ping rounded-full bg-[#101820]/15" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#101820] text-white shadow-card">
          <Flag className="h-7 w-7" />
        </div>
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#101820]" />
      </div>

      <div className="absolute left-[45%] top-[53%] z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card">
        <Car className="h-7 w-7" />
      </div>

      <div className="absolute left-5 top-6 z-30">
        <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
          <Navigation className="mr-1 h-3.5 w-3.5" />
          Trip active
        </Badge>
      </div>

      <div className="absolute bottom-8 left-6 right-6 z-30 rounded-[22px] border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#101820]">
              {ride.next_instruction}
            </p>
            <p className="mt-1 truncate text-xs text-[#4B5563]">
              Dropoff: {ride.dropoff.address}
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

function TripProgressCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#4B5563]">Dropoff ETA</p>
          <h2 className="mt-1 text-[38px] font-bold leading-[44px] tracking-[-0.05em] text-[#101820]">
            {ride.trip.eta_min} min
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Started at {ride.started_at}
          </p>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
          <Navigation className="mr-1 h-3.5 w-3.5" />
          On trip
        </Badge>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#8A9099]">Trip progress</p>
          <p className="text-xs font-bold text-[#008C78]">
            {ride.trip.progress_percent}%
          </p>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E1E5EA]">
          <div
            className="h-full rounded-full bg-[#008C78]"
            style={{ width: `${ride.trip.progress_percent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.distance_remaining_km} km
          </p>
          <p className="text-xs text-[#8A9099]">Remaining</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.eta_min} min
          </p>
          <p className="text-xs text-[#8A9099]">ETA</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Timer className="h-4 w-4 text-[#F59E0B]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.trip.traffic_delay_min}m
          </p>
          <p className="text-xs text-[#8A9099]">Traffic</p>
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
    </Card>
  );
}

function RouteSummaryCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Route</h2>
      <p className="mt-1 text-sm text-[#4B5563]">
        Continue to the rider’s destination.
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
            <p className="mt-0.5 truncate text-xs text-[#4B5563]">
              {ride.pickup.detail}
            </p>
          </div>

          <Separator className="my-3 bg-[#E1E5EA]" />

          <div>
            <p className="text-xs font-medium text-[#8A9099]">Dropoff</p>
            <p className="mt-1 truncate text-sm font-bold text-[#101820]">
              {ride.dropoff.address}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#4B5563]">
              {ride.dropoff.detail}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DropoffCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#101820]">
          <Flag className="h-6 w-6 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#101820]">
            Dropoff location
          </h2>

          <p className="mt-1 text-sm leading-5 text-[#4B5563]">
            {ride.dropoff.address}
          </p>

          <div className="mt-3 rounded-[16px] bg-[#F7F8FA] p-3">
            <p className="text-xs font-medium text-[#8A9099]">Landmark</p>
            <p className="mt-1 text-sm font-semibold text-[#101820]">
              {ride.dropoff.landmark}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FarePreviewCard({ ride }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-[#8A9099]">Total trip</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {ride.trip.distance_total_km} km
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8A9099]">Duration</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {ride.trip.duration_total_min} min
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8A9099]">Fare</p>
          <p className="mt-1 text-sm font-bold text-[#101820]">
            {ride.trip.fare_range}
          </p>
        </div>
      </div>
    </Card>
  );
}

function CompletionReminderCard() {
  return (
    <Card className="rounded-[24px] border-[#F59E0B]/25 bg-[#FFF7ED] p-4 shadow-none">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />

        <div>
          <p className="text-sm font-bold text-[#92400E]">
            Complete only at destination
          </p>
          <p className="mt-1 text-sm leading-5 text-[#92400E]">
            Mark the trip complete only after reaching the dropoff point and the
            rider has exited safely.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function DriverActiveTripPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();

  const [navigationMode, setNavigationMode] = useState("in_app");
  const rideQuery = useRide(ride_id);
  const liveQuery = useRideLive(ride_id);
  const routeQuery = useRideRoute(ride_id, "pickup_to_dropoff");
  const trackingMutation = useSubmitRideTracking(ride_id);
  const completeRideMutation = useCompleteRide(ride_id);

  const rideData = getRideFromResponse(rideQuery.data);
  const liveState = getLiveStateFromResponse(liveQuery.data);
  const route = getRouteFromResponse(routeQuery.data);
  const ride = toDriverTripView(rideData, liveState, route);
  const rideId = ride_id || ride.ride_id;

  async function handleCompleteRide() {
    try {
      await trackingMutation.mutateAsync({
        latitude: rideData?.dropoff?.latitude || 31.4697,
        longitude: rideData?.dropoff?.longitude || 74.2728,
        speed_kmph: 0,
        heading: 90,
        traffic_level: "medium",
        eta_min: 1,
        distance_remaining_km: 0.2,
      });

      await completeRideMutation.mutateAsync({
        actual_distance_km: rideData?.fare?.estimated_distance_km || 12.4,
        actual_duration_min: rideData?.fare?.estimated_duration_min || 33,
        actual_traffic_delay_min:
          rideData?.fare?.estimated_traffic_delay_min || 7,
        waiting_time_min: rideData?.fare?.waiting_time_min || 0,
        route_changed: false,
      });

      navigate(`/driver/rides/${rideId}/summary`);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  function handleEmergencyCancelUiOnly() {
    navigate("/driver/home", { replace: true });
  }

  if (rideQuery.isLoading || liveQuery.isLoading || routeQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading active trip..." />
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
        <div className="relative h-[48vh] min-h-[420px]">
          <ActiveTripMapMock ride={ride} />

          <header className="absolute left-0 right-0 top-0 z-40 px-5 pt-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => navigate(`/driver/rides/${rideId}/arrived`)}
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
                    Active trip
                  </p>
                  <p className="truncate text-sm font-bold text-[#101820]">
                    {ride.dropoff.address}
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
                Trip in progress
              </h1>
              <p className="mt-2 text-base leading-6 text-[#4B5563]">
                Navigate to the destination and complete the ride at dropoff.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#F1FBF9]">
              <Car className="h-7 w-7 text-[#008C78]" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <TripProgressCard ride={ride} />

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
                      Later this action can open Google Maps, Apple Maps, or
                      Mapbox navigation.
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            <RiderInfoCard ride={ride} />
            <RouteSummaryCard ride={ride} />
            <DropoffCard ride={ride} />
            <FarePreviewCard ride={ride} />
            <CompletionReminderCard />

            <Button
              type="button"
              onClick={handleCompleteRide}
              className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Complete ride
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-[52px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#DC2626]"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Emergency cancel
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-[360px] rounded-[24px] border-[#E1E5EA] bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-[#101820]">
                    Cancel active trip?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-base leading-6 text-[#4B5563]">
                    This is UI-only for now. Later this will require a reason,
                    notify the rider, and update the active ride state.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 sm:gap-2">
                  <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                    Keep trip
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleEmergencyCancelUiOnly}
                    className="h-12 rounded-[14px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C]"
                  >
                    Cancel trip
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
