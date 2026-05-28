import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle2,
  Clock,
  Edit3,
  FileCheck2,
  Gauge,
  Plus,
  Sparkles,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const initialVehicles = [
  {
    id: "vehicle_001",
    make: "Toyota",
    model: "Corolla",
    year: "2020",
    plate_number: "LEA-1234",
    color: "White",
    vehicle_type: "car",
    is_active: true,
    verification_status: "approved",
    documents_status: "approved",
    added_at: "May 24, 2026",
  },
  {
    id: "vehicle_002",
    make: "Honda",
    model: "City",
    year: "2019",
    plate_number: "LEB-7788",
    color: "Silver",
    vehicle_type: "car",
    is_active: false,
    verification_status: "pending",
    documents_status: "pending",
    added_at: "May 27, 2026",
  },
  {
    id: "vehicle_003",
    make: "Suzuki",
    model: "Alto",
    year: "2021",
    plate_number: "LEC-9088",
    color: "Black",
    vehicle_type: "mini",
    is_active: false,
    verification_status: "rejected",
    documents_status: "rejected",
    rejection_reason: "Plate number image did not match vehicle registration.",
    added_at: "May 20, 2026",
  },
];

const emptyVehicleDraft = {
  id: null,
  make: "",
  model: "",
  year: "",
  plate_number: "",
  color: "",
  vehicle_type: "car",
  is_active: false,
  verification_status: "pending",
  documents_status: "missing",
  rejection_reason: null,
};

function getStatusConfig(status) {
  if (status === "approved") {
    return {
      label: "Approved",
      icon: CheckCircle2,
      badgeClass: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
      iconWrapClass: "bg-[#E8F7F4]",
      iconClass: "text-[#008C78]",
    };
  }

  if (status === "pending") {
    return {
      label: "Pending",
      icon: Clock,
      badgeClass: "bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFF7ED]",
      iconWrapClass: "bg-[#FFF7ED]",
      iconClass: "text-[#F59E0B]",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      icon: XCircle,
      badgeClass: "bg-red-50 text-[#DC2626] hover:bg-red-50",
      iconWrapClass: "bg-red-50",
      iconClass: "text-[#DC2626]",
    };
  }

  return {
    label: "Missing",
    icon: AlertTriangle,
    badgeClass: "bg-[#F7F8FA] text-[#4B5563] hover:bg-[#F7F8FA]",
    iconWrapClass: "bg-[#F7F8FA]",
    iconClass: "text-[#7A8088]",
  };
}

function VehiclesHero({ vehicles }) {
  const activeVehicle = vehicles.find((vehicle) => vehicle.is_active);
  const approvedCount = vehicles.filter(
    (vehicle) => vehicle.verification_status === "approved"
  ).length;
  const pendingCount = vehicles.filter(
    (vehicle) => vehicle.verification_status === "pending"
  ).length;

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <Car className="mr-1.5 h-3.5 w-3.5" />
            Vehicle setup
          </Badge>

          <h1 className="mt-4 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
            Your vehicles
          </h1>

          <p className="mt-2 text-sm leading-5 text-[#4B5563]">
            Add vehicles, review verification, and choose the active car for ride
            offers.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-soft">
          <Sparkles className="h-7 w-7 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-5 rounded-[20px] bg-white p-4 shadow-soft">
        <p className="text-xs font-semibold text-[#8A9099]">Active vehicle</p>

        {activeVehicle ? (
          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[#101820]">
                {activeVehicle.color} {activeVehicle.make} {activeVehicle.model}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#4B5563]">
                Plate {activeVehicle.plate_number}
              </p>
            </div>

            <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Active
            </Badge>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#4B5563]">
            No active vehicle selected.
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <p className="text-lg font-bold text-[#101820]">{vehicles.length}</p>
          <p className="mt-0.5 text-xs text-[#8A9099]">Total</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <p className="text-lg font-bold text-[#101820]">{approvedCount}</p>
          <p className="mt-0.5 text-xs text-[#8A9099]">Approved</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <p className="text-lg font-bold text-[#101820]">{pendingCount}</p>
          <p className="mt-0.5 text-xs text-[#8A9099]">Pending</p>
        </div>
      </div>
    </Card>
  );
}

function VehicleIllustration({ vehicle }) {
  return (
    <div className="relative h-[150px] overflow-hidden rounded-[22px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-20%] top-6 h-20 w-[140%] rotate-[-12deg] rounded-full border-[12px] border-white/80" />
        <div className="absolute left-[-10%] top-20 h-16 w-[120%] rotate-[18deg] rounded-full border-[10px] border-white/70" />
      </div>

      <div className="absolute bottom-8 left-1/2 h-16 w-44 -translate-x-1/2 rounded-[26px] bg-[#008C78] shadow-card">
        <div className="absolute left-4 top-5 h-6 w-6 rounded-full border-4 border-white bg-[#101820]" />
        <div className="absolute right-4 top-5 h-6 w-6 rounded-full border-4 border-white bg-[#101820]" />
        <div className="absolute left-1/2 top-3 h-6 w-20 -translate-x-1/2 rounded-full bg-[#E8F7F4]" />
      </div>

      <div className="absolute bottom-3 left-4 right-4 rounded-[16px] border border-white/70 bg-white/95 p-3 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-bold text-[#101820]">
            {vehicle.color || "Vehicle"} {vehicle.make} {vehicle.model}
          </p>
          <p className="shrink-0 text-xs font-bold text-[#008C78]">
            {vehicle.plate_number}
          </p>
        </div>
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, onEdit, onSetActive, onDelete, onDocuments }) {
  const statusConfig = getStatusConfig(vehicle.verification_status);
  const StatusIcon = statusConfig.icon;

  const documentStatusConfig = getStatusConfig(vehicle.documents_status);
  const DocumentStatusIcon = documentStatusConfig.icon;

  const canSetActive =
    vehicle.verification_status === "approved" && !vehicle.is_active;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <VehicleIllustration vehicle={vehicle} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold tracking-[-0.02em] text-[#101820]">
              {vehicle.color} {vehicle.make} {vehicle.model}
            </h2>

            {vehicle.is_active ? (
              <Badge className="shrink-0 rounded-full bg-[#E8F7F4] px-2.5 py-1 text-xs text-[#008C78] hover:bg-[#E8F7F4]">
                Active
              </Badge>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-[#4B5563]">
            {vehicle.year} · {vehicle.vehicle_type}
          </p>
        </div>

        <div className="rounded-[12px] border border-[#E1E5EA] bg-[#F7F8FA] px-3 py-2">
          <p className="text-sm font-bold tracking-wide text-[#101820]">
            {vehicle.plate_number}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[18px] bg-[#F7F8FA] p-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${statusConfig.iconWrapClass}`}
            >
              <StatusIcon className={`h-4 w-4 ${statusConfig.iconClass}`} />
            </div>

            <div>
              <p className="text-xs text-[#8A9099]">Vehicle</p>
              <p className="text-sm font-bold text-[#101820]">
                {statusConfig.label}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] bg-[#F7F8FA] p-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${documentStatusConfig.iconWrapClass}`}
            >
              <DocumentStatusIcon
                className={`h-4 w-4 ${documentStatusConfig.iconClass}`}
              />
            </div>

            <div>
              <p className="text-xs text-[#8A9099]">Docs</p>
              <p className="text-sm font-bold text-[#101820]">
                {documentStatusConfig.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {vehicle.rejection_reason ? (
        <div className="mt-4 rounded-[18px] border border-red-100 bg-red-50 p-3">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
            <p className="text-sm leading-5 text-[#991B1B]">
              {vehicle.rejection_reason}
            </p>
          </div>
        </div>
      ) : null}

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => onEdit(vehicle)}
          className="h-[48px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
        >
          <Edit3 className="mr-2 h-4 w-4 text-[#008C78]" />
          Edit
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onDocuments(vehicle)}
          className="h-[48px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
        >
          <FileCheck2 className="mr-2 h-4 w-4 text-[#008C78]" />
          Docs
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button
          type="button"
          disabled={!canSetActive}
          onClick={() => onSetActive(vehicle)}
          className={
            vehicle.is_active
              ? "h-[48px] rounded-[14px] bg-[#E8F7F4] text-sm font-semibold text-[#008C78] hover:bg-[#E8F7F4]"
              : "h-[48px] rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
          }
        >
          {vehicle.is_active ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Active
            </>
          ) : (
            <>
              <Star className="mr-2 h-4 w-4" />
              Set active
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onDelete(vehicle)}
          className="h-[48px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#DC2626]"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </Card>
  );
}

function EmptyVehicles({ onAdd }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E8F7F4]">
        <Car className="h-8 w-8 text-[#008C78]" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#101820]">
        No vehicles found
      </h2>

      <p className="mt-2 text-sm leading-5 text-[#4B5563]">
        Add a vehicle to continue driver verification.
      </p>

      <Button
        type="button"
        onClick={onAdd}
        className="mt-5 h-12 rounded-[14px] bg-[#008C78] px-5 text-sm font-semibold text-white hover:bg-[#006F60]"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add vehicle
      </Button>
    </Card>
  );
}

function VehicleSheet({
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
            {isEditing ? "Edit vehicle" : "Add vehicle"}
          </SheetTitle>

          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            UI-only vehicle form. API wiring will come later.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Vehicle type
            </p>

            <Tabs
              value={draft.vehicle_type}
              onValueChange={(value) => updateField("vehicle_type", value)}
            >
              <TabsList className="grid h-12 w-full grid-cols-3 rounded-[16px] bg-[#F7F8FA] p-1">
                <TabsTrigger
                  value="mini"
                  className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                >
                  Mini
                </TabsTrigger>

                <TabsTrigger
                  value="car"
                  className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                >
                  Car
                </TabsTrigger>

                <TabsTrigger
                  value="premium"
                  className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
                >
                  Premium
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#101820]">Make</p>
              <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
                <Input
                  value={draft.make}
                  onChange={(event) => updateField("make", event.target.value)}
                  placeholder="Toyota"
                  className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#101820]">Model</p>
              <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
                <Input
                  value={draft.model}
                  onChange={(event) => updateField("model", event.target.value)}
                  placeholder="Corolla"
                  className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#101820]">Year</p>
              <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
                <Input
                  value={draft.year}
                  onChange={(event) => updateField("year", event.target.value)}
                  placeholder="2020"
                  inputMode="numeric"
                  className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#101820]">Color</p>
              <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
                <Input
                  value={draft.color}
                  onChange={(event) => updateField("color", event.target.value)}
                  placeholder="White"
                  className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Plate number
            </p>
            <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <Input
                value={draft.plate_number}
                onChange={(event) =>
                  updateField("plate_number", event.target.value.toUpperCase())
                }
                placeholder="LEA-1234"
                className="h-auto border-0 p-0 text-base uppercase text-[#101820] shadow-none placeholder:normal-case placeholder:text-[#8A9099] focus-visible:ring-0"
              />
            </div>
          </div>

          <Card className="rounded-[22px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <FileCheck2 className="h-5 w-5 text-[#008C78]" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#101820]">
                  Vehicle verification
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                  New or edited vehicles will show as pending until documents
                  and details are reviewed.
                </p>
              </div>
            </div>
          </Card>

          <Button
            type="button"
            onClick={onSave}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isEditing ? "Save vehicle" : "Add vehicle"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function DriverVehiclesPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState(initialVehicles);
  const [activeTab, setActiveTab] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(emptyVehicleDraft);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const filteredVehicles = useMemo(() => {
    if (activeTab === "all") return vehicles;
    if (activeTab === "active") return vehicles.filter((vehicle) => vehicle.is_active);
    return vehicles.filter(
      (vehicle) => vehicle.verification_status === activeTab
    );
  }, [vehicles, activeTab]);

  function openAddSheet() {
    setDraft(emptyVehicleDraft);
    setSheetOpen(true);
  }

  function openEditSheet(vehicle) {
    setDraft(vehicle);
    setSheetOpen(true);
  }

  function saveVehicleUiOnly() {
    const safeVehicle = {
      ...draft,
      id: draft.id || `vehicle_${Date.now()}`,
      make: draft.make.trim() || "Toyota",
      model: draft.model.trim() || "Corolla",
      year: draft.year.trim() || "2020",
      plate_number: draft.plate_number.trim() || "LEA-0000",
      color: draft.color.trim() || "White",
      verification_status: draft.id ? draft.verification_status : "pending",
      documents_status: draft.id ? draft.documents_status : "missing",
      is_active: draft.id ? draft.is_active : false,
    };

    if (draft.id) {
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === draft.id ? safeVehicle : vehicle
        )
      );
    } else {
      setVehicles((current) => [safeVehicle, ...current]);
    }

    setSheetOpen(false);
    setDraft(emptyVehicleDraft);
  }

  function setActiveVehicle(vehicle) {
    if (vehicle.verification_status !== "approved") return;

    setVehicles((current) =>
      current.map((item) => ({
        ...item,
        is_active: item.id === vehicle.id,
      }))
    );
  }

  function confirmDeleteVehicle() {
    if (!vehicleToDelete) return;

    setVehicles((current) =>
      current.filter((vehicle) => vehicle.id !== vehicleToDelete.id)
    );

    setVehicleToDelete(null);
  }

  function goToVehicleDocuments(vehicle) {
    navigate("/driver/documents", {
      state: {
        vehicle_id: vehicle.id,
        document_type: "vehicle_registration",
      },
    });
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => navigate("/driver/home")}
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Vehicles</h1>
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
          <VehiclesHero vehicles={vehicles} />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-12 w-full grid-cols-4 rounded-[16px] bg-[#F7F8FA] p-1">
              <TabsTrigger
                value="all"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                All
              </TabsTrigger>

              <TabsTrigger
                value="active"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Active
              </TabsTrigger>

              <TabsTrigger
                value="approved"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Approved
              </TabsTrigger>

              <TabsTrigger
                value="pending"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Pending
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <Gauge className="h-5 w-5 text-[#008C78]" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#101820]">
                  Active vehicle required
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                  Only approved vehicles can be set as active and used for driver
                  ride offers.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {filteredVehicles.length ? (
              filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEdit={openEditSheet}
                  onSetActive={setActiveVehicle}
                  onDelete={setVehicleToDelete}
                  onDocuments={goToVehicleDocuments}
                />
              ))
            ) : (
              <EmptyVehicles onAdd={openAddSheet} />
            )}
          </div>

          <Button
            type="button"
            onClick={openAddSheet}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add new vehicle
          </Button>
        </div>

        <VehicleSheet
          open={sheetOpen}
          draft={draft}
          onOpenChange={setSheetOpen}
          onDraftChange={setDraft}
          onSave={saveVehicleUiOnly}
        />

        <AlertDialog
          open={Boolean(vehicleToDelete)}
          onOpenChange={(open) => {
            if (!open) setVehicleToDelete(null);
          }}
        >
          <AlertDialogContent className="max-w-[360px] rounded-[24px] border-[#E1E5EA] bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-[#101820]">
                Delete vehicle?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-base leading-6 text-[#4B5563]">
                This will remove{" "}
                <span className="font-semibold text-[#101820]">
                  {vehicleToDelete?.color} {vehicleToDelete?.make}{" "}
                  {vehicleToDelete?.model}
                </span>{" "}
                from your vehicles. This is UI-only for now.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                Keep vehicle
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={confirmDeleteVehicle}
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