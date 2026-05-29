import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  IdCard,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { getApiErrorMessage } from "@/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useDriverDocuments,
  useUploadDriverDocument,
} from "@/hooks/driver/useDriverDocuments";
import { useDriverVehicles } from "@/hooks/driver/useDriverVehicles";

const documentTypes = [
  {
    document_type: "cnic",
    title: "CNIC",
    description: "Upload national identity card.",
    icon: IdCard,
  },
  {
    document_type: "license",
    title: "Driving License",
    description: "Upload valid driving license.",
    icon: ShieldCheck,
  },
  {
    document_type: "vehicle_registration",
    title: "Vehicle Registration",
    description: "Upload registration for selected vehicle.",
    icon: Car,
  },
];

const identityDocumentTypes = documentTypes.filter(
  (document) => document.document_type !== "vehicle_registration"
);

function getDocumentTimestamp(document) {
  const timestamp = document?.uploaded_at || document?.updated_at || "";
  const value = Date.parse(timestamp);
  return Number.isFinite(value) ? value : 0;
}

function getLatestDocument(documents, predicate) {
  return documents
    .filter(predicate)
    .sort((a, b) => getDocumentTimestamp(b) - getDocumentTimestamp(a))[0];
}

function getStatusConfig(status) {
  if (status === "approved") {
    return {
      label: "Approved",
      icon: CheckCircle2,
      badgeClass: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
      panelClass: "bg-[#E8F7F4]",
      iconClass: "text-[#008C78]",
    };
  }

  if (status === "pending") {
    return {
      label: "Pending",
      icon: Clock,
      badgeClass: "bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFF7ED]",
      panelClass: "bg-[#FFF7ED]",
      iconClass: "text-[#F59E0B]",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      icon: XCircle,
      badgeClass: "bg-red-50 text-[#DC2626] hover:bg-red-50",
      panelClass: "bg-red-50",
      iconClass: "text-[#DC2626]",
    };
  }

  return {
    label: "Missing",
    icon: UploadCloud,
    badgeClass: "bg-[#F7F8FA] text-[#4B5563] hover:bg-[#F7F8FA]",
    panelClass: "bg-[#F7F8FA]",
    iconClass: "text-[#7A8088]",
  };
}

function getDocumentMeta(documentType) {
  return documentTypes.find((item) => item.document_type === documentType);
}

function toDocumentView(document) {
  const meta = getDocumentMeta(document.document_type);
  const fileName = document.file_name || document.file_url?.split("/").pop();

  return {
    title: meta?.title || document.document_type,
    description: meta?.description || "",
    file_name: fileName,
    ...document,
  };
}

function toVehicleOption(vehicle) {
  return {
    id: vehicle.id,
    label: `${vehicle.color || ""} ${vehicle.make || ""} ${vehicle.model || ""}`
      .replace(/\s+/g, " ")
      .trim() || "Vehicle",
    plate_number: vehicle.plate_number,
  };
}

function DocumentsHero({ cards }) {
  const approvedCount = cards.filter(
    (item) => item.document?.status === "approved"
  ).length;
  const totalCount = Math.max(cards.length, 1);
  const progress = Math.round((approvedCount / totalCount) * 100);

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Driver verification
          </Badge>

          <h1 className="mt-4 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
            Documents
          </h1>

          <p className="mt-2 text-sm leading-5 text-[#4B5563]">
            Upload required documents before going online.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-soft">
          <ShieldCheck className="h-7 w-7 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-5 rounded-[20px] bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#101820]">
            Verification progress
          </p>
          <p className="text-sm font-bold text-[#008C78]">{progress}%</p>
        </div>

        <Progress value={progress} className="mt-3 h-2 bg-[#E1E5EA]" />

        <p className="mt-3 text-xs leading-5 text-[#4B5563]">
          {approvedCount} of {totalCount} required documents approved.
        </p>
      </div>
    </Card>
  );
}

function DocumentCard({ document, vehicle, onUpload }) {
  const meta = getDocumentMeta(document.document_type);
  const Icon = meta?.icon || FileText;
  const statusConfig = getStatusConfig(document.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#F1FBF9]">
          <Icon className="h-6 w-6 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#101820]">
                {meta?.title || document.title}
              </h2>

              <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                {vehicle
                  ? `${vehicle.label} · Plate ${vehicle.plate_number}`
                  : meta?.description || document.description}
              </p>
            </div>

            <Badge
              className={`shrink-0 rounded-full px-3 py-1.5 ${statusConfig.badgeClass}`}
            >
              <StatusIcon className="mr-1 h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="mt-4 rounded-[18px] bg-[#F7F8FA] p-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusConfig.panelClass}`}
              >
                <StatusIcon className={`h-5 w-5 ${statusConfig.iconClass}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#101820]">
                  {document.file_name || "No file uploaded"}
                </p>

                <p className="mt-0.5 text-xs text-[#4B5563]">
                  {document.uploaded_at
                    ? `Uploaded ${document.uploaded_at}`
                    : "Upload required"}
                </p>
              </div>
            </div>
          </div>

          {document.rejection_reason ? (
            <Alert className="mt-3 rounded-[18px] border-red-100 bg-red-50 p-3">
              <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
              <AlertDescription className="text-sm leading-5 text-[#991B1B]">
                {document.rejection_reason}
              </AlertDescription>
            </Alert>
          ) : null}

          {document.verified_at ? (
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[#008C78]">
              <CheckCircle2 className="h-4 w-4" />
              Verified {document.verified_at}
            </div>
          ) : null}

          <Button
            type="button"
            onClick={() => onUpload(document.document_type, document.vehicle_id)}
            className={
              document.status === "approved"
                ? "mt-4 h-[48px] w-full rounded-[14px] border border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820] hover:bg-[#F7F8FA]"
                : "mt-4 h-[48px] w-full rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
            }
            variant={document.status === "approved" ? "outline" : "default"}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {document.status === "approved" ? "Replace document" : "Upload again"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MissingDocumentCard({ documentType, vehicle, onUpload, onAddVehicle }) {
  const meta = getDocumentMeta(documentType);
  const Icon = meta?.icon || FileText;
  const isVehicleRegistration = documentType === "vehicle_registration";

  return (
    <Card className="rounded-[24px] border-dashed border-[#CED4DA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#F7F8FA]">
          <Icon className="h-6 w-6 text-[#7A8088]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#101820]">
                {isVehicleRegistration && vehicle
                  ? `${vehicle.label} registration`
                  : meta.title}
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                {isVehicleRegistration && vehicle
                  ? `Required for plate ${vehicle.plate_number}.`
                  : meta.description}
              </p>
            </div>

            <Badge className="shrink-0 rounded-full bg-[#F7F8FA] px-3 py-1.5 text-[#4B5563] hover:bg-[#F7F8FA]">
              Missing
            </Badge>
          </div>

          <Button
            type="button"
            onClick={() =>
              isVehicleRegistration && !vehicle
                ? onAddVehicle?.()
                : onUpload(documentType, vehicle?.id)
            }
            className="mt-4 h-[48px] w-full rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {isVehicleRegistration && !vehicle
              ? "Add vehicle first"
              : `Upload ${meta.title}`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function UploadDocumentSheet({
  open,
  documentType,
  selectedFile,
  vehicles,
  selectedVehicleId,
  note,
  onOpenChange,
  onFileChange,
  onVehicleChange,
  onNoteChange,
  onSave,
  isUploading,
}) {
  const fileInputRef = useRef(null);
  const meta = getDocumentMeta(documentType);
  const Icon = meta?.icon || FileText;
  const requiresVehicle = documentType === "vehicle_registration";
  const selectedFileName = selectedFile?.name || "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
            Upload {meta?.title || "document"}
          </SheetTitle>

          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            Upload a clear image or PDF for review.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white">
                <Icon className="h-6 w-6 text-[#008C78]" />
              </div>

              <div>
                <p className="text-base font-bold text-[#101820]">
                  {meta?.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                  {meta?.description}
                </p>
              </div>
            </div>
          </Card>

          {requiresVehicle ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-[#101820]">
                Select vehicle
              </p>

              <div className="space-y-2">
                {vehicles.map((vehicle) => {
                  const isSelected = vehicle.id === selectedVehicleId;

                  return (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => onVehicleChange(vehicle.id)}
                      className={
                        isSelected
                          ? "flex w-full items-center gap-3 rounded-[18px] border border-[#008C78] bg-[#E8F7F4] p-3 text-left"
                          : "flex w-full items-center gap-3 rounded-[18px] border border-[#E1E5EA] bg-white p-3 text-left"
                      }
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                        <Car className="h-5 w-5 text-[#008C78]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#101820]">
                          {vehicle.label}
                        </p>
                        <p className="mt-0.5 text-xs text-[#4B5563]">
                          Plate {vehicle.plate_number}
                        </p>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-[#008C78]" />
                      ) : null}
                    </button>
                  );
                })}

                {!vehicles.length ? (
                  <p className="rounded-[16px] bg-[#F7F8FA] p-3 text-sm text-[#4B5563]">
                    Add a vehicle before uploading registration.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Document file
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                onFileChange(file || null);
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-[#CED4DA] bg-[#F7F8FA] px-4 py-7 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white">
                <UploadCloud className="h-7 w-7 text-[#008C78]" />
              </div>

              <p className="mt-4 text-base font-bold text-[#101820]">
                {selectedFileName || "Choose image or PDF"}
              </p>

              <p className="mt-1 text-sm text-[#4B5563]">
                JPG, PNG, or PDF supported
              </p>
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Optional note
            </p>

            <Textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Add a short note for reviewer..."
              className="min-h-[90px] rounded-[16px] border-[#E1E5EA] text-base focus-visible:ring-[#008C78]/20"
            />
          </div>

          <Alert className="rounded-[20px] border-[#F59E0B]/25 bg-[#FFF7ED] p-4">
            <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
            <AlertDescription className="text-sm leading-5 text-[#92400E]">
              Uploaded documents will show as pending until reviewed. This screen
              will send the file to the driver documents API.
            </AlertDescription>
          </Alert>

          <Button
            type="button"
            onClick={onSave}
            disabled={isUploading}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            <UploadCloud className="mr-2 h-5 w-5" />
            {isUploading ? "Uploading..." : "Save upload"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function DriverDocumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const documentsQuery = useDriverDocuments();
  const vehiclesQuery = useDriverVehicles();
  const uploadDocumentMutation = useUploadDriverDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeDocumentType, setActiveDocumentType] = useState(
    location.state?.document_type || "cnic"
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    location.state?.vehicle_id || ""
  );
  const [note, setNote] = useState("");

  const documents = useMemo(
    () => (documentsQuery.data || []).map(toDocumentView),
    [documentsQuery.data]
  );
  const vehicleOptions = useMemo(
    () => (vehiclesQuery.data || []).map(toVehicleOption),
    [vehiclesQuery.data]
  );

  const documentCards = useMemo(() => {
    const identityCards = identityDocumentTypes.map((type) => {
      const existing = getLatestDocument(
        documents,
        (document) =>
          document.document_type === type.document_type && !document.vehicle_id
      );

      return {
        key: type.document_type,
        type,
        document: existing,
        vehicle: null,
      };
    });

    const vehicleRegistrationCards = vehicleOptions.length
      ? vehicleOptions.map((vehicle) => {
          const existing = getLatestDocument(
            documents,
            (document) =>
              document.document_type === "vehicle_registration" &&
              document.vehicle_id === vehicle.id
          );

          return {
            key: `vehicle_registration:${vehicle.id}`,
            type: getDocumentMeta("vehicle_registration"),
            document: existing,
            vehicle,
          };
        })
      : [
          {
            key: "vehicle_registration:missing_vehicle",
            type: getDocumentMeta("vehicle_registration"),
            document: null,
            vehicle: null,
          },
        ];

    return [...identityCards, ...vehicleRegistrationCards];
  }, [documents, vehicleOptions]);

  const approvedCount = documentCards.filter(
    (item) => item.document?.status === "approved"
  ).length;
  const pendingCount = documentCards.filter(
    (item) => item.document?.status === "pending"
  ).length;
  const rejectedCount = documentCards.filter(
    (item) => item.document?.status === "rejected"
  ).length;

  function openUpload(documentType, vehicleId) {
    setActiveDocumentType(documentType);
    setSelectedFile(null);
    setSelectedVehicleId(
      vehicleId ||
        (documentType === "vehicle_registration"
          ? location.state?.vehicle_id || vehicleOptions[0]?.id || ""
          : "")
    );
    setNote("");
    setUploadOpen(true);
  }

  useEffect(() => {
    const documentType = location.state?.document_type;
    const vehicleId = location.state?.vehicle_id;

    if (!documentType || uploadOpen || vehiclesQuery.isLoading) return;

    openUpload(documentType, vehicleId);
    navigate(location.pathname, { replace: true, state: null });
  }, [
    location.pathname,
    location.state,
    navigate,
    uploadOpen,
    vehicleOptions,
    vehiclesQuery.isLoading,
  ]);

  async function saveUpload() {
    if (!selectedFile) {
      toast.error("Choose a document file first");
      return;
    }

    if (activeDocumentType === "vehicle_registration" && !selectedVehicleId) {
      toast.error("Select a vehicle first");
      return;
    }

    try {
      await uploadDocumentMutation.mutateAsync({
        file: selectedFile,
        document_type: activeDocumentType,
        vehicle_id:
          activeDocumentType === "vehicle_registration"
            ? selectedVehicleId
            : null,
      });
      toast.success("Document uploaded");
      setUploadOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => navigate("/driver/onboarding")}
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Documents</h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
            <Sparkles className="h-5 w-5 text-[#008C78]" />
          </div>
        </header>

        <div className="mt-8 space-y-4">
          {documentsQuery.isLoading || vehiclesQuery.isLoading ? (
            <LoadingState label="Loading documents..." />
          ) : documentsQuery.isError || vehiclesQuery.isError ? (
            <ErrorState
              message={
                getApiErrorMessage(documentsQuery.error || vehiclesQuery.error) ||
                "Could not load driver documents."
              }
            />
          ) : (
            <>
              <DocumentsHero cards={documentCards} />

              <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-5 w-5 text-[#008C78]" />
              <p className="mt-2 text-lg font-bold text-[#101820]">
                {approvedCount}
              </p>
              <p className="text-xs text-[#8A9099]">Approved</p>
            </Card>

            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 text-center shadow-sm">
              <Clock className="mx-auto h-5 w-5 text-[#F59E0B]" />
              <p className="mt-2 text-lg font-bold text-[#101820]">
                {pendingCount}
              </p>
              <p className="text-xs text-[#8A9099]">Pending</p>
            </Card>

            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 text-center shadow-sm">
              <XCircle className="mx-auto h-5 w-5 text-[#DC2626]" />
              <p className="mt-2 text-lg font-bold text-[#101820]">
                {rejectedCount}
              </p>
              <p className="text-xs text-[#8A9099]">Rejected</p>
            </Card>
              </div>

              <Alert className="rounded-[20px] border-[#E1E5EA] bg-[#F7F8FA] p-4">
            <FileText className="h-5 w-5 text-[#008C78]" />
            <AlertDescription className="text-sm leading-5 text-[#4B5563]">
              Upload clear images or PDFs. Vehicle registration should match the
              active vehicle selected in your vehicle profile.
            </AlertDescription>
              </Alert>

              <div className="space-y-4">
            {documentCards.map(({ key, type, document, vehicle }) =>
              document ? (
                <DocumentCard
                  key={key}
                  document={document}
                  vehicle={vehicle}
                  onUpload={openUpload}
                />
              ) : (
                <MissingDocumentCard
                  key={key}
                  documentType={type.document_type}
                  vehicle={vehicle}
                  onUpload={openUpload}
                  onAddVehicle={() => navigate("/driver/vehicles")}
                />
              )
            )}
              </div>

              <Separator className="bg-[#E1E5EA]" />

              <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/driver/vehicles")}
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              Vehicles
            </Button>

            <Button
              type="button"
              onClick={() => openUpload("cnic")}
              className="h-[52px] rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
            >
              Upload
            </Button>
              </div>
            </>
          )}
        </div>

        <UploadDocumentSheet
          open={uploadOpen}
          documentType={activeDocumentType}
          selectedFile={selectedFile}
          vehicles={vehicleOptions}
          selectedVehicleId={selectedVehicleId}
          note={note}
          onOpenChange={setUploadOpen}
          onFileChange={setSelectedFile}
          onVehicleChange={setSelectedVehicleId}
          onNoteChange={setNote}
          onSave={saveUpload}
          isUploading={uploadDocumentMutation.isPending}
        />
      </section>
    </main>
  );
}
