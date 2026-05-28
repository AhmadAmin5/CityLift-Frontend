import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Car, MapPin, Navigation, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getRouteCoordinates,
  isRealMapboxToken,
  makeDriverMarkerElement,
} from "@/components/map/mapboxUtils";

const DEFAULT_CENTER = [74.3587, 31.5204];

function MockMapFallback({
  pickup,
  dropoff,
  nearbyDrivers = [],
  surgeZones = [],
  route,
  label = "Mock map",
}) {
  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
        <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
        <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
      </div>

      {route ? (
        <div className="absolute left-[30%] top-[35%] h-28 w-[34%] rotate-[28deg] rounded-full border-[5px] border-[#008C78]" />
      ) : null}

      <div className="absolute left-5 top-5 z-10">
        <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
          {label}
        </Badge>
      </div>

      {surgeZones?.slice(0, 2).map((zone, index) => (
        <div
          key={zone.id || index}
          className="absolute rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/15"
          style={{
            width: 130 + index * 34,
            height: 130 + index * 34,
            left: `${18 + index * 28}%`,
            top: `${18 + index * 22}%`,
          }}
        >
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#101820] shadow-soft">
            <RadioTower className="h-3 w-3 text-[#F59E0B]" />
            {zone.surge_multiplier || 1}x
          </div>
        </div>
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

      <div className="absolute bottom-8 left-6 right-6 z-20 rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur">
        <p className="text-sm font-semibold text-[#101820]">
          {pickup?.address || "Select pickup"}
        </p>
        <p className="mt-1 truncate text-xs text-[#4B5563]">
          {dropoff?.address || "Choose your destination to estimate fare"}
        </p>
      </div>
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
  onPickupChange,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const driverMarkersRef = useRef([]);
  const [mapError, setMapError] = useState(null);

  const token = mapConfig?.mapbox_public_token || mapConfig?.public_token;
  const hasRealToken = isRealMapboxToken(token);

  const center = useMemo(() => {
    if (pickup?.longitude && pickup?.latitude) {
      return [Number(pickup.longitude), Number(pickup.latitude)];
    }

    return DEFAULT_CENTER;
  }, [pickup]);

  useEffect(() => {
    setMapError(null);

    if (!hasRealToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapConfig?.style_url || "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: mapConfig?.default_zoom || 13,
        attributionControl: false,
      });
    } catch (error) {
      setMapError(error);
      return;
    }

    mapRef.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      }),
      "bottom-right"
    );

    mapRef.current.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
      })
    );

    mapRef.current.on("click", (event) => {
      onPickupChange?.({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    });

    mapRef.current.on("error", (event) => {
      setMapError(event?.error || new Error("Mapbox failed to load"));
    });

    mapRef.current.once("load", () => {
      mapRef.current?.resize();
      requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
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
    if (!mapRef.current || !pickup) return;

    const lngLat = [Number(pickup.longitude), Number(pickup.latitude)];

    if (!pickupMarkerRef.current) {
      pickupMarkerRef.current = new mapboxgl.Marker({
        color: "#008C78",
        draggable: true,
      })
        .setLngLat(lngLat)
        .addTo(mapRef.current);

      pickupMarkerRef.current.on("dragend", () => {
        const markerLngLat = pickupMarkerRef.current.getLngLat();

        onPickupChange?.({
          latitude: markerLngLat.lat,
          longitude: markerLngLat.lng,
        });
      });
    } else {
      pickupMarkerRef.current.setLngLat(lngLat);
    }
  }, [pickup, onPickupChange]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!dropoff) {
      dropoffMarkerRef.current?.remove();
      dropoffMarkerRef.current = null;
      return;
    }

    const lngLat = [Number(dropoff.longitude), Number(dropoff.latitude)];

    if (!dropoffMarkerRef.current) {
      dropoffMarkerRef.current = new mapboxgl.Marker({
        color: "#101820",
      })
        .setLngLat(lngLat)
        .addTo(mapRef.current);
    } else {
      dropoffMarkerRef.current.setLngLat(lngLat);
    }
  }, [dropoff]);

  useEffect(() => {
    if (!mapRef.current) return;

    driverMarkersRef.current.forEach((marker) => marker.remove());
    driverMarkersRef.current = [];

    nearbyDrivers.forEach((driver) => {
      if (!driver.longitude || !driver.latitude) return;

      const marker = new mapboxgl.Marker({
        element: makeDriverMarkerElement(),
      })
        .setLngLat([Number(driver.longitude), Number(driver.latitude)])
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
          "circle-opacity": 0.18,
          "circle-stroke-color": "#F59E0B",
          "circle-stroke-opacity": 0.35,
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
    if (!mapRef.current || route) return;

    if (pickup?.longitude && pickup?.latitude && dropoff?.longitude && dropoff?.latitude) {
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
  }, [pickup, dropoff, route]);

  if (!hasRealToken || mapError) {
    return (
      <MockMapFallback
        pickup={pickup}
        dropoff={dropoff}
        nearbyDrivers={nearbyDrivers}
        surgeZones={surgeZones}
        route={route}
        label={mapError ? "Map unavailable" : "Mock map"}
      />
    );
  }

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      <div className="absolute left-5 top-5 z-10">
        <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
          Mapbox live
        </Badge>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-6 right-6 z-20 rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur">
        <p className="truncate text-sm font-semibold text-[#101820]">
          {pickup?.address || "Select pickup"}
        </p>
        <p className="mt-1 truncate text-xs text-[#4B5563]">
          {dropoff?.address || "Choose your destination to estimate fare"}
        </p>
      </div>
    </div>
  );
}
