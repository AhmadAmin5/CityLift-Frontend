import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, MapPin, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapboxMap } from "@/components/map/MapboxMap";
import { useMapConfig } from "@/hooks/maps/useMapConfig";
import { useUpsertSurgeZone } from "@/hooks/admin/useAdminPricing";
import { useSurgeZones } from "@/hooks/maps/useSurgeZones";
import { getApiErrorMessage } from "@/api/client";

export default function AdminSurgeZonesPage() {
  const navigate = useNavigate();

  // Form states
  const [zoneId, setZoneId] = useState("lahore_gulberg");
  const [city, setCity] = useState("Lahore");

  const mapConfigQuery = useMapConfig();
  const upsertMutation = useUpsertSurgeZone();
  const { data: existingZones } = useSurgeZones(city);
  const [areaName, setAreaName] = useState("Gulberg");
  const [latitude, setLatitude] = useState(31.5204);
  const [longitude, setLongitude] = useState(74.3587);
  const [radiusKm, setRadiusKm] = useState("3");
  const [demandCount, setDemandCount] = useState("25");
  const [availableDrivers, setAvailableDrivers] = useState("8");
  const [surgeMultiplier, setSurgeMultiplier] = useState("1.5");

  function handleMapClick(coords) {
    if (coords?.latitude && coords?.longitude) {
      setLatitude(Number(coords.latitude.toFixed(6)));
      setLongitude(Number(coords.longitude.toFixed(6)));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      id: zoneId || `zone_${Date.now()}`,
      city,
      area_name: areaName,
      center: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      radius_km: Number(radiusKm),
      demand_count: Number(demandCount),
      available_drivers: Number(availableDrivers),
      surge_multiplier: Number(surgeMultiplier),
    };

    try {
      await upsertMutation.mutateAsync(payload);
      window.alert("Surge zone saved successfully! Socket.io updates broadcasted.");
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  const selectedLocation = {
    latitude,
    longitude,
    address: `${areaName}, ${city}`,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white pb-8 shadow-lg">
        <header className="flex items-center gap-3 px-6 pt-10">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] text-[#101820] hover:bg-slate-50"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-semibold text-[#008C78]">Admin Center</p>
            <h1 className="text-xl font-bold text-[#101820]">Surge Zones</h1>
          </div>
        </header>

        <div className="relative mt-6 h-[220px] overflow-hidden rounded-xl mx-6 border border-[#E1E5EA]">
          <MapboxMap
            pickup={selectedLocation}
            nearbyDrivers={[]}
            surgeZones={[
              ...(existingZones || []).filter((z) => z.id !== zoneId),
              {
                id: zoneId || "temp",
                city,
                area_name: areaName,
                center: { latitude, longitude },
                radius_km: Number(radiusKm) || 2,
                surge_multiplier: Number(surgeMultiplier) || 1.0,
              },
            ]}
            mapConfig={mapConfigQuery.data}
            onPickupChange={handleMapClick}
          />

          <div className="absolute bottom-3 left-3 z-30 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#101820] shadow-sm">
            Drag marker or tap map to set center
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-6">
          <Card className="rounded-[22px] border border-[#E1E5EA] bg-[#F7F8FA] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#008C78]">
              <MapPin className="h-4 w-4" />
              Zone Coordinates
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-[#8A9099]">Latitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#8A9099]">Longitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8A9099]">Zone ID</label>
              <Input
                placeholder="e.g. lahore_gulberg"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8A9099]">City</label>
              <Input
                placeholder="e.g. Lahore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8A9099]">Area Name</label>
              <Input
                placeholder="e.g. Gulberg"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8A9099]">Radius (KM)</label>
              <Input
                type="number"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8A9099]">Demand</label>
              <Input
                type="number"
                value={demandCount}
                onChange={(e) => setDemandCount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8A9099]">Drivers</label>
              <Input
                type="number"
                value={availableDrivers}
                onChange={(e) => setAvailableDrivers(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8A9099]">Surge</label>
              <Input
                type="number"
                step="0.1"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={upsertMutation.isPending}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <Save className="mr-2 h-5 w-5" />
            {upsertMutation.isPending ? "Saving Surge Zone..." : "Save Surge Zone"}
          </Button>
        </form>
      </section>
    </main>
  );
}
