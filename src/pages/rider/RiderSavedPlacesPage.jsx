import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  Heart,
  Home,
  MapPin,
  MoreVertical,
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
import { Textarea } from "@/components/ui/textarea";
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

const initialSavedPlaces = [
  {
    id: "saved_place_001",
    label: "Home",
    place_type: "home",
    address: "Gulberg, Lahore",
    note: "Main gate, street 12",
  },
  {
    id: "saved_place_002",
    label: "Work",
    place_type: "work",
    address: "Johar Town, Lahore",
    note: "Office tower entrance",
  },
  {
    id: "saved_place_003",
    label: "Gym",
    place_type: "favorite",
    address: "MM Alam Road, Lahore",
    note: "Evening pickup spot",
  },
  {
    id: "saved_place_004",
    label: "University",
    place_type: "favorite",
    address: "Canal Road, Lahore",
    note: "Gate 2",
  },
];

const emptyDraft = {
  id: null,
  label: "",
  place_type: "favorite",
  address: "",
  note: "",
};

function getPlaceTypeConfig(placeType) {
  if (placeType === "home") {
    return {
      label: "Home",
      icon: Home,
      badgeClass: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
      iconWrapClass: "bg-[#E8F7F4]",
      iconClass: "text-[#008C78]",
    };
  }

  if (placeType === "work") {
    return {
      label: "Work",
      icon: BriefcaseBusiness,
      badgeClass: "bg-[#EEF2FF] text-[#2563EB] hover:bg-[#EEF2FF]",
      iconWrapClass: "bg-[#EEF2FF]",
      iconClass: "text-[#2563EB]",
    };
  }

  return {
    label: "Favorite",
    icon: Heart,
    badgeClass: "bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFF7ED]",
    iconWrapClass: "bg-[#FFF7ED]",
    iconClass: "text-[#F59E0B]",
  };
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
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            Saved shortcuts
          </Badge>

          <h1 className="mt-4 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
            Your places
          </h1>

          <p className="mt-2 text-sm leading-5 text-[#4B5563]">
            Keep frequent pickup and dropoff locations ready.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-soft">
          <Star className="h-7 w-7 text-[#008C78]" />
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

function SavedPlaceCard({ place, onEdit, onDelete }) {
  const config = getPlaceTypeConfig(place.place_type);
  const TypeIcon = config.icon;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${config.iconWrapClass}`}
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

          {place.note ? (
            <div className="mt-3 rounded-[16px] bg-[#F7F8FA] p-3">
              <p className="text-xs font-medium text-[#8A9099]">Note</p>
              <p className="mt-1 text-sm font-medium text-[#101820]">
                {place.note}
              </p>
            </div>
          ) : null}

          <Separator className="my-4 bg-[#E1E5EA]" />

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
            >
              <Navigation className="mr-1.5 h-4 w-4 text-[#008C78]" />
              Use
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(place)}
              className="h-11 rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
            >
              <Edit3 className="mr-1.5 h-4 w-4 text-[#008C78]" />
              Edit
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onDelete(place)}
              className="h-11 rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#DC2626]"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
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
        No saved places found
      </h2>

      <p className="mt-2 text-sm leading-5 text-[#4B5563]">
        Add Home, Work, or favorite destinations for faster booking.
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

function SavedPlaceSheet({
  open,
  draft,
  onOpenChange,
  onDraftChange,
  onSave,
}) {
  const isEditing = Boolean(draft.id);

  function updateField(field, value) {
    onDraftChange({
      ...draft,
      [field]: value,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
            {isEditing ? "Edit saved place" : "Add saved place"}
          </SheetTitle>

          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            This is UI-only. Later this form will save through the saved places
            API.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">Type</p>

            <Tabs
              value={draft.place_type}
              onValueChange={(value) => updateField("place_type", value)}
            >
              <TabsList className="grid h-12 w-full grid-cols-3 rounded-[16px] bg-[#F7F8FA] p-1">
                <TabsTrigger
                  value="home"
                  className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                >
                  Home
                </TabsTrigger>

                <TabsTrigger
                  value="work"
                  className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                >
                  Work
                </TabsTrigger>

                <TabsTrigger
                  value="favorite"
                  className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                >
                  Favorite
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">Label</p>
            <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <MapPin className="h-5 w-5 text-[#7A8088]" />
              <Input
                value={draft.label}
                onChange={(event) => updateField("label", event.target.value)}
                placeholder="Home, Work, Gym..."
                className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Address
            </p>
            <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <Search className="h-5 w-5 text-[#7A8088]" />
              <Input
                value={draft.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Search or type address"
                className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
              />
            </div>
          </div>

          <Card className="overflow-hidden rounded-[22px] border-[#E1E5EA] bg-[#EAF2F0] p-0 shadow-sm">
            <div className="relative h-[150px]">
              <div className="absolute inset-0 opacity-70">
                <div className="absolute left-[-20%] top-7 h-20 w-[140%] rotate-[-12deg] rounded-full border-[12px] border-white/80" />
                <div className="absolute left-[-10%] top-20 h-16 w-[120%] rotate-[18deg] rounded-full border-[10px] border-white/70" />
              </div>

              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008C78] text-white shadow-card">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#008C78]" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 rounded-[16px] border border-white/70 bg-white/95 p-3 shadow-soft">
                <p className="truncate text-sm font-semibold text-[#101820]">
                  {draft.address || "Selected location preview"}
                </p>
              </div>
            </div>
          </Card>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">Note</p>
            <Textarea
              value={draft.note}
              onChange={(event) => updateField("note", event.target.value)}
              placeholder="Gate number, landmark, pickup hint..."
              className="min-h-[90px] rounded-[16px] border-[#E1E5EA] text-base focus-visible:ring-[#008C78]/20"
            />
          </div>

          <Button
            type="button"
            onClick={onSave}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isEditing ? "Save changes" : "Save place"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function RiderSavedPlacesPage() {
  const navigate = useNavigate();

  const [places, setPlaces] = useState(initialSavedPlaces);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [placeToDelete, setPlaceToDelete] = useState(null);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesTab = activeTab === "all" || place.place_type === activeTab;

      const searchableText = [
        place.label,
        place.address,
        place.note,
        place.place_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText.trim() ||
        searchableText.includes(searchText.trim().toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [places, activeTab, searchText]);

  function openAddSheet() {
    setDraft(emptyDraft);
    setSheetOpen(true);
  }

  function openEditSheet(place) {
    setDraft(place);
    setSheetOpen(true);
  }

  function saveDraft() {
    const safeLabel = draft.label.trim() || "Saved place";
    const safeAddress = draft.address.trim() || "Lahore, Pakistan";

    if (draft.id) {
      setPlaces((current) =>
        current.map((place) =>
          place.id === draft.id
            ? {
                ...draft,
                label: safeLabel,
                address: safeAddress,
              }
            : place
        )
      );
    } else {
      setPlaces((current) => [
        {
          ...draft,
          id: `saved_place_${Date.now()}`,
          label: safeLabel,
          address: safeAddress,
        },
        ...current,
      ]);
    }

    setSheetOpen(false);
    setDraft(emptyDraft);
  }

  function confirmDelete() {
    if (!placeToDelete) return;

    setPlaces((current) =>
      current.filter((place) => place.id !== placeToDelete.id)
    );

    setPlaceToDelete(null);
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
          <SavedPlacesHero places={places} />

          <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
            <Search className="h-5 w-5 text-[#7A8088]" />

            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search saved places"
              className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
            />

            {searchText ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setSearchText("")}
                className="h-8 w-8 rounded-full text-[#7A8088]"
              >
                <X className="h-4 w-4" />
              </Button>
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
            Add new place
          </Button>
        </div>

        <SavedPlaceSheet
          open={sheetOpen}
          draft={draft}
          onOpenChange={setSheetOpen}
          onDraftChange={setDraft}
          onSave={saveDraft}
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
                from your saved shortcuts. This is UI-only for now.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                Keep place
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={confirmDelete}
                className="h-12 rounded-[14px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C]"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  );
}