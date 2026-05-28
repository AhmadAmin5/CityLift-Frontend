import { Loader2, MapPin, Navigation, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LocationSearchInput } from "@/components/ride/LocationSearchInput";
import { FareEstimateCard } from "@/components/ride/FareEstimateCard";

export function RideActionSheet({
  pickup,
  dropoff,
  stops,
  riderNote,
  rideType,
  setPickup,
  setDropoff,
  setStops,
  setRiderNote,
  setRideType,
  mapSelectionTarget,
  setMapSelectionTarget,
  savedPlaces,
  currentLocation,
  estimate,
  routePreview,
  isEstimating,
  isCreating,
  onEstimate,
  onCreateRide,
}) {
  const canEstimate = Boolean(pickup && dropoff);
  const canCreate = Boolean(estimate && pickup && dropoff);

  function addStop() {
    setStops((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        latitude: null,
        longitude: null,
        address: "",
        provider: "mapbox",
        provider_place_id: null,
      },
    ]);
  }

  function updateStop(stopId, place) {
    setStops((current) =>
      current.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              latitude: place.latitude,
              longitude: place.longitude,
              address: place.address,
              provider: place.provider || "mapbox",
              provider_place_id: place.provider_place_id || null,
            }
          : stop
      )
    );
  }

  function removeStop(stopId) {
    setStops((current) => current.filter((stop) => stop.id !== stopId));
  }

  return (
    <section className="rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-6 pt-4 shadow-sheet">
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

      <div>
        <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#101820]">
          Book a ride
        </h2>
        <p className="mt-1 text-sm text-[#4B5563]">
          Select locations, preview route, then confirm.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {["standard", "scheduled", "recurring"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setRideType(type)}
            className={
              rideType === type
                ? "h-11 rounded-[14px] bg-[#E8F7F4] text-sm font-semibold capitalize text-[#008C78]"
                : "h-11 rounded-[14px] border border-[#E1E5EA] bg-white text-sm font-semibold capitalize text-[#4B5563]"
            }
          >
            {type}
          </button>
        ))}
      </div>

      {rideType !== "standard" ? (
        <div className="mt-3 rounded-[16px] border border-[#F59E0B]/20 bg-[#FFF7ED] p-3">
          <p className="text-sm font-medium text-[#92400E]">
            {rideType === "scheduled"
              ? "Scheduled ride UI is selected. We will use a demo scheduled time for now."
              : "Recurring ride UI is selected. We will use a demo recurrence rule for now."}
          </p>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-[18px] bg-[#F7F8FA] p-2">
          <button
            type="button"
            onClick={() => setMapSelectionTarget?.("pickup")}
            className={
              mapSelectionTarget === "pickup"
                ? "h-11 rounded-[14px] bg-white text-sm font-semibold text-[#008C78] shadow-soft"
                : "h-11 rounded-[14px] text-sm font-semibold text-[#4B5563]"
            }
          >
            Map sets pickup
          </button>

          <button
            type="button"
            onClick={() => setMapSelectionTarget?.("dropoff")}
            className={
              mapSelectionTarget === "dropoff"
                ? "h-11 rounded-[14px] bg-white text-sm font-semibold text-[#008C78] shadow-soft"
                : "h-11 rounded-[14px] text-sm font-semibold text-[#4B5563]"
            }
          >
            Map sets dropoff
          </button>
        </div>

        <LocationSearchInput
          label="Pickup"
          value={pickup}
          onSelect={setPickup}
          savedPlaces={savedPlaces}
          currentLocation={currentLocation}
          placeholder="Pickup location"
        />

        <LocationSearchInput
          label="Dropoff"
          value={dropoff}
          onSelect={setDropoff}
          savedPlaces={savedPlaces}
          currentLocation={currentLocation}
          placeholder="Where to?"
        />

        {stops.map((stop, index) => (
          <div key={stop.id} className="rounded-[18px] border border-[#E1E5EA] p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#101820]">
                Stop {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeStop(stop.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F8FA] text-[#DC2626]"
                aria-label="Remove stop"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <LocationSearchInput
              label=""
              value={stop}
              onSelect={(place) => updateStop(stop.id, place)}
              savedPlaces={savedPlaces}
              currentLocation={currentLocation}
              placeholder="Add stop location"
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addStop}
          className="h-[48px] w-full rounded-[14px] border-dashed border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
        >
          <Plus className="mr-2 h-4 w-4 text-[#008C78]" />
          Add intermediate stop
        </Button>

        <div>
          <p className="mb-2 text-sm font-semibold text-[#101820]">
            Note to driver
          </p>
          <Textarea
            value={riderNote}
            onChange={(event) => setRiderNote(event.target.value)}
            placeholder="Call me when arrived"
            className="min-h-[86px] rounded-[16px] border-[#E1E5EA] text-base focus-visible:ring-[#008C78]/20"
          />
        </div>

        {pickup || dropoff ? (
          <div className="rounded-[20px] bg-[#F7F8FA] p-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F7F4]">
                  <MapPin className="h-4 w-4 text-[#008C78]" />
                </div>
                <div className="h-8 w-px bg-[#D7DCE2]" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101820]">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#101820]">
                  {pickup?.address || "Pickup not selected"}
                </p>
                <Separator className="my-3 bg-[#E1E5EA]" />
                <p className="truncate text-sm font-semibold text-[#101820]">
                  {dropoff?.address || "Dropoff not selected"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <FareEstimateCard estimate={estimate} routePreview={routePreview} />

        <Button
          type="button"
          disabled={!canEstimate || isEstimating}
          onClick={() => {
            if (!canEstimate) {
              toast.error("Select pickup and dropoff first");
              return;
            }

            onEstimate();
          }}
          variant={estimate ? "outline" : "default"}
          className={
            estimate
              ? "h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
              : "h-14 rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          }
        >
          {isEstimating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Estimating...
            </>
          ) : estimate ? (
            "Refresh route & fare"
          ) : (
            "Preview route & fare"
          )}
        </Button>

        {estimate ? (
          <Button
            type="button"
            disabled={!canCreate || isCreating}
            onClick={onCreateRide}
            className="h-14 rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Requesting ride...
              </>
            ) : (
              "Confirm ride"
            )}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
