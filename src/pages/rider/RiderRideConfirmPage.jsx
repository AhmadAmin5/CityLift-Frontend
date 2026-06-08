import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Bike,
    Car,
    CheckCircle2,
    Clock,
    CreditCard,
    MapPin,
    Navigation,
    Route,
    ShieldCheck,
    Sparkles,
    TrafficCone,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapboxMap } from "@/components/map/MapboxMap";

import { useMapConfig } from "@/hooks/maps/useMapConfig";
import { useRoutePreview } from "@/hooks/maps/useRoutePreview";
import { useCreateRide } from "@/hooks/rides/useCreateRide";
import { estimateRide } from "@/api/rides.api";
import { getApiErrorMessage } from "@/api/client";
import { hasValidCoordinates } from "@/utils/locationUtils";

const VEHICLE_OPTIONS = [
    {
        id: "bike",
        label: "Motorbike",
        api_vehicle_type: "bike",
        seats: 1,
        eta_min: 3,
        description: "Fast pickup, lower fares",
        icon: Bike,
    },
    {
        id: "rickshaw",
        label: "Rickshaw",
        api_vehicle_type: "rickshaw",
        seats: 3,
        eta_min: 3,
        description: "Local ride, lower fares",
        icon: Car,
    },
    {
        id: "car",
        label: "Car",
        api_vehicle_type: "car",
        seats: 4,
        eta_min: 3,
        description: "Comfortable standard rides",
        icon: Car,
    },
];

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
        stops: (stops || []).filter(hasValidCoordinates).map((stop) => ({
            latitude: stop.latitude,
            longitude: stop.longitude,
        })),
        vehicle_type: "car",
    };
}

function buildEstimatePayload({
    pickup,
    dropoff,
    stops,
    rideType,
    vehicleType,
}) {
    return {
        ride_type: rideType || "standard",
        scheduled_pickup_at: getScheduledPickupAt(rideType || "standard"),
        recurrence_rule: getRecurrenceRule(rideType || "standard"),
        vehicle_type: vehicleType || "car",
        pickup,
        dropoff,
        stops: (stops || []).filter(hasValidCoordinates).map((stop, index) => ({
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
    vehicleType,
}) {
    const validStops = (stops || []).filter(hasValidCoordinates);

    return {
        ride_type: rideType || "standard",
        scheduled_pickup_at: getScheduledPickupAt(rideType || "standard"),
        recurrence_rule: getRecurrenceRule(rideType || "standard"),
        rider_note_to_driver: riderNote || null,
        vehicle_type: vehicleType || "car",
        pickup: {
            latitude: pickup.latitude,
            longitude: pickup.longitude,
            address: pickup.address,
            provider: pickup.provider || "mapbox",
            provider_place_id: pickup.provider_place_id || null,
        },
        dropoff: {
            latitude: dropoff.latitude,
            longitude: dropoff.longitude,
            address: dropoff.address,
            provider: dropoff.provider || "mapbox",
            provider_place_id: dropoff.provider_place_id || null,
        },
        stops: validStops.map((stop, index) => ({
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

function getFareEstimate(payload) {
    return payload?.fare_estimate || payload?.fare || payload;
}

function getRoute(payload) {
    return payload?.route || payload;
}

function formatFare(payload) {
    const fare = getFareEstimate(payload);

    if (!fare) return "Loading";

    const currency = fare.currency || "PKR";
    const min = fare.estimated_min_fare;
    const max = fare.estimated_max_fare;

    if (min && max) {
        return `${currency}${Math.round(Number(min))}`;
    }

    if (fare.pre_ride_formula_fare) {
        return `${currency}${Math.round(Number(fare.pre_ride_formula_fare))}`;
    }

    return `${currency}--`;
}

function getFareRange(payload) {
    const fare = getFareEstimate(payload);

    if (!fare) return "Estimating fare";

    const currency = fare.currency || "PKR";
    const min = fare.estimated_min_fare;
    const max = fare.estimated_max_fare;

    if (min && max) {
        return `${currency} ${Math.round(Number(min))} - ${Math.round(
            Number(max),
        )}`;
    }

    if (fare.pre_ride_formula_fare) {
        return `${currency} ${Math.round(Number(fare.pre_ride_formula_fare))}`;
    }

    return "Fare unavailable";
}

function getCompactLocationName(location) {
    const raw =
        location?.label ||
        location?.name ||
        location?.address ||
        "Selected location";

    return String(raw).split(",")[0]?.trim() || "Selected location";
}

function CompactRouteBanner({ pickup, dropoff, route }) {
    const duration =
        route?.traffic_duration_min || route?.normal_duration_min || null;

    return (
        <div className="min-w-0 flex-1 rounded-[20px] border border-white/75 bg-white/95 px-3 py-2.5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F7F4]">
                            <MapPin className="h-3.5 w-3.5 text-[#008C78]" />
                        </div>

                        <p className="min-w-0 truncate text-[13px] font-semibold leading-5 text-[#101820]">
                            {getCompactLocationName(pickup)}
                        </p>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#101820]">
                            <Navigation className="h-3.5 w-3.5 text-white" />
                        </div>

                        <p className="min-w-0 truncate text-[13px] font-semibold leading-5 text-[#101820]">
                            {getCompactLocationName(dropoff)}
                        </p>
                    </div>
                </div>

                {duration ? (
                    <div className="shrink-0 rounded-full bg-[#F1FBF9] px-2.5 py-1 text-xs font-bold text-[#008C78]">
                        {duration}m
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function VehicleOptionCard({ option, estimate, selected, loading, onSelect }) {
    const Icon = option.icon;
    const fare = getFareEstimate(estimate);

    return (
        <button
            type="button"
            onClick={onSelect}
            className={
                selected
                    ? "w-full rounded-[24px] border border-[#008C78] bg-[#F1FBF9] p-4 text-left shadow-sm ring-4 ring-[#008C78]/10"
                    : "w-full rounded-[24px] border border-[#E1E5EA] bg-white p-4 text-left shadow-sm"
            }
        >
            <div className="flex items-center gap-4">
                <div
                    className={
                        selected
                            ? "flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[#E8F7F4]"
                            : "flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[#F7F8FA]"
                    }
                >
                    <Icon className="h-8 w-8 text-[#008C78]" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-lg font-bold tracking-[-0.02em] text-[#101820]">
                            {option.label}
                        </h3>

                        {selected ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#008C78]" />
                        ) : null}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-[#4B5563]">
                        <span>{option.seats}</span>
                        <span>•</span>
                        <span>{option.eta_min} min</span>
                    </div>

                    <p className="mt-1 text-sm text-[#8A9099]">
                        {option.description}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-lg font-bold tracking-[-0.03em] text-[#101820]">
                        {loading ? "..." : `~${formatFare(estimate)}`}
                    </p>

                    {Number(fare?.surge_multiplier || 1) > 1 ? (
                        <p className="mt-1 text-xs font-semibold text-[#C2410C]">
                            {fare.surge_multiplier}x surge
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-[#8A9099]">Estimate</p>
                    )}
                </div>
            </div>
        </button>
    );
}

function RouteStats({ route, estimate }) {
    const fare = getFareEstimate(estimate);

    return (
        <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
                <Route className="h-4 w-4 text-[#008C78]" />
                <p className="mt-2 text-sm font-bold text-[#101820]">
                    {fare?.estimated_distance_km || route?.distance_km || "--"}{" "}
                    km
                </p>
                <p className="text-xs text-[#8A9099]">Distance</p>
            </Card>

            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
                <Clock className="h-4 w-4 text-[#008C78]" />
                <p className="mt-2 text-sm font-bold text-[#101820]">
                    {fare?.estimated_duration_min ||
                        route?.traffic_duration_min ||
                        route?.normal_duration_min ||
                        "--"}
                    m
                </p>
                <p className="text-xs text-[#8A9099]">ETA</p>
            </Card>

            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
                <TrafficCone className="h-4 w-4 text-[#F59E0B]" />
                <p className="mt-2 text-sm font-bold text-[#101820]">
                    {fare?.estimated_traffic_delay_min ||
                        route?.traffic_delay_min ||
                        0}
                    m
                </p>
                <p className="text-xs text-[#8A9099]">Traffic</p>
            </Card>
        </div>
    );
}

export default function RiderRideConfirmPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const mapConfigQuery = useMapConfig();
    const routePreviewMutation = useRoutePreview();
    const createRideMutation = useCreateRide();

    const state = location.state || {};
    const pickup = state.pickup;
    const dropoff = state.dropoff;
    const stops = state.stops || [];
    const riderNote = state.riderNote || "Call me when arrived";
    const rideType = state.rideType || "standard";

    const [selectedOptionId, setSelectedOptionId] = useState("car");
    const [optionEstimates, setOptionEstimates] = useState({});
    const [routePreview, setRoutePreview] = useState(null);
    const [isLoadingEstimates, setIsLoadingEstimates] = useState(false);
    const [estimateError, setEstimateError] = useState(null);

    const selectedOption = useMemo(() => {
        return (
            VEHICLE_OPTIONS.find((option) => option.id === selectedOptionId) ||
            VEHICLE_OPTIONS[2]
        );
    }, [selectedOptionId]);

    const selectedEstimate = optionEstimates[selectedOptionId];
    const selectedRoute = getRoute(routePreview);

    useEffect(() => {
        if (!hasValidCoordinates(pickup) || !hasValidCoordinates(dropoff))
            return;

        let isActive = true;

        async function loadConfirmData() {
            setIsLoadingEstimates(true);
            setEstimateError(null);

            try {
                const nextRoutePreview = await routePreviewMutation.mutateAsync(
                    buildRoutePayload({
                        pickup,
                        dropoff,
                        stops,
                    }),
                );

                const results = await Promise.all(
                    VEHICLE_OPTIONS.map(async (option) => {
                        const estimate = await estimateRide(
                            buildEstimatePayload({
                                pickup,
                                dropoff,
                                stops,
                                rideType,
                                vehicleType: option.api_vehicle_type,
                            }),
                        );

                        return [option.id, estimate];
                    }),
                );

                if (!isActive) return;

                setRoutePreview(nextRoutePreview);
                setOptionEstimates(Object.fromEntries(results));
            } catch (error) {
                if (!isActive) return;

                setEstimateError(error);
                toast.error(getApiErrorMessage(error));
            } finally {
                if (isActive) {
                    setIsLoadingEstimates(false);
                }
            }
        }

        loadConfirmData();

        return () => {
            isActive = false;
        };
    }, [pickup, dropoff, stops, rideType]);

    async function handleConfirmRide() {
        if (!hasValidCoordinates(pickup) || !hasValidCoordinates(dropoff)) {
            toast.error("Pickup or dropoff is missing");
            navigate("/rider/home");
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
                    vehicleType: selectedOption.api_vehicle_type,
                }),
            );

            const ride = data?.ride || data;
            const rideId = ride?.id || ride?.ride_id;

            if (!rideId) {
                toast.error("Ride created, but ride id was missing");
                return;
            }

            toast.success(`${selectedOption.label} requested`);
            navigate(`/rider/ride/${rideId}/searching`, { replace: true });
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    }

    if (!hasValidCoordinates(pickup) || !hasValidCoordinates(dropoff)) {
        return (
            <main className="min-h-screen bg-white">
                <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#F1FBF9]">
                        <MapPin className="h-8 w-8 text-[#008C78]" />
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-[#101820]">
                        Select route first
                    </h1>

                    <p className="mt-2 text-base leading-6 text-[#4B5563]">
                        Choose pickup and dropoff from Rider Home before
                        selecting a ride option.
                    </p>

                    <Button
                        type="button"
                        onClick={() =>
                            navigate("/rider/home", { replace: true })
                        }
                        className="mt-6 h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
                    >
                        Back to home
                    </Button>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
                <div className="relative h-[56vh] min-h-[480px] max-h-[660px]">
                    <MapboxMap
                        pickup={pickup}
                        dropoff={dropoff}
                        nearbyDrivers={[]}
                        surgeZones={[]}
                        mapConfig={mapConfigQuery.data}
                        route={selectedRoute}
                        locationSelectionTarget="dropoff"
                        isMapPickerActive={false}
                    />

                    <header className="absolute left-0 right-0 top-0 z-40 flex items-start gap-3 px-5 pt-6">
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => navigate("/rider/home")}
                            className="h-11 w-11 shrink-0 rounded-full border-white/70 bg-white/95 text-[#101820] shadow-soft"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <CompactRouteBanner
                            pickup={pickup}
                            dropoff={dropoff}
                            route={selectedRoute}
                        />
                    </header>
                </div>

                <div className="-mt-8 relative z-50 rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-6 pt-4 shadow-sheet">
                    <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-[28px] font-bold leading-8 tracking-[-0.04em] text-[#101820]">
                                Choose your ride
                            </h1>
                            <p className="mt-2 text-sm leading-5 text-[#4B5563]">
                                Select a vehicle type before finding nearby
                                drivers.
                            </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#F1FBF9]">
                            <Sparkles className="h-6 w-6 text-[#008C78]" />
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {VEHICLE_OPTIONS.map((option) => (
                            <VehicleOptionCard
                                key={option.id}
                                option={option}
                                estimate={optionEstimates[option.id]}
                                selected={selectedOptionId === option.id}
                                loading={isLoadingEstimates}
                                onSelect={() => setSelectedOptionId(option.id)}
                            />
                        ))}
                    </div>

                    {estimateError ? (
                        <Card className="mt-4 rounded-[20px] border-red-100 bg-red-50 p-4 shadow-none">
                            <p className="text-sm font-semibold text-[#991B1B]">
                                Could not load route and fare estimates. Please
                                go back and try again.
                            </p>
                        </Card>
                    ) : null}

                    <div className="mt-4">
                        <RouteStats
                            route={selectedRoute}
                            estimate={selectedEstimate}
                        />
                    </div>

                    <Card className="mt-4 rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                                <CreditCard className="h-5 w-5 text-[#008C78]" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-[#101820]">
                                    Cash payment
                                </p>
                                <p className="mt-0.5 text-xs text-[#4B5563]">
                                    Estimated fare:{" "}
                                    {getFareRange(selectedEstimate)}
                                </p>
                            </div>

                            <ShieldCheck className="h-5 w-5 text-[#008C78]" />
                        </div>
                    </Card>

                    <Button
                        type="button"
                        disabled={
                            createRideMutation.isPending ||
                            isLoadingEstimates ||
                            !selectedEstimate
                        }
                        onClick={handleConfirmRide}
                        className="mt-5 h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        {createRideMutation.isPending
                            ? "Finding drivers..."
                            : `Find ${selectedOption.label}`}
                    </Button>
                </div>
            </section>
        </main>
    );
}
