import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { MapboxMap } from "@/components/map/MapboxMap";
import { RideActionSheet } from "@/components/ride/RideActionSheet";
import { HomeSidebar } from "@/components/navigation/HomeSidebar";

import { useMe } from "@/hooks/auth/useMe";
import { useRiderProfile } from "@/hooks/rider/useRiderProfile";
import { useSavedPlaces } from "@/hooks/rider/useSavedPlaces";
import { useMapConfig } from "@/hooks/maps/useMapConfig";
import { useNearbyDrivers } from "@/hooks/maps/useNearbyDrivers";
import { useSurgeZones } from "@/hooks/maps/useSurgeZones";
import { useReverseGeocode } from "@/hooks/maps/useReverseGeocode";

import { getApiErrorMessage } from "@/api/client";
import { hasValidCoordinates, normalizeLocation } from "@/utils/locationUtils";

const LAHORE_DEFAULT_LOCATION = {
    latitude: 31.5204,
    longitude: 74.3587,
    address: "Gulberg, Lahore",
    provider: "mapbox",
    provider_place_id: "mock.current_location.lahore",
};

function normalizePlace(place, fallback = {}) {
    return normalizeLocation(place, fallback);
}

export default function RiderHomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const mapAreaRef = useRef(null);

    const meQuery = useMe();
    const riderQuery = useRiderProfile();
    const savedPlacesQuery = useSavedPlaces();
    const mapConfigQuery = useMapConfig();
    const surgeZonesQuery = useSurgeZones("Lahore");

    const reverseGeocodeMutation = useReverseGeocode();

    const [pickup, setPickup] = useState(LAHORE_DEFAULT_LOCATION);
    const [dropoff, setDropoff] = useState(null);
    const [stops, setStops] = useState([]);
    const [rideType, setRideType] = useState("standard");
    const [riderNote, setRiderNote] = useState("Call me when arrived");

    const [mapSelectionTarget, setMapSelectionTarget] = useState(null);
    const [isMapPickerActive, setIsMapPickerActive] = useState(false);

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

    useEffect(() => {
        const savedPlace = location.state?.saved_place;
        const useAs = location.state?.use_as;
        const selectedPlace = normalizePlace(savedPlace);

        if (!selectedPlace || !useAs) return;

        if (useAs === "pickup") {
            setPickup(selectedPlace);
        } else {
            setDropoff(selectedPlace);
        }

        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);

    function handlePickLocationFromMap(target) {
        const safeTarget = target === "dropoff" ? "dropoff" : "pickup";

        setMapSelectionTarget(safeTarget);
        setIsMapPickerActive(true);

        requestAnimationFrame(() => {
            mapAreaRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });

        toast.message(
            safeTarget === "dropoff"
                ? "Tap the map to set dropoff"
                : "Tap the map to set pickup",
        );
    }

    async function handlePickupPinChange(location) {
        await handleMapLocationChange("pickup", location);
    }

    async function handleMapLocationChange(target, location) {
        const safeTarget = target === "dropoff" ? "dropoff" : "pickup";

        const fallbackLocation = {
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            address:
                safeTarget === "dropoff"
                    ? "Selected dropoff pin"
                    : "Selected pickup pin",
            provider: "mapbox",
            provider_place_id: null,
        };

        if (safeTarget === "dropoff") {
            setDropoff(fallbackLocation);
        } else {
            setPickup(fallbackLocation);
        }

        setIsMapPickerActive(false);

        try {
            const data = await reverseGeocodeMutation.mutateAsync({
                latitude: fallbackLocation.latitude,
                longitude: fallbackLocation.longitude,
            });

            const nextLocation = normalizeLocation(data, fallbackLocation);

            if (nextLocation) {
                if (safeTarget === "dropoff") {
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
        setIsMapPickerActive(false);
    }

    function handleSetDropoff(place) {
        setDropoff(normalizePlace(place));
        setIsMapPickerActive(false);
    }

    function handleSetStops(updater) {
        setStops((current) => {
            const nextStops =
                typeof updater === "function" ? updater(current) : updater;

            return nextStops;
        });
    }

    function handlePreviewRouteAndFare() {
        if (!hasValidCoordinates(pickup) || !hasValidCoordinates(dropoff)) {
            toast.error("Select pickup and dropoff first");
            return;
        }

        navigate("/rider/ride/confirm", {
            state: {
                pickup,
                dropoff,
                stops,
                riderNote,
                rideType,
            },
        });
    }

    const isInitialLoading =
        meQuery.isLoading ||
        riderQuery.isLoading ||
        savedPlacesQuery.isLoading;

    const hasInitialError =
        meQuery.isError ||
        riderQuery.isError ||
        savedPlacesQuery.isError;

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
                <div
                    ref={mapAreaRef}
                    className="relative h-[60vh] min-h-[470px] max-h-[620px]"
                >
                    <MapboxMap
                        pickup={pickup}
                        dropoff={dropoff}
                        nearbyDrivers={nearbyDrivers}
                        surgeZones={surgeZones}
                        mapConfig={mapConfigQuery.data}
                        route={null}
                        locationSelectionTarget={mapSelectionTarget || "pickup"}
                        isMapPickerActive={isMapPickerActive}
                        onPickupChange={handlePickupPinChange}
                        onLocationChange={handleMapLocationChange}
                    />

                    <header className="absolute left-0 top-0 z-40 px-5 pt-6">
                        <HomeSidebar
                            role="rider"
                            profile={{
                                name: user?.name || "Rider",
                                email: user?.email,
                                phone: user?.phone,
                                initials: user?.name
                                    ?.split(" ")
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) => part[0]?.toUpperCase())
                                    .join(""),
                                profile_photo_url:
                                    user?.profile_photo_url || null,
                                rating: rider?.average_rating || "5.0",
                            }}
                        />
                    </header>

                    {isMapPickerActive ? (
                        <div className="pointer-events-none absolute left-5 right-5 top-[92px] z-40">
                            <div className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2 text-sm font-semibold text-[#101820] shadow-soft backdrop-blur">
                                <MapPin className="h-4 w-4 text-[#008C78]" />
                                Tap map to set{" "}
                                {mapSelectionTarget === "dropoff"
                                    ? "dropoff"
                                    : "pickup"}
                            </div>
                        </div>
                    ) : null}
                </div>

                {isInitialLoading ? (
                    <div className="-mt-10 relative z-50 rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-6 pt-6 shadow-sheet">
                        <Skeleton className="h-7 w-40 rounded-full" />
                        <Skeleton className="mt-4 h-14 rounded-[16px]" />
                        <Skeleton className="mt-4 h-14 rounded-[16px]" />
                        <Skeleton className="mt-4 h-14 rounded-[16px]" />
                    </div>
                ) : (
                    <div className="-mt-10 relative z-50">
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
                            setRideType={setRideType}
                            activeMapSelectionTarget={mapSelectionTarget}
                            isMapPickerActive={isMapPickerActive}
                            onPickLocationFromMap={handlePickLocationFromMap}
                            savedPlaces={savedPlaces}
                            currentLocation={pickup || LAHORE_DEFAULT_LOCATION}
                            estimate={null}
                            routePreview={null}
                            isEstimating={false}
                            isCreating={false}
                            onEstimate={handlePreviewRouteAndFare}
                            onCreateRide={() => {}}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}