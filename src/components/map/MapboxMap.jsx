import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Car, LocateFixed, MapPin, Navigation } from "lucide-react";
import { PlatformGeolocation } from "@/utils/geolocation";
import { toast } from "sonner";
import {
    getRouteCoordinates,
    isRealMapboxToken,
    makeDriverMarkerElement,
} from "@/components/map/mapboxUtils";

const DEFAULT_CENTER = [74.3587, 31.5204];

function hideMapClutter(map) {
    if (!map?.getStyle) return;

    const style = map.getStyle();
    const layers = style?.layers || [];

    layers.forEach((layer) => {
        const id = layer.id?.toLowerCase?.() || "";
        const sourceLayer = layer["source-layer"]?.toLowerCase?.() || "";

        const shouldHide =
            id.includes("poi") ||
            id.includes("school") ||
            id.includes("college") ||
            id.includes("university") ||
            sourceLayer.includes("poi") ||
            sourceLayer.includes("education");

        if (shouldHide && map.getLayer(layer.id)) {
            map.setLayoutProperty(layer.id, "visibility", "none");
        }
    });
}

function MockMapFallback({
    pickup,
    dropoff,
    nearbyDrivers = [],
    surgeZones = [],
    route,
    locationSelectionTarget = "pickup",
    isMapPickerActive = false,
    onPickupChange,
    onLocationChange,
    className = "",
}) {
    const [isLocating, setIsLocating] = useState(false);

    async function handleLocate() {
        setIsLocating(true);
        try {
            const permissionStatus = await PlatformGeolocation.checkPermissions();
            if (permissionStatus.location !== "granted") {
                const requestStatus = await PlatformGeolocation.requestPermissions();
                if (requestStatus.location !== "granted") {
                    toast.error("Location permission denied");
                    return;
                }
            }

            const position = await PlatformGeolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
            });

            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            if (onLocationChange) {
                onLocationChange(locationSelectionTarget || "pickup", coords);
            } else if (onPickupChange) {
                onPickupChange(coords);
            }

            toast.success("Location fetched successfully");
        } catch (error) {
            console.error("Mock map locate error:", error);
            toast.error("Could not fetch current location");
        } finally {
            setIsLocating(false);
        }
    }

    function selectLocation(location) {
        if (onLocationChange) {
            onLocationChange(locationSelectionTarget, location);
            return;
        }

        onPickupChange?.(location);
    }

    function handleMapClick(event) {
        if (!isMapPickerActive) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const xRatio = (event.clientX - rect.left) / rect.width;
        const yRatio = (event.clientY - rect.top) / rect.height;

        selectLocation({
            latitude: 31.56 - yRatio * 0.13,
            longitude: 74.25 + xRatio * 0.2,
        });
    }

    return (
        <div
            className={
                className || (isMapPickerActive
                    ? "relative h-full min-h-[470px] cursor-crosshair overflow-hidden rounded-b-[32px] bg-[#EAF2F0] ring-4 ring-[#008C78]/10"
                    : "relative h-full min-h-[470px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]")
            }
            onClick={handleMapClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" && isMapPickerActive) {
                    selectLocation({
                        latitude: 31.5204,
                        longitude: 74.3587,
                    });
                }
            }}
        >
            <div className="absolute inset-0 opacity-60">
                <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
                <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
                <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
            </div>

            {route ? (
                <div className="absolute left-[30%] top-[35%] h-28 w-[34%] rotate-[28deg] rounded-full border-[5px] border-[#008C78]" />
            ) : null}

            {surgeZones?.slice(0, 2).map((zone, index) => (
                <div
                    key={zone.id || index}
                    className="pointer-events-none absolute rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10"
                    style={{
                        width: 130 + index * 34,
                        height: 130 + index * 34,
                        left: `${18 + index * 28}%`,
                        top: `${18 + index * 22}%`,
                    }}
                />
            ))}

            {nearbyDrivers?.slice(0, 5).map((driver, index) => (
                <div
                    key={driver.driver_id || index}
                    className="absolute z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
                    style={{
                        left: `${18 + index * 13}%`,
                        top: `${36 + (index % 2) * 18}%`,
                    }}
                >
                    <Car className="h-5 w-5 text-[#008C78]" />
                </div>
            ))}

            {pickup ? (
                <div className="absolute left-[46%] top-[45%] z-30 -translate-x-1/2 -translate-y-full">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#008C78]" />
                </div>
            ) : null}

            {dropoff ? (
                <div className="absolute left-[64%] top-[28%] z-30 -translate-x-1/2 -translate-y-full">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101820] text-white shadow-card">
                        <Navigation className="h-5 w-5" />
                    </div>
                    <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#101820]" />
                </div>
            ) : null}

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleLocate();
                }}
                className="absolute bottom-16 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-card text-[#008C78] hover:bg-white active:scale-95 transition-all duration-200 border border-slate-200/50"
                disabled={isLocating}
                aria-label="Locate me"
            >
                {isLocating ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#008C78] border-t-transparent" />
                ) : (
                    <LocateFixed className="h-5 w-5" />
                )}
            </button>
        </div>
    );
}

export function MapboxMap({
    pickup,
    dropoff,
    nearbyDrivers = [],
    surgeZones = [],
    mapConfig,
    route,
    locationSelectionTarget = "pickup",
    isMapPickerActive = false,
    onPickupChange,
    onLocationChange,
    className = "",
}) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const pickupMarkerRef = useRef(null);
    const dropoffMarkerRef = useRef(null);
    const driverMarkersRef = useRef([]);
    const locationSelectionTargetRef = useRef(locationSelectionTarget);
    const isMapPickerActiveRef = useRef(isMapPickerActive);
    const onLocationChangeRef = useRef(onLocationChange);
    const onPickupChangeRef = useRef(onPickupChange);

    const [mapError, setMapError] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    async function handleLocateUser() {
        setIsLocating(true);
        try {
            const permissionStatus = await PlatformGeolocation.checkPermissions();
            if (permissionStatus.location !== "granted") {
                const requestStatus = await PlatformGeolocation.requestPermissions();
                if (requestStatus.location !== "granted") {
                    toast.error("Location permission denied");
                    return;
                }
            }

            const position = await PlatformGeolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
            });

            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            if (mapRef.current) {
                mapRef.current.flyTo({
                    center: [coords.longitude, coords.latitude],
                    zoom: 15,
                    essential: true,
                    duration: 800,
                });
            }

            if (onLocationChangeRef.current) {
                onLocationChangeRef.current(
                    locationSelectionTargetRef.current || "pickup",
                    coords
                );
            } else if (onPickupChangeRef.current) {
                onPickupChangeRef.current?.(coords);
            }

            toast.success("Location fetched successfully");
        } catch (error) {
            console.error("Map locate error:", error);
            toast.error("Could not fetch current location");
        } finally {
            setIsLocating(false);
        }
    }

    const token =
        mapConfig?.mapbox_public_token ||
        mapConfig?.public_token ||
        import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN ||
        import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    const hasRealToken = isRealMapboxToken(token);

    const center = useMemo(() => {
        if (pickup?.longitude && pickup?.latitude) {
            return [Number(pickup.longitude), Number(pickup.latitude)];
        }

        return DEFAULT_CENTER;
    }, [pickup]);

    useEffect(() => {
        locationSelectionTargetRef.current = locationSelectionTarget;
        isMapPickerActiveRef.current = isMapPickerActive;
        onLocationChangeRef.current = onLocationChange;
        onPickupChangeRef.current = onPickupChange;
    }, [
        locationSelectionTarget,
        isMapPickerActive,
        onLocationChange,
        onPickupChange,
    ]);

    useEffect(() => {
        setMapError(null);

        if (!hasRealToken || !mapContainerRef.current || mapRef.current) return;

        mapboxgl.accessToken = token;

        try {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style:
                    mapConfig?.style_url ||
                    "mapbox://styles/mapbox/streets-v12",
                center,
                zoom: mapConfig?.default_zoom || 13,
                attributionControl: false,
                performanceMetricsCollection: false,
            });
        } catch (error) {
            setMapError(error);
            return;
        }

        mapRef.current.addControl(
            new mapboxgl.AttributionControl({
                compact: true,
            }),
        );

        mapRef.current.on("click", (event) => {
            if (!isMapPickerActiveRef.current) return;

            const location = {
                latitude: event.lngLat.lat,
                longitude: event.lngLat.lng,
            };

            if (onLocationChangeRef.current) {
                onLocationChangeRef.current(
                    locationSelectionTargetRef.current,
                    location,
                );
            } else {
                onPickupChangeRef.current?.(location);
            }
        });

        mapRef.current.on("error", (event) => {
            const message = String(
                event?.error?.message ||
                    event?.error?.url ||
                    event?.error ||
                    "",
            );

            if (
                message.includes("events.mapbox.com") ||
                message.includes("events/v2")
            ) {
                return;
            }

            setMapError(event?.error || new Error("Mapbox failed to load"));
        });

        mapRef.current.once("load", () => {
            hideMapClutter(mapRef.current);

            mapRef.current?.resize();

            requestAnimationFrame(() => {
                hideMapClutter(mapRef.current);
                mapRef.current?.resize();
            });
        });

        mapRef.current.on("styledata", () => {
            hideMapClutter(mapRef.current);
        });

        return () => {
            pickupMarkerRef.current = null;
            dropoffMarkerRef.current = null;
            driverMarkersRef.current.forEach((marker) => marker.remove());
            driverMarkersRef.current = [];
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, [hasRealToken, token, mapConfig?.style_url]);

    useEffect(() => {
        if (!mapContainerRef.current || !mapRef.current) return;

        const observer = new ResizeObserver(() => {
            mapRef.current?.resize();
        });

        observer.observe(mapContainerRef.current);

        return () => observer.disconnect();
    }, [hasRealToken]);

    useEffect(() => {
        if (!mapRef.current || !isMapPickerActive) return;

        const targetLocation =
            locationSelectionTarget === "dropoff"
                ? dropoff || pickup
                : pickup || dropoff;

        if (!targetLocation?.longitude || !targetLocation?.latitude) return;

        mapRef.current.flyTo({
            center: [
                Number(targetLocation.longitude),
                Number(targetLocation.latitude),
            ],
            zoom: 15,
            essential: true,
            duration: 550,
        });
    }, [isMapPickerActive, locationSelectionTarget, pickup, dropoff]);

    useEffect(() => {
        if (!mapRef.current || !pickup) return;

        const lng = Number(pickup.longitude);
        const lat = Number(pickup.latitude);
        if (isNaN(lng) || isNaN(lat)) return;
        const lngLat = [lng, lat];

        if (!pickupMarkerRef.current) {
            pickupMarkerRef.current = new mapboxgl.Marker({
                color: "#008C78",
                draggable: true,
            })
                .setLngLat(lngLat)
                .addTo(mapRef.current);

            pickupMarkerRef.current.on("dragend", () => {
                const markerLngLat = pickupMarkerRef.current.getLngLat();

                if (onLocationChangeRef.current) {
                    onLocationChangeRef.current("pickup", {
                        latitude: markerLngLat.lat,
                        longitude: markerLngLat.lng,
                    });
                    return;
                }

                onPickupChangeRef.current?.({
                    latitude: markerLngLat.lat,
                    longitude: markerLngLat.lng,
                });
            });
        } else {
            pickupMarkerRef.current.setLngLat(lngLat);
        }
    }, [pickup]);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!dropoff) {
            dropoffMarkerRef.current?.remove();
            dropoffMarkerRef.current = null;
            return;
        }

        const lng = Number(dropoff.longitude);
        const lat = Number(dropoff.latitude);
        if (isNaN(lng) || isNaN(lat)) return;
        const lngLat = [lng, lat];

        if (!dropoffMarkerRef.current) {
            dropoffMarkerRef.current = new mapboxgl.Marker({
                color: "#101820",
                draggable: true,
            })
                .setLngLat(lngLat)
                .addTo(mapRef.current);

            dropoffMarkerRef.current.on("dragend", () => {
                const markerLngLat = dropoffMarkerRef.current.getLngLat();

                if (onLocationChangeRef.current) {
                    onLocationChangeRef.current("dropoff", {
                        latitude: markerLngLat.lat,
                        longitude: markerLngLat.lng,
                    });
                }
            });
        } else {
            dropoffMarkerRef.current.setLngLat(lngLat);
        }
    }, [dropoff]);

    useEffect(() => {
        if (!mapRef.current) return;

        driverMarkersRef.current.forEach((marker) => marker.remove());
        driverMarkersRef.current = [];

        nearbyDrivers.forEach((driver) => {
            const dLng = Number(driver.longitude);
            const dLat = Number(driver.latitude);
            if (!dLng || !dLat || isNaN(dLng) || isNaN(dLat)) return;

            const marker = new mapboxgl.Marker({
                element: makeDriverMarkerElement(),
            })
                .setLngLat([dLng, dLat])
                .addTo(mapRef.current);

            driverMarkersRef.current.push(marker);
        });
    }, [nearbyDrivers]);

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        function syncSurgeLayer() {
            const sourceId = "surge-zones";
            const layerId = "surge-zone-circles";

            const features = surgeZones
                .filter((zone) => zone.center?.longitude && zone.center?.latitude)
                .map((zone) => ({
                    type: "Feature",
                    properties: {
                        id: zone.id,
                        area_name: zone.area_name,
                        surge_multiplier: Number(zone.surge_multiplier || 1),
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [
                            Number(zone.center.longitude),
                            Number(zone.center.latitude),
                        ],
                    },
                }));

            const data = {
                type: "FeatureCollection",
                features,
            };

            if (map.getSource(sourceId)) {
                map.getSource(sourceId).setData(data);
                return;
            }

            map.addSource(sourceId, {
                type: "geojson",
                data,
            });

            map.addLayer({
                id: layerId,
                type: "circle",
                source: sourceId,
                paint: {
                    "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["get", "surge_multiplier"],
                        1,
                        40,
                        2,
                        90,
                    ],
                    "circle-color": "#F59E0B",
                    "circle-opacity": 0.14,
                    "circle-stroke-color": "#F59E0B",
                    "circle-stroke-opacity": 0.25,
                    "circle-stroke-width": 1,
                },
            });
        }

        if (map.isStyleLoaded()) {
            syncSurgeLayer();
        } else {
            map.once("load", syncSurgeLayer);
        }
    }, [surgeZones]);

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        function syncRouteLayer() {
            const sourceId = "route-preview";
            const layerId = "route-preview-line";
            const coordinates = getRouteCoordinates(route);

            const data = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates,
                },
            };

            if (!coordinates.length) {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
                return;
            }

            if (map.getSource(sourceId)) {
                map.getSource(sourceId).setData(data);
            } else {
                map.addSource(sourceId, {
                    type: "geojson",
                    data,
                });

                map.addLayer({
                    id: layerId,
                    type: "line",
                    source: sourceId,
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                    },
                    paint: {
                        "line-color": "#008C78",
                        "line-width": 5,
                        "line-opacity": 0.9,
                    },
                });
            }

            const bounds = new mapboxgl.LngLatBounds();

            coordinates.forEach((coordinate) => bounds.extend(coordinate));

            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, {
                    padding: {
                        top: 110,
                        bottom: 180,
                        left: 60,
                        right: 60,
                    },
                    maxZoom: 14,
                    duration: 700,
                });
            }
        }

        if (map.isStyleLoaded()) {
            syncRouteLayer();
        } else {
            map.once("load", syncRouteLayer);
        }
    }, [route]);

    useEffect(() => {
        if (!mapRef.current || route || isMapPickerActive) return;

        if (
            pickup?.longitude &&
            pickup?.latitude &&
            dropoff?.longitude &&
            dropoff?.latitude
        ) {
            const bounds = new mapboxgl.LngLatBounds();

            bounds.extend([Number(pickup.longitude), Number(pickup.latitude)]);
            bounds.extend([Number(dropoff.longitude), Number(dropoff.latitude)]);

            mapRef.current.fitBounds(bounds, {
                padding: {
                    top: 110,
                    bottom: 180,
                    left: 60,
                    right: 60,
                },
                maxZoom: 14,
                duration: 700,
            });

            return;
        }

        if (pickup?.longitude && pickup?.latitude) {
            mapRef.current.flyTo({
                center: [Number(pickup.longitude), Number(pickup.latitude)],
                zoom: 13,
                essential: true,
            });
        }
    }, [pickup, dropoff, route, isMapPickerActive]);

    if (!hasRealToken || mapError) {
        return (
            <MockMapFallback
                pickup={pickup}
                dropoff={dropoff}
                nearbyDrivers={nearbyDrivers}
                surgeZones={surgeZones}
                route={route}
                locationSelectionTarget={locationSelectionTarget}
                isMapPickerActive={isMapPickerActive}
                onPickupChange={onPickupChange}
                onLocationChange={onLocationChange}
                className={className}
            />
        );
    }

    return (
        <div
            className={
                className || (isMapPickerActive
                    ? "relative h-full min-h-[470px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0] ring-4 ring-[#008C78]/10"
                    : "relative h-full min-h-[470px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]")
            }
        >
            <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

            <button
                type="button"
                onClick={handleLocateUser}
                className="absolute bottom-16 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-card text-[#008C78] hover:bg-white active:scale-95 transition-all duration-200 border border-slate-200/50"
                disabled={isLocating}
                aria-label="Locate me"
            >
                {isLocating ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#008C78] border-t-transparent" />
                ) : (
                    <LocateFixed className="h-5 w-5" />
                )}
            </button>
        </div>
    );
}