import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Edit3,
  Heart,
  Home,
  Info,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { getApiErrorMessage } from "@/api/client";
import {
  useCreateSavedPlace,
  useDeleteSavedPlace,
  useSavedPlaces,
  useUpdateSavedPlace,
} from "@/hooks/rider/useSavedPlaces";
import {
  useAddressAutocomplete,
  usePlaceDetailsMutation,
} from "@/hooks/maps/useAddressAutocomplete";
import { useReverseGeocode } from "@/hooks/maps/useReverseGeocode";
import {
  createSessionToken,
  hasValidCoordinates,
  normalizeLocation,
} from "@/utils/locationUtils";
import { toast } from "sonner";

const emptyDraft = {
  id: null,
  label: "",
  place_type: "favorite",
  latitude: 31.5204,
  longitude: 74.3587,
  address: "",
  provider: "mapbox",
  provider_place_id: null,
  note: "",
  usage_count: 0,
  last_used_at: "Never",
  created_at: "Today",
};

function formatSavedPlaceDate(timestamp) {
  if (!timestamp) return "Today";

  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

function normalizeSavedPlaceForUi(place) {
  return {
    ...emptyDraft,
    ...place,
    label: place?.label || "Saved place",
    place_type: place?.place_type || "favorite",
    latitude: Number(place?.latitude || emptyDraft.latitude),
    longitude: Number(place?.longitude || emptyDraft.longitude),
    address: place?.address || "Saved location",
    provider: place?.provider || "mapbox",
    provider_place_id: place?.provider_place_id || null,
    note: place?.note || "",
    usage_count: Number(place?.usage_count || 0),
    last_used_at: place?.last_used_at || "Never",
    created_at: formatSavedPlaceDate(place?.created_at),
    updated_at: place?.updated_at,
  };
}

function buildSavedPlacePayload(draft) {
  return {
    label: draft.label.trim() || "Saved place",
    place_type: draft.place_type || "favorite",
    latitude: Number(draft.latitude || 31.5204),
    longitude: Number(draft.longitude || 74.3587),
    address: draft.address.trim() || "Selected location, Lahore",
    provider: draft.provider || "mapbox",
    provider_place_id: draft.provider_place_id || null,
  };
}

function getPlaceTypeConfig(placeType) {
  if (placeType === "home") {
    return {
      label: "Home",
      icon: Home,
      badgeClass: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
      panelClass: "bg-[#E8F7F4]",
      iconClass: "text-[#008C78]",
    };
  }

  if (placeType === "work") {
    return {
      label: "Work",
      icon: BriefcaseBusiness,
      badgeClass: "bg-[#EEF2FF] text-[#2563EB] hover:bg-[#EEF2FF]",
      panelClass: "bg-[#EEF2FF]",
      iconClass: "text-[#2563EB]",
    };
  }

  return {
    label: "Favorite",
    icon: Heart,
    badgeClass: "bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFF7ED]",
    panelClass: "bg-[#FFF7ED]",
    iconClass: "text-[#F59E0B]",
  };
}

function MiniMapPreview({ place, compact = false }) {
  return (
    <div
      className={
        compact
          ? "relative h-[150px] overflow-hidden rounded-[22px] bg-[#EAF2F0]"
          : "relative h-[210px] overflow-hidden rounded-[24px] bg-[#EAF2F0]"
      }
    >
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-22%] top-6 h-24 w-[145%] rotate-[-12deg] rounded-full border-[14px] border-white/80" />
        <div className="absolute left-[-12%] top-24 h-20 w-[125%] rotate-[18deg] rounded-full border-[12px] border-white/70" />
        <div className="absolute bottom-4 left-[-18%] h-20 w-[135%] rotate-[-4deg] rounded-full border-[10px] border-white/70" />
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <div className="absolute inset-0 h-14 w-14 animate-ping rounded-full bg-[#008C78]/15" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
          <MapPin className="h-7 w-7" />
        </div>
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#008C78]" />
      </div>

      <div className="absolute bottom-3 left-3 right-3 rounded-[18px] border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur">
        <p className="truncate text-sm font-bold text-[#101820]">
          {place?.address || "Select a location"}
        </p>
        {place?.latitude && place?.longitude ? (
          <p className="mt-0.5 text-xs text-[#4B5563]">
            {Number(place.latitude).toFixed(4)}, {Number(place.longitude).toFixed(4)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SavedPlacesHero({ places }) {
  const homeCount = places.filter((place) => place.place_type === "home").length;
  const workCount = places.filter((place) => place.place_type === "work").length;
  const favoriteCount = places.filter(
    (place) => place.place_type === "favorite"
  ).length;

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <Star className="mr-1.5 h-3.5 w-3.5" />
            Quick booking
          </Badge>

          <h1 className="mt-4 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
            Saved places
          </h1>

          <p className="mt-2 text-sm leading-5 text-[#4B5563]">
            Save your frequent pickups and destinations for faster ride booking.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-soft">
          <MapPin className="h-7 w-7 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <Home className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-lg font-bold text-[#101820]">{homeCount}</p>
          <p className="text-xs text-[#8A9099]">Home</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <BriefcaseBusiness className="h-4 w-4 text-[#2563EB]" />
          <p className="mt-2 text-lg font-bold text-[#101820]">{workCount}</p>
          <p className="text-xs text-[#8A9099]">Work</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <Heart className="h-4 w-4 text-[#F59E0B]" />
          <p className="mt-2 text-lg font-bold text-[#101820]">
            {favoriteCount}
          </p>
          <p className="text-xs text-[#8A9099]">Favorites</p>
        </div>
      </div>
    </Card>
  );
}

function SavedPlaceCard({ place, onUse, onDetails, onEdit, onDelete }) {
  const config = getPlaceTypeConfig(place.place_type);
  const TypeIcon = config.icon;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${config.panelClass}`}
        >
          <TypeIcon className={`h-6 w-6 ${config.iconClass}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-[-0.02em] text-[#101820]">
                {place.label}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4B5563]">
                {place.address}
              </p>
            </div>

            <Badge className={`shrink-0 rounded-full px-3 py-1.5 ${config.badgeClass}`}>
              {config.label}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[16px] bg-[#F7F8FA] p-3">
              <Clock className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 truncate text-sm font-bold text-[#101820]">
                {place.last_used_at}
              </p>
              <p className="text-xs text-[#8A9099]">Last used</p>
            </div>

            <div className="rounded-[16px] bg-[#F7F8FA] p-3">
              <Navigation className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 text-sm font-bold text-[#101820]">
                {place.usage_count}
              </p>
              <p className="text-xs text-[#8A9099]">Trips</p>
            </div>

            <div className="rounded-[16px] bg-[#F7F8FA] p-3">
              <LocateFixed className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 text-sm font-bold text-[#101820]">
                {Number(place.latitude).toFixed(2)}
              </p>
              <p className="text-xs text-[#8A9099]">Lat</p>
            </div>
          </div>

          {place.note ? (
            <div className="mt-4 rounded-[18px] bg-[#F7F8FA] p-3">
              <p className="text-xs font-medium text-[#8A9099]">Pickup note</p>
              <p className="mt-1 text-sm font-semibold text-[#101820]">
                {place.note}
              </p>
            </div>
          ) : null}

          <Separator className="my-4 bg-[#E1E5EA]" />

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => onUse(place)}
              className="h-[48px] rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Use place
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onDetails(place)}
              className="h-[48px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
            >
              <Info className="mr-2 h-4 w-4 text-[#008C78]" />
              Details
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(place)}
              className="h-[48px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
            >
              <Edit3 className="mr-2 h-4 w-4 text-[#008C78]" />
              Edit
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onDelete(place)}
              className="h-[48px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#DC2626]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptySavedPlaces({ onAdd }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E8F7F4]">
        <MapPin className="h-8 w-8 text-[#008C78]" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#101820]">
        No places found
      </h2>

      <p className="mt-2 text-sm leading-5 text-[#4B5563]">
        Add Home, Work, or favorite locations to reuse them while booking.
      </p>

      <Button
        type="button"
        onClick={onAdd}
        className="mt-5 h-12 rounded-[14px] bg-[#008C78] px-5 text-sm font-semibold text-white hover:bg-[#006F60]"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add place
      </Button>
    </Card>
  );
}

function PlaceDetailsSheet({ place, open, onOpenChange, onUse, onEdit }) {
  if (!place) return null;

  const config = getPlaceTypeConfig(place.place_type);
  const TypeIcon = config.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${config.panelClass}`}
            >
              <TypeIcon className={`h-6 w-6 ${config.iconClass}`} />
            </div>

            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
                {place.label}
              </SheetTitle>
              <SheetDescription className="mt-1 text-base leading-6 text-[#4B5563]">
                {place.address}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <MiniMapPreview place={place} />

          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
              <Navigation className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 text-lg font-bold text-[#101820]">
                {place.usage_count}
              </p>
              <p className="text-xs text-[#8A9099]">Trips used</p>
            </Card>

            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
              <Clock className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 text-lg font-bold text-[#101820]">
                {place.last_used_at}
              </p>
              <p className="text-xs text-[#8A9099]">Last used</p>
            </Card>
          </div>

          <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
            <h3 className="text-base font-bold text-[#101820]">
              Location details
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#4B5563]">Type</p>
                <Badge className={`rounded-full px-3 py-1.5 ${config.badgeClass}`}>
                  {config.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#4B5563]">Provider</p>
                <p className="text-sm font-bold capitalize text-[#101820]">
                  {place.provider}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#4B5563]">Latitude</p>
                <p className="text-sm font-bold text-[#101820]">
                  {Number(place.latitude).toFixed(5)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#4B5563]">Longitude</p>
                <p className="text-sm font-bold text-[#101820]">
                  {Number(place.longitude).toFixed(5)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#4B5563]">Added</p>
                <p className="text-sm font-bold text-[#101820]">
                  {place.created_at}
                </p>
              </div>
            </div>
          </Card>

          {place.note ? (
            <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
              <p className="text-sm font-bold text-[#101820]">Pickup note</p>
              <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                {place.note}
              </p>
            </Card>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(place)}
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              <Edit3 className="mr-2 h-5 w-5 text-[#008C78]" />
              Edit
            </Button>

            <Button
              type="button"
              onClick={() => onUse(place)}
              className="h-[52px] rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Use
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UsePlaceSheet({ place, open, onOpenChange, onStartBooking }) {
  const [mode, setMode] = useState("dropoff");

  if (!place) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
            Use {place.label}
          </SheetTitle>
          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            Choose how this saved place should be used in your next booking.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <MiniMapPreview place={place} compact />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("pickup")}
              className={
                mode === "pickup"
                  ? "rounded-[18px] border border-[#008C78] bg-[#E8F7F4] p-4 text-left"
                  : "rounded-[18px] border border-[#E1E5EA] bg-white p-4 text-left"
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <MapPin className="h-5 w-5 text-[#008C78]" />
              </div>
              <p className="mt-3 text-sm font-bold text-[#101820]">
                Set as pickup
              </p>
              <p className="mt-1 text-xs leading-4 text-[#4B5563]">
                Start from this place.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("dropoff")}
              className={
                mode === "dropoff"
                  ? "rounded-[18px] border border-[#008C78] bg-[#E8F7F4] p-4 text-left"
                  : "rounded-[18px] border border-[#E1E5EA] bg-white p-4 text-left"
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <Navigation className="h-5 w-5 text-[#008C78]" />
              </div>
              <p className="mt-3 text-sm font-bold text-[#101820]">
                Set as dropoff
              </p>
              <p className="mt-1 text-xs leading-4 text-[#4B5563]">
                Ride to this place.
              </p>
            </button>
          </div>

          <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                {mode === "pickup" ? (
                  <MapPin className="h-5 w-5 text-[#008C78]" />
                ) : (
                  <Navigation className="h-5 w-5 text-[#008C78]" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-[#101820]">
                  {mode === "pickup" ? "Pickup selected" : "Dropoff selected"}
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4B5563]">
                  {place.address}
                </p>
              </div>
            </div>
          </Card>

          <Button
            type="button"
            onClick={() => onStartBooking(place, mode)}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <Navigation className="mr-2 h-5 w-5" />
            Continue to booking
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PlaceEditorSheet({
  open,
  draft,
  existingPlaces,
  onOpenChange,
  onDraftChange,
  onSave,
  isSaving = false,
}) {
  const [addressQuery, setAddressQuery] = useState(draft.address || "");
  const [sessionToken, setSessionToken] = useState(null);
  const [resolvingPlaceId, setResolvingPlaceId] = useState(null);

  const isEditing = Boolean(draft.id);
  const autocompleteQuery = useAddressAutocomplete({
    q: addressQuery,
    latitude: draft.latitude,
    longitude: draft.longitude,
    sessionToken,
  });
  const placeDetailsMutation = usePlaceDetailsMutation();
  const reverseGeocodeMutation = useReverseGeocode();

  useEffect(() => {
    if (open) setAddressQuery(draft.address || "");
  }, [draft.address, draft.id, open]);

  const filteredSuggestions = useMemo(() => {
    if (addressQuery.trim().length < 2) return [];
    return autocompleteQuery.data || [];
  }, [addressQuery, autocompleteQuery.data]);

  const homeExists = existingPlaces.some(
    (place) => place.place_type === "home" && place.id !== draft.id
  );
  const workExists = existingPlaces.some(
    (place) => place.place_type === "work" && place.id !== draft.id
  );

  const isHomeDisabled = homeExists && draft.place_type !== "home";
  const isWorkDisabled = workExists && draft.place_type !== "work";

  function updateField(field, value) {
    onDraftChange({
      ...draft,
      [field]: value,
    });
  }

  function ensureSessionToken() {
    if (!sessionToken) {
      const nextToken = createSessionToken();
      setSessionToken(nextToken);
      return nextToken;
    }

    return sessionToken;
  }

  async function selectSuggestion(suggestion) {
    const placeId = suggestion.place_id || suggestion.provider_place_id;
    const token = ensureSessionToken();

    if (!placeId) return;

    setResolvingPlaceId(placeId);

    try {
      const details = await placeDetailsMutation.mutateAsync({
        placeId,
        sessionToken: token,
      });
      const selectedPlace = normalizeLocation(details, draft);

      if (!hasValidCoordinates(selectedPlace)) return;

      const nextDraft = {
        ...draft,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        address: selectedPlace.address,
        provider: selectedPlace.provider,
        provider_place_id: selectedPlace.provider_place_id,
      };

      setAddressQuery(selectedPlace.name || selectedPlace.address || "");
      setSessionToken(createSessionToken());
      onDraftChange(nextDraft);
    } catch {
      // The inline error state below keeps the editor usable.
    } finally {
      setResolvingPlaceId(null);
    }
  }

  async function nudgePin() {
    const latitude = Number(draft.latitude || 31.5204) + 0.0012;
    const longitude = Number(draft.longitude || 74.3587) + 0.0015;

    try {
      const data = await reverseGeocodeMutation.mutateAsync({
        latitude,
        longitude,
      });
      const resolvedPlace = normalizeLocation(data, {
        latitude,
        longitude,
        address: "Adjusted map pin, Lahore",
        provider: "mapbox",
        provider_place_id:
          draft.provider_place_id || "mapbox.place.adjusted_pin",
      });

      const nextDraft = {
        ...draft,
        ...(resolvedPlace || {
          latitude,
          longitude,
          address: "Adjusted map pin, Lahore",
          provider: "mapbox",
          provider_place_id:
            draft.provider_place_id || "mapbox.place.adjusted_pin",
        }),
      };

      setAddressQuery(nextDraft.address || "");
      onDraftChange(nextDraft);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        setSessionToken(null);
        setResolvingPlaceId(null);
        placeDetailsMutation.reset();
        if (nextOpen) setAddressQuery(draft.address || "");
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[94vh] overflow-y-auto rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
            {isEditing ? "Edit saved place" : "Add saved place"}
          </SheetTitle>

          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            Save a location with a label, type, and address.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Place type
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isEditing || isHomeDisabled}
                onClick={() => {
                  onDraftChange({
                    ...draft,
                    place_type: "home",
                    label: draft.label || "Home",
                  });
                }}
                className={
                  draft.place_type === "home"
                    ? "rounded-[16px] border border-[#008C78] bg-[#E8F7F4] p-3 text-center text-sm font-semibold text-[#008C78]"
                    : isEditing || isHomeDisabled
                      ? "rounded-[16px] border border-[#E1E5EA] bg-[#F7F8FA] p-3 text-center text-sm font-semibold text-[#8A9099]"
                      : "rounded-[16px] border border-[#E1E5EA] bg-white p-3 text-center text-sm font-semibold text-[#4B5563]"
                }
              >
                <Home className="mx-auto mb-2 h-5 w-5" />
                Home
              </button>

              <button
                type="button"
                disabled={isEditing || isWorkDisabled}
                onClick={() => {
                  onDraftChange({
                    ...draft,
                    place_type: "work",
                    label: draft.label || "Work",
                  });
                }}
                className={
                  draft.place_type === "work"
                    ? "rounded-[16px] border border-[#008C78] bg-[#E8F7F4] p-3 text-center text-sm font-semibold text-[#008C78]"
                    : isEditing || isWorkDisabled
                      ? "rounded-[16px] border border-[#E1E5EA] bg-[#F7F8FA] p-3 text-center text-sm font-semibold text-[#8A9099]"
                      : "rounded-[16px] border border-[#E1E5EA] bg-white p-3 text-center text-sm font-semibold text-[#4B5563]"
                }
              >
                <BriefcaseBusiness className="mx-auto mb-2 h-5 w-5" />
                Work
              </button>

              <button
                type="button"
                disabled={isEditing}
                onClick={() => updateField("place_type", "favorite")}
                className={
                  draft.place_type === "favorite"
                    ? "rounded-[16px] border border-[#008C78] bg-[#E8F7F4] p-3 text-center text-sm font-semibold text-[#008C78]"
                    : isEditing
                      ? "rounded-[16px] border border-[#E1E5EA] bg-[#F7F8FA] p-3 text-center text-sm font-semibold text-[#8A9099]"
                    : "rounded-[16px] border border-[#E1E5EA] bg-white p-3 text-center text-sm font-semibold text-[#4B5563]"
                }
              >
                <Heart className="mx-auto mb-2 h-5 w-5" />
                Favorite
              </button>
            </div>

            {isEditing ? (
              <p className="mt-2 text-xs leading-5 text-[#8A9099]">
                Place type is fixed after saving.
              </p>
            ) : (isHomeDisabled || isWorkDisabled) ? (
              <p className="mt-2 text-xs leading-5 text-[#8A9099]">
                Home and Work can only be saved once. Edit the existing one to
                change it.
              </p>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">Label</p>
            <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <Star className="h-5 w-5 text-[#7A8088]" />
              <Input
                value={draft.label}
                onChange={(event) => updateField("label", event.target.value)}
                placeholder="Home, Work, Gym..."
                className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {["Home", "Work", "Gym", "University", "Airport"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateField("label", label)}
                  className="rounded-full border border-[#E1E5EA] bg-white px-3 py-2 text-xs font-semibold text-[#4B5563]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Search address
            </p>

            <div className="flex h-[52px] items-center gap-3 rounded-[16px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <Search className="h-5 w-5 text-[#7A8088]" />
              <Input
                value={addressQuery}
                onFocus={ensureSessionToken}
                onChange={(event) => {
                  ensureSessionToken();
                  placeDetailsMutation.reset();
                  setAddressQuery(event.target.value);
                }}
                placeholder="Search location"
                className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
              />
              {addressQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setAddressQuery("");
                    setSessionToken(createSessionToken());
                    placeDetailsMutation.reset();
                    updateField("address", "");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#7A8088]"
                  aria-label="Clear address"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              {autocompleteQuery.isFetching ? (
                <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 text-sm font-semibold text-[#4B5563] shadow-sm">
                  Searching addresses...
                </Card>
              ) : null}

              {autocompleteQuery.isError ? (
                <p className="text-sm font-medium text-[#DC2626]">
                  Could not fetch suggestions. Try again.
                </p>
              ) : null}

              {placeDetailsMutation.isError ? (
                <p className="text-sm font-medium text-[#DC2626]">
                  Could not fetch location details. Please select another result.
                </p>
              ) : null}

              {filteredSuggestions.slice(0, 4).map((suggestion, index) => {
                const title =
                  suggestion.label ||
                  suggestion.name ||
                  suggestion.full_address ||
                  suggestion.address ||
                  "Location";
                const subtitle = suggestion.full_address || suggestion.address || "";
                const selectedId =
                  suggestion.place_id ||
                  suggestion.provider_place_id ||
                  suggestion.id;
                const isResolving =
                  resolvingPlaceId && resolvingPlaceId === selectedId;

                return (
                <button
                  key={selectedId || subtitle || index}
                  type="button"
                  disabled={Boolean(resolvingPlaceId)}
                  onClick={() => selectSuggestion(suggestion)}
                  className={
                    draft.provider_place_id === selectedId
                      ? "flex w-full items-center gap-3 rounded-[18px] border border-[#008C78] bg-[#E8F7F4] p-3 text-left"
                      : "flex w-full items-center gap-3 rounded-[18px] border border-[#E1E5EA] bg-white p-3 text-left"
                  }
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1FBF9]">
                    <MapPin className="h-5 w-5 text-[#008C78]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#101820]">
                      {title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#4B5563]">
                      {isResolving ? "Getting details..." : subtitle}
                    </p>
                  </div>

                  {draft.provider_place_id === selectedId ? (
                    <CheckCircle2 className="h-5 w-5 text-[#008C78]" />
                  ) : null}
                </button>
              );
              })}

              {addressQuery.trim().length >= 2 &&
              Boolean(sessionToken) &&
              !autocompleteQuery.isFetching &&
              !filteredSuggestions.length ? (
                <p className="text-sm text-[#8A9099]">No suggestions found.</p>
              ) : null}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#101820]">
                Pin preview
              </p>

              <button
                type="button"
                onClick={nudgePin}
                disabled={reverseGeocodeMutation.isPending}
                className="text-sm font-semibold text-[#008C78]"
              >
                {reverseGeocodeMutation.isPending ? "Adjusting..." : "Adjust pin"}
              </button>
            </div>

            <MiniMapPreview place={draft} />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-[#F7F8FA] p-3">
                <p className="text-xs text-[#8A9099]">Latitude</p>
                <p className="mt-1 text-sm font-bold text-[#101820]">
                  {Number(draft.latitude || 0).toFixed(5)}
                </p>
              </div>

              <div className="rounded-[16px] bg-[#F7F8FA] p-3">
                <p className="text-xs text-[#8A9099]">Longitude</p>
                <p className="mt-1 text-sm font-bold text-[#101820]">
                  {Number(draft.longitude || 0).toFixed(5)}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Save place"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function RiderSavedPlacesPage() {
  const navigate = useNavigate();

  const savedPlacesQuery = useSavedPlaces();
  const createPlaceMutation = useCreateSavedPlace();
  const updatePlaceMutation = useUpdateSavedPlace();
  const deletePlaceMutation = useDeleteSavedPlace();

  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const [detailsPlace, setDetailsPlace] = useState(null);
  const [usePlace, setUsePlace] = useState(null);
  const [placeToDelete, setPlaceToDelete] = useState(null);

  const places = useMemo(() => {
    return (savedPlacesQuery.data || []).map(normalizeSavedPlaceForUi);
  }, [savedPlacesQuery.data]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesTab = activeTab === "all" || place.place_type === activeTab;

      const searchPool = [
        place.label,
        place.address,
        place.place_type,
        place.provider_place_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText.trim() ||
        searchPool.includes(searchText.trim().toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [places, activeTab, searchText]);

  function openAddSheet() {
    setDraft({
      ...emptyDraft,
      id: null,
    });
    setEditorOpen(true);
  }

  function openEditSheet(place) {
    setDetailsPlace(null);
    setDraft(place);
    setEditorOpen(true);
  }

  async function saveDraft() {
    const payload = buildSavedPlacePayload(draft);

    try {
      if (draft.id) {
        const { place_type, ...updatePayload } = payload;
        await updatePlaceMutation.mutateAsync({
          saved_place_id: draft.id,
          ...updatePayload,
        });
        toast.success("Saved place updated");
      } else {
        await createPlaceMutation.mutateAsync(payload);
        toast.success("Saved place added");
      }

      setEditorOpen(false);
      setDraft(emptyDraft);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function confirmDelete() {
    if (!placeToDelete) return;

    try {
      await deletePlaceMutation.mutateAsync(placeToDelete.id);
      toast.success("Saved place deleted");
      setPlaceToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  function startBooking(place, mode) {
    setUsePlace(null);

    navigate("/rider/home", {
      state: {
        saved_place: place,
        use_as: mode,
      },
    });
  }

  function handleUsePlace(place) {
    setUsePlace(place);
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => navigate("/rider/home")}
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Saved places</h1>
          </div>

          <Button
            type="button"
            size="icon"
            onClick={openAddSheet}
            className="h-11 w-11 rounded-full bg-[#008C78] text-white hover:bg-[#006F60]"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        <div className="mt-8 space-y-4">
          {savedPlacesQuery.isLoading ? (
            <LoadingState label="Loading saved places..." />
          ) : null}

          {savedPlacesQuery.isError ? (
            <ErrorState message={getApiErrorMessage(savedPlacesQuery.error)} />
          ) : null}

          {!savedPlacesQuery.isLoading && !savedPlacesQuery.isError ? (
            <>
              <SavedPlacesHero places={places} />

              <div className="flex h-[52px] items-center gap-3 rounded-[16px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
                <Search className="h-5 w-5 text-[#7A8088]" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search saved places"
                  className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
                />
                {searchText ? (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#7A8088]"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid h-12 w-full grid-cols-4 rounded-[16px] bg-[#F7F8FA] p-1">
                  <TabsTrigger
                    value="all"
                    className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                  >
                    All
                  </TabsTrigger>

                  <TabsTrigger
                    value="home"
                    className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                  >
                    Home
                  </TabsTrigger>

                  <TabsTrigger
                    value="work"
                    className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                  >
                    Work
                  </TabsTrigger>

                  <TabsTrigger
                    value="favorite"
                    className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                  >
                    Favorite
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                {filteredPlaces.length ? (
                  filteredPlaces.map((place) => (
                    <SavedPlaceCard
                      key={place.id}
                      place={place}
                      onUse={handleUsePlace}
                      onDetails={setDetailsPlace}
                      onEdit={openEditSheet}
                      onDelete={setPlaceToDelete}
                    />
                  ))
                ) : (
                  <EmptySavedPlaces onAdd={openAddSheet} />
                )}
              </div>

              <Button
                type="button"
                onClick={openAddSheet}
                className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add saved place
              </Button>
            </>
          ) : null}
        </div>

        <PlaceEditorSheet
          open={editorOpen}
          draft={draft}
          existingPlaces={places}
          onOpenChange={setEditorOpen}
          onDraftChange={setDraft}
          onSave={saveDraft}
          isSaving={createPlaceMutation.isPending || updatePlaceMutation.isPending}
        />

        <PlaceDetailsSheet
          place={detailsPlace}
          open={Boolean(detailsPlace)}
          onOpenChange={(open) => {
            if (!open) setDetailsPlace(null);
          }}
          onUse={handleUsePlace}
          onEdit={openEditSheet}
        />

        <UsePlaceSheet
          place={usePlace}
          open={Boolean(usePlace)}
          onOpenChange={(open) => {
            if (!open) setUsePlace(null);
          }}
          onStartBooking={startBooking}
        />

        <AlertDialog
          open={Boolean(placeToDelete)}
          onOpenChange={(open) => {
            if (!open) setPlaceToDelete(null);
          }}
        >
          <AlertDialogContent className="max-w-[360px] rounded-[24px] border-[#E1E5EA] bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-[#101820]">
                Delete saved place?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-base leading-6 text-[#4B5563]">
                This will remove{" "}
                <span className="font-semibold text-[#101820]">
                  {placeToDelete?.label}
                </span>{" "}
                from your saved shortcuts.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                Keep place
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deletePlaceMutation.isPending}
                className="h-12 rounded-[14px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C]"
              >
                {deletePlaceMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  );
}
