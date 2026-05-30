import { Loader2, MapPin, Navigation, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LocationSearchInput } from "@/components/ride/LocationSearchInput";
import { FareEstimateCard } from "@/components/ride/FareEstimateCard";
import { hasValidCoordinates } from "@/utils/locationUtils";

function MapPickButton({ type, isActive, onClick }) {
  const Icon = type === "dropoff" ? Navigation : MapPin;
  const label =
    type === "dropoff" ? "Pick dropoff from map" : "Pick pickup from map";

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isActive
          ? "flex h-10 w-10 items-center justify-center rounded-full bg-[#008C78] text-white"
          : "flex h-10 w-10 items-center justify-center rounded-full bg-[#F1FBF9] text-[#008C78]"
      }
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export function RideActionSheet({
  pickup,
  dropoff,
  stops,
  riderNote,
  setPickup,
  setDropoff,
  setStops,
  setRiderNote,

  /**
   * Backward-compatible props.
   */
  mapSelectionTarget,
  setMapSelectionTarget,

  /**
   * New pin-button map-pick props from RiderHomePage.
   */
  activeMapSelectionTarget,
  isMapPickerActive,
  onPickLocationFromMap,

  savedPlaces,
  currentLocation,
  estimate,
  routePreview,
  isEstimating,
  isCreating,
  onEstimate,
  onCreateRide,
}) {
  const effectiveMapTarget = activeMapSelectionTarget || mapSelectionTarget;

  const isPickupMapPicking =
    Boolean(isMapPickerActive) && effectiveMapTarget === "pickup";

  const isDropoffMapPicking =
    Boolean(isMapPickerActive) && effectiveMapTarget === "dropoff";

  const canEstimate =
    hasValidCoordinates(pickup) && hasValidCoordinates(dropoff);

  const canCreate = Boolean(estimate) && canEstimate;

  function handlePickFromMap(target) {
    if (onPickLocationFromMap) {
      onPickLocationFromMap(target);
      return;
    }

    setMapSelectionTarget?.(target);

    toast.message(
      target === "dropoff"
        ? "Tap the map to set dropoff"
        : "Tap the map to set pickup"
    );
  }

  function addStop() {
    setStops((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        latitude: null,
        longitude: null,
        address: "",
        provider: "google",
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
              ...(place || {
                latitude: null,
                longitude: null,
                address: "",
                provider: "google",
                provider_place_id: null,
              }),
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

      <div className="mt-5 space-y-4">
        <LocationSearchInput
          label="Pickup"
          value={pickup}
          onSelect={setPickup}
          savedPlaces={savedPlaces}
          currentLocation={currentLocation}
          placeholder="Pickup location"
          showSearchIcon={false}
          isHighlighted={isPickupMapPicking}
          labelEnd={
            isPickupMapPicking ? (
              <span className="rounded-full bg-[#E8F7F4] px-2.5 py-1 text-xs font-semibold text-[#008C78]">
                Selecting on map
              </span>
            ) : null
          }
          rightAction={
            <MapPickButton
              type="pickup"
              isActive={isPickupMapPicking}
              onClick={() => handlePickFromMap("pickup")}
            />
          }
        />

        <LocationSearchInput
          label="Dropoff"
          value={dropoff}
          onSelect={setDropoff}
          savedPlaces={savedPlaces}
          currentLocation={currentLocation}
          placeholder="Where to?"
          showSearchIcon={false}
          isHighlighted={isDropoffMapPicking}
          labelEnd={
            isDropoffMapPicking ? (
              <span className="rounded-full bg-[#E8F7F4] px-2.5 py-1 text-xs font-semibold text-[#008C78]">
                Selecting on map
              </span>
            ) : null
          }
          rightAction={
            <MapPickButton
              type="dropoff"
              isActive={isDropoffMapPicking}
              onClick={() => handlePickFromMap("dropoff")}
            />
          }
        />

        {stops.map((stop, index) => (
          <div
            key={stop.id}
            className="rounded-[18px] border border-[#E1E5EA] p-3"
          >
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
              toast.error("Select pickup and dropoff from the suggestions first");
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