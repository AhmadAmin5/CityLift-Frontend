import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileText,
  IdCard,
  FileTextIcon,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Icon,
} from "lucide-react";
import { steeringWheel } from "@lucide/lab";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const demoOnboarding = {
  driver: {
    name: "Ahmed Raza",
    approval_status: "pending",
  },
  documents: [
    {
      id: "doc_cnic",
      title: "CNIC",
      description: "Upload front/back national identity document.",
      document_type: "cnic",
      status: "approved",
      required: true,
    },
    {
      id: "doc_license",
      title: "Driving License",
      description: "Upload valid driving license document.",
      document_type: "license",
      status: "pending",
      required: true,
    },
    {
      id: "doc_registration",
      title: "Vehicle Registration",
      description: "Required for the selected active vehicle.",
      document_type: "vehicle_registration",
      status: "missing",
      required: true,
    },
  ],
  vehicle: {
    exists: true,
    active: true,
    verification_status: "pending",
    label: "White Toyota Corolla",
    plate_number: "LEA-1234",
  },
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
      icon: AlertTriangle,
      badgeClass: "bg-red-50 text-[#DC2626] hover:bg-red-50",
      iconWrapClass: "bg-red-50",
      iconClass: "text-[#DC2626]",
    };
  }

  return {
    label: "Missing",
    icon: UploadCloud,
    badgeClass: "bg-[#F7F8FA] text-[#4B5563] hover:bg-[#F7F8FA]",
    iconWrapClass: "bg-[#F7F8FA]",
    iconClass: "text-[#7A8088]",
  };
}

function getDocumentIcon(documentType) {
  if (documentType === "cnic") return IdCard;
  if (documentType === "license") return FileTextIcon;
  return FileText;
}

function OnboardingHero({ completionPercent, approvalStatus }) {
  const statusConfig = getStatusConfig(approvalStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className={`rounded-full px-3 py-1.5 ${statusConfig.badgeClass}`}>
            <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
            Approval {statusConfig.label.toLowerCase()}
          </Badge>

          <h1 className="mt-4 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
            Finish driver setup
          </h1>

          <p className="mt-2 text-sm leading-5 text-[#4B5563]">
            Complete documents and vehicle verification before going online.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-soft">
        <Icon
                                iconNode={steeringWheel}
                            className="h-7 w-7 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-5 rounded-[20px] bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#101820]">Setup progress</p>
          <p className="text-sm font-bold text-[#008C78]">
            {completionPercent}%
          </p>
        </div>

        <Progress value={completionPercent} className="mt-3 h-2 bg-[#E1E5EA]" />

        <p className="mt-3 text-xs leading-5 text-[#4B5563]">
          Approval may stay pending until the admin reviews your submitted
          documents and vehicle.
        </p>
      </div>
    </Card>
  );
}

function RequirementCard({ title, description, icon: Icon, status, actionLabel, onClick }) {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#F1FBF9]">
          <Icon className="h-6 w-6 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#101820]">{title}</h2>
              <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                {description}
              </p>
            </div>

            <Badge className={`shrink-0 rounded-full px-3 py-1.5 ${statusConfig.badgeClass}`}>
              <StatusIcon className="mr-1 h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClick}
            className="mt-4 h-[48px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
          >
            {actionLabel}
            <ChevronRight className="ml-2 h-4 w-4 text-[#7A8088]" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DocumentChecklist({ documents, onNavigate }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <FileCheck2 className="h-5 w-5 text-[#008C78]" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#101820]">Required documents</h2>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            CNIC, license, and vehicle registration.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {documents.map((document) => {
          const DocumentIcon = getDocumentIcon(document.document_type);
          const statusConfig = getStatusConfig(document.status);
          const StatusIcon = statusConfig.icon;

          return (
            <button
              key={document.id}
              type="button"
              onClick={() => onNavigate("/driver/documents")}
              className="flex w-full items-center gap-3 rounded-[18px] bg-[#F7F8FA] p-3 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <DocumentIcon className="h-5 w-5 text-[#008C78]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#101820]">
                  {document.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#4B5563]">
                  {document.description}
                </p>
              </div>

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${statusConfig.iconWrapClass}`}
              >
                <StatusIcon className={`h-4 w-4 ${statusConfig.iconClass}`} />
              </div>
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        onClick={() => onNavigate("/driver/documents")}
        className="mt-4 h-12 w-full rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        Upload documents
      </Button>
    </Card>
  );
}

function VehicleSetupCard({ vehicle, onNavigate }) {
  const vehicleStatus = vehicle.exists
    ? vehicle.verification_status
    : "missing";

  const statusConfig = getStatusConfig(vehicleStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#E8F7F4]">
          <Car className="h-6 w-6 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#101820]">
                Active vehicle
              </h2>

              {vehicle.exists ? (
                <>
                  <p className="mt-1 truncate text-sm text-[#4B5563]">
                    {vehicle.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#101820]">
                    Plate {vehicle.plate_number}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-[#4B5563]">
                  Add a vehicle before going online.
                </p>
              )}
            </div>

            <Badge className={`shrink-0 rounded-full px-3 py-1.5 ${statusConfig.badgeClass}`}>
              <StatusIcon className="mr-1 h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
          </div>

          <Separator className="my-4 bg-[#E1E5EA]" />

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate("/driver/vehicles")}
              className="h-[48px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
            >
              Manage vehicle
            </Button>

            <Button
              type="button"
              onClick={() => onNavigate("/driver/vehicles")}
              className="h-[48px] rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
            >
              Add vehicle
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ApprovalTimeline({ approvalStatus }) {
  const steps = [
    {
      title: "Account created",
      description: "Your driver account is ready.",
      status: "approved",
    },
    {
      title: "Documents submitted",
      description: "Upload identity, license, and vehicle documents.",
      status: "pending",
    },
    {
      title: "Admin review",
      description: "RideFlow verifies documents and vehicle details.",
      status: approvalStatus === "approved" ? "approved" : "pending",
    },
    {
      title: "Go online",
      description: "Start accepting ride offers after approval.",
      status: approvalStatus === "approved" ? "approved" : "missing",
    },
  ];

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
          <ClipboardCheck className="h-5 w-5 text-[#008C78]" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#101820]">Approval timeline</h2>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            Track what happens before going online.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {steps.map((step, index) => {
          const statusConfig = getStatusConfig(step.status);
          const StatusIcon = statusConfig.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${statusConfig.iconWrapClass}`}
                >
                  <StatusIcon className={`h-4 w-4 ${statusConfig.iconClass}`} />
                </div>

                {!isLast ? (
                  <div className="mt-1 h-8 w-px bg-[#E1E5EA]" />
                ) : null}
              </div>

              <div className="min-w-0 pt-1">
                <p className="text-sm font-bold text-[#101820]">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[#4B5563]">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function DriverOnboardingPage() {
  const navigate = useNavigate();

  const completedItems = useMemo(() => {
    const approvedDocs = demoOnboarding.documents.filter(
      (document) => document.status === "approved"
    ).length;

    const vehicleReady =
      demoOnboarding.vehicle.exists &&
      demoOnboarding.vehicle.verification_status === "approved"
        ? 1
        : 0;

    const approvalReady =
      demoOnboarding.driver.approval_status === "approved" ? 1 : 0;

    return approvedDocs + vehicleReady + approvalReady;
  }, []);

  const totalItems = demoOnboarding.documents.length + 2;
  const completionPercent = Math.round((completedItems / totalItems) * 100);

  const canGoHome =
    demoOnboarding.driver.approval_status === "approved" &&
    demoOnboarding.vehicle.exists &&
    demoOnboarding.vehicle.verification_status === "approved" &&
    demoOnboarding.documents.every(
      (document) => document.status === "approved"
    );

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
            <h1 className="text-lg font-bold text-[#101820]">Driver setup</h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
            <Sparkles className="h-5 w-5 text-[#008C78]" />
          </div>
        </header>

        <div className="mt-8 space-y-4">
          <OnboardingHero
            completionPercent={completionPercent}
            approvalStatus={demoOnboarding.driver.approval_status}
          />

          {!canGoHome ? (
            <Alert className="rounded-[20px] border-[#F59E0B]/25 bg-[#FFF7ED] p-4">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              <AlertDescription className="text-sm leading-5 text-[#92400E]">
                Your driver profile is not fully ready yet. Complete all pending
                requirements before going online.
              </AlertDescription>
            </Alert>
          ) : null}

          <RequirementCard
            title="Driver approval"
            description="Admin approval is needed before accepting rides."
            icon={ShieldCheck}
            status={demoOnboarding.driver.approval_status}
            actionLabel="View approval timeline"
            onClick={() => {}}
          />

          <DocumentChecklist
            documents={demoOnboarding.documents}
            onNavigate={navigate}
          />

          <VehicleSetupCard
            vehicle={demoOnboarding.vehicle}
            onNavigate={navigate}
          />

          <ApprovalTimeline
            approvalStatus={demoOnboarding.driver.approval_status}
          />

          <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <FileCheck2 className="h-5 w-5 text-[#008C78]" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#101820]">
                  What happens next?
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                  After documents and vehicle details are approved, your Driver
                  Home switch will let you go online and receive ride offers.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/driver/documents")}
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              Documents
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/driver/vehicles")}
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
            >
              Vehicles
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/driver/home")}
            disabled={!canGoHome}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Icon
                                iconNode={steeringWheel} className="mr-2 h-5 w-5" />
            {canGoHome ? "Go to driver home" : "Setup not complete"}
          </Button>
        </div>
      </section>
    </main>
  );
}