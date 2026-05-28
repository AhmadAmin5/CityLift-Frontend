import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Car, LogOut, MapPin, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapboxMap } from "@/components/map/MapboxMap";
import { RideActionSheet } from "@/components/ride/RideActionSheet";

import { useMe } from "@/hooks/auth/useMe";
import { useRiderProfile } from "@/hooks/rider/useRiderProfile";
import { useSavedPlaces } from "@/hooks/rider/useSavedPlaces";
import { useMapConfig } from "@/hooks/maps/useMapConfig";
import { useNearbyDrivers } from "@/hooks/maps/useNearbyDrivers";
import { useSurgeZones } from "@/hooks/maps/useSurgeZones";
import { useRoutePreview } from "@/hooks/maps/useRoutePreview";
import { useReverseGeocode } from "@/hooks/maps/useReverseGeocode";
import { useRideEstimate } from "@/hooks/rides/useRideEstimate";
import { useCreateRide } from "@/hooks/rides/useCreateRide";

import { getApiErrorMessage } from "@/api/client";
import { queryKeys } from "@/query/queryKeys";
import { clearAccessToken } from "@/utils/tokenStorage";
import { normalizeLocation } from "@/utils/locationUtils";

const LAHORE_DEFAULT_LOCATION = {
    latitude: 31.5204,
    longitude: 74.3587,
    address: "Gulberg, Lahore",
    provider: "mapbox",
    provider_place_id: "mock.current_location.lahore",
};

function getScheduledPickupAt(rideType) {
    if (rideType !== "scheduled" && rideType !== "recurring") return null;

    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + 2);

    return scheduledDate.toISOString();
}

function getRecurrenceRule(rideType) {
    if (rideType !== "recurring") return null;
    return "FREQ=DAILY;COUNT=5";
}

function normalizePlace(place, fallback = {}) {
    return normalizeLocation(place, fallback);
}

function buildRoutePayload({ pickup, dropoff, stops }) {
    return {
        origin: {
            latitude: pickup.latitude,
            longitude: pickup.longitude,
        },
        destination: {
            latitude: dropoff.latitude,
            longitude: dropoff.longitude,
        },
        stops: stops
            .filter((stop) => stop.latitude && stop.longitude)
            .map((stop) => ({
                latitude: stop.latitude,
                longitude: stop.longitude,
            })),
        vehicle_type: "car",
    };
}

function buildEstimatePayload({ pickup, dropoff, stops, rideType }) {
    return {
        ride_type: rideType,
        scheduled_pickup_at: getScheduledPickupAt(rideType),
        recurrence_rule: getRecurrenceRule(rideType),
        vehicle_type: "car",
        pickup,
        dropoff,
        stops: stops
            .filter((stop) => stop.latitude && stop.longitude)
            .map((stop, index) => ({
                stop_order: index + 2,
                stop_type: "intermediate",
                latitude: stop.latitude,
                longitude: stop.longitude,
                address: stop.address,
                provider: stop.provider || "mapbox",
                provider_place_id: stop.provider_place_id || null,
            })),
    };
}

function buildCreateRidePayload({
    pickup,
    dropoff,
    stops,
    riderNote,
    rideType,
}) {
    const validStops = stops.filter((stop) => stop.latitude && stop.longitude);

    return {
        ride_type: rideType,
        scheduled_pickup_at: getScheduledPickupAt(rideType),
        recurrence_rule: getRecurrenceRule(rideType),
        rider_note_to_driver: riderNote || null,
        vehicle_type: "car",
        stops: [
            {
                stop_order: 1,
                stop_type: "pickup",
                latitude: pickup.latitude,
                longitude: pickup.longitude,
                address: pickup.address,
                provider: pickup.provider || "mapbox",
                provider_place_id: pickup.provider_place_id || null,
            },
            ...validStops.map((stop, index) => ({
                stop_order: index + 2,
                stop_type: "intermediate",
                latitude: stop.latitude,
                longitude: stop.longitude,
                address: stop.address,
                provider: stop.provider || "mapbox",
                provider_place_id: stop.provider_place_id || null,
            })),
            {
                stop_order: validStops.length + 2,
                stop_type: "dropoff",
                latitude: dropoff.latitude,
                longitude: dropoff.longitude,
                address: dropoff.address,
                provider: dropoff.provider || "mapbox",
                provider_place_id: dropoff.provider_place_id || null,
            },
        ],
    };
}

export default function RiderHomePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const meQuery = useMe();
    const riderQuery = useRiderProfile();
    const savedPlacesQuery = useSavedPlaces();
    const mapConfigQuery = useMapConfig();
    const surgeZonesQuery = useSurgeZones("Lahore");

    const reverseGeocodeMutation = useReverseGeocode();
    const routePreviewMutation = useRoutePreview();
    const estimateMutation = useRideEstimate();
    const createRideMutation = useCreateRide();

    const [pickup, setPickup] = useState(LAHORE_DEFAULT_LOCATION);
    const [dropoff, setDropoff] = useState(null);
    const [stops, setStops] = useState([]);
    const [rideType, setRideType] = useState("standard");
    const [riderNote, setRiderNote] = useState("Call me when arrived");
    const [mapSelectionTarget, setMapSelectionTarget] = useState("pickup");

    const nearbyDriversQuery = useNearbyDrivers({
        latitude: pickup?.latitude,
        longitude: pickup?.longitude,
        radius_km: 3,
    });

    const savedPlaces = savedPlacesQuery.data || [];
    const nearbyDrivers = nearbyDriversQuery.data || [];
    const surgeZones = surgeZonesQuery.data || [];
    const rider = riderQuery.data?.rider || riderQuery.data;
    const user = meQuery.data?.user;

    const routePreview = routePreviewMutation.data;
    const route = routePreview?.route;
    const estimate = estimateMutation.data;

    const activeSurgeZone = useMemo(() => {
        return surgeZones.find((zone) => Number(zone.surge_multiplier) > 1);
    }, [surgeZones]);

    function handleLogout() {
        clearAccessToken();
        queryClient.removeQueries({ queryKey: queryKeys.me });
        navigate("/auth/login", { replace: true });
    }

    async function handlePickupPinChange(location) {
        await handleMapLocationChange("pickup", location);
    }

    async function handleMapLocationChange(target, location) {
        const fallbackLocation = {
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            address:
                target === "dropoff"
                    ? "Selected dropoff pin"
                    : "Selected pickup pin",
            provider: "mapbox",
            provider_place_id: null,
        };

        if (target === "dropoff") {
            setDropoff(fallbackLocation);
        } else {
            setPickup(fallbackLocation);
        }

        estimateMutation.reset();
        routePreviewMutation.reset();

        try {
            const data = await reverseGeocodeMutation.mutateAsync({
                latitude: fallbackLocation.latitude,
                longitude: fallbackLocation.longitude,
            });

            const nextLocation = normalizeLocation(data, fallbackLocation);

            if (nextLocation) {
                if (target === "dropoff") {
                    setDropoff(nextLocation);
                } else {
                    setPickup(nextLocation);
                }
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    }

    function handleSetPickup(place) {
        setPickup(normalizePlace(place));
        estimateMutation.reset();
        routePreviewMutation.reset();
    }

    function handleSetDropoff(place) {
        setDropoff(normalizePlace(place));
        estimateMutation.reset();
        routePreviewMutation.reset();
    }

    function handleSetStops(updater) {
        setStops((current) => {
            const nextStops =
                typeof updater === "function" ? updater(current) : updater;

            return nextStops;
        });

        estimateMutation.reset();
        routePreviewMutation.reset();
    }

    async function handleEstimate() {
        if (!pickup || !dropoff) {
            toast.error("Select pickup and dropoff first");
            return;
        }

        try {
            await routePreviewMutation.mutateAsync(
                buildRoutePayload({
                    pickup,
                    dropoff,
                    stops,
                }),
            );

            await estimateMutation.mutateAsync(
                buildEstimatePayload({
                    pickup,
                    dropoff,
                    stops,
                    rideType,
                }),
            );

            toast.success("Route and fare ready");
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    }

    async function handleCreateRide() {
        if (!pickup || !dropoff) {
            toast.error("Select pickup and dropoff first");
            return;
        }

        try {
            const data = await createRideMutation.mutateAsync(
                buildCreateRidePayload({
                    pickup,
                    dropoff,
                    stops,
                    riderNote,
                    rideType,
                }),
            );

            const ride = data?.ride || data;
            const rideId = ride?.id || ride?.ride_id;

            if (!rideId) {
                toast.error("Ride created, but ride id was missing");
                return;
            }

            toast.success("Ride requested");
            navigate(`/rider/ride/${rideId}/searching`, { replace: true });
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    }

    const isInitialLoading =
        meQuery.isLoading ||
        riderQuery.isLoading ||
        savedPlacesQuery.isLoading ||
        mapConfigQuery.isLoading;

    const hasInitialError =
        meQuery.isError ||
        riderQuery.isError ||
        savedPlacesQuery.isError ||
        mapConfigQuery.isError;

    if (hasInitialError) {
        return (
            <main className="min-h-screen bg-white">
                <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50">
                        <MapPin className="h-8 w-8 text-[#DC2626]" />
                    </div>
                    <h1 className="mt-5 text-2xl font-bold text-[#101820]">
                        Could not load rider home
                    </h1>
                    <p className="mt-2 text-base text-[#4B5563]">
                        Please check the mock server and try again.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
                <div className="relative h-[48vh] min-h-[390px]">
                    <MapboxMap
                        pickup={pickup}
                        dropoff={dropoff}
                        nearbyDrivers={nearbyDrivers}
                        surgeZones={surgeZones}
                        mapConfig={mapConfigQuery.data}
                        route={route}
                        locationSelectionTarget={mapSelectionTarget}
                        onPickupChange={handlePickupPinChange}
                        onLocationChange={handleMapLocationChange}
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
                                            Good day
                                        </p>
                                        <p className="max-w-[170px] truncate text-sm font-bold text-[#101820]">
                                            {user?.name || "Rider"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#101820] shadow-soft"
                                    aria-label="Notifications"
                                >
                                    <Bell className="h-5 w-5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#101820] shadow-soft"
                                    aria-label="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
                                <Star className="mr-1 h-3.5 w-3.5 text-[#F59E0B]" />
                                {rider?.average_rating || "5.0"} rating
                            </Badge>

                            <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
                                <Car className="mr-1 h-3.5 w-3.5 text-[#008C78]" />
                                {nearbyDriversQuery.isLoading
                                    ? "Loading"
                                    : `${nearbyDrivers.length} nearby`}
                            </Badge>

                            {activeSurgeZone ? (
                                <Badge className="rounded-full bg-[#FFF7ED] px-3 py-1.5 text-[#C2410C] shadow-soft hover:bg-[#FFF7ED]">
                                    <Zap className="mr-1 h-3.5 w-3.5" />
                                    {activeSurgeZone.surge_multiplier}x surge
                                </Badge>
                            ) : null}
                        </div>
                    </header>
                </div>

                {isInitialLoading ? (
                    <div className="-mt-6 rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-6 pt-6 shadow-sheet">
                        <Skeleton className="h-7 w-40 rounded-full" />
                        <Skeleton className="mt-4 h-14 rounded-[16px]" />
                        <Skeleton className="mt-4 h-14 rounded-[16px]" />
                        <Skeleton className="mt-4 h-14 rounded-[16px]" />
                    </div>
                ) : (
                    <div className="-mt-7 relative z-50">
                        {savedPlaces.length ? (
                            <div className="mb-3 flex gap-2 overflow-x-auto px-6 pb-1">
                                {savedPlaces.slice(0, 4).map((place) => (
                                    <button
                                        key={place.id}
                                        type="button"
                                        onClick={() => handleSetDropoff(place)}
                                        className="flex shrink-0 items-center gap-2 rounded-full border border-[#E1E5EA] bg-white px-3 py-2 text-sm font-semibold text-[#101820] shadow-soft"
                                    >
                                        <MapPin className="h-4 w-4 text-[#008C78]" />
                                        {place.label}
                                    </button>
                                ))}
                            </div>
                        ) : null}

                        <RideActionSheet
                            pickup={pickup}
                            dropoff={dropoff}
                            stops={stops}
                            riderNote={riderNote}
                            rideType={rideType}
                            setPickup={handleSetPickup}
                            setDropoff={handleSetDropoff}
                            setStops={handleSetStops}
                            setRiderNote={setRiderNote}
                            setRideType={(nextRideType) => {
                                setRideType(nextRideType);
                                estimateMutation.reset();
                                routePreviewMutation.reset();
                            }}
                            mapSelectionTarget={mapSelectionTarget}
                            setMapSelectionTarget={setMapSelectionTarget}
                            savedPlaces={savedPlaces}
                            currentLocation={pickup || LAHORE_DEFAULT_LOCATION}
                            estimate={estimate}
                            routePreview={routePreview}
                            isEstimating={
                                routePreviewMutation.isPending ||
                                estimateMutation.isPending
                            }
                            isCreating={createRideMutation.isPending}
                            onEstimate={handleEstimate}
                            onCreateRide={handleCreateRide}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}
