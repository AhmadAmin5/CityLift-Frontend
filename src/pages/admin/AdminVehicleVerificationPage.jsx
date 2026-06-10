import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Car, Calendar, FileText, ExternalLink, ShieldAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { usePendingVehicles, useVerifyVehicle } from "@/hooks/admin/useAdminVehicles";
import { getApiErrorMessage } from "@/api/client";
import { LoadingState } from "@/common/LoadingState";
import { ErrorState } from "@/common/ErrorState";
import { formatUuid } from "@/utils/rideUi";

export default function AdminVehicleVerificationPage() {
  const navigate = useNavigate();

  const { data: vehicles, isLoading, isError } = usePendingVehicles();
  const verifyVehicleMutation = useVerifyVehicle();

  const [confirmingAction, setConfirmingAction] = useState(null); // { vehicle, status }

  async function handleVerify(vehicleId, status) {
    try {
      await verifyVehicleMutation.mutateAsync({
        vehicleId,
        status,
      });
      setConfirmingAction(null);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  function startConfirmation(vehicle, status) {
    setConfirmingAction({ vehicle, status });
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading pending vehicles..." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Could not load pending vehicles." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white px-6 pb-8 pt-10 shadow-lg">
        <header className="flex items-center gap-3">
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
            <h1 className="text-xl font-bold text-[#101820]">Vehicle Verification</h1>
          </div>
        </header>

        <div className="mt-8 flex-1 space-y-4">
          <p className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">
            Vehicles Pending Review
          </p>

          {(!vehicles || vehicles.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F7F4] text-[#008C78] mb-4">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-[#101820] text-lg">All caught up!</h3>
              <p className="text-sm text-[#8A9099] mt-1 px-4">
                There are currently no vehicles pending approval.
              </p>
              <Button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="mt-6 rounded-[12px] bg-[#008C78] text-white hover:bg-[#006F60] font-semibold text-sm h-11 px-6"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="rounded-[22px] border border-[#E1E5EA] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Car className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#101820] text-base">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-xs text-[#8A9099] flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> {vehicle.year} &bull; ID: {formatUuid(vehicle.id)}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-600">
                    {vehicle.verification_status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#F7F8FA] rounded-xl p-3 border border-[#E1E5EA]">
                  <div>
                    <span className="text-[#8A9099] block">Color</span>
                    <span className="font-bold text-[#101820] capitalize">{vehicle.color}</span>
                  </div>
                  <div>
                    <span className="text-[#8A9099] block">Plate Number</span>
                    <span className="font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded tracking-wide uppercase">
                      {vehicle.plate_number}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[#8A9099] block">Type</span>
                    <span className="font-bold text-[#101820] capitalize">{vehicle.vehicle_type}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[#8A9099] block">Driver ID</span>
                    <span className="font-bold text-[#101820]">{formatUuid(vehicle.driver_id)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-[#101820] uppercase tracking-wider mb-2">
                    Documents
                  </h4>
                  {(!vehicle.documents || vehicle.documents.length === 0) ? (
                    <p className="text-xs text-amber-600 italic">No documents uploaded for this vehicle.</p>
                  ) : (
                    <div className="space-y-2">
                      {vehicle.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="font-semibold text-[#101820] truncate capitalize">
                              {doc.document_type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[#008C78] hover:text-[#006F60] font-semibold underline shrink-0 ml-2"
                          >
                            View
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => startConfirmation(vehicle, "rejected")}
                    disabled={verifyVehicleMutation.isPending}
                    className="h-10 flex-1 rounded-[10px] border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>

                  <Button
                    type="button"
                    onClick={() => startConfirmation(vehicle, "approved")}
                    disabled={verifyVehicleMutation.isPending}
                    className="h-10 flex-1 rounded-[10px] bg-[#008C78] text-xs font-semibold text-white hover:bg-[#006F60]"
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {confirmingAction ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-[2px]">
            <Card className="w-full max-w-[340px] rounded-[24px] border-[#E1E5EA] bg-white p-5 shadow-xl">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`h-5 w-5 ${confirmingAction.status === 'approved' ? 'text-[#008C78]' : 'text-red-500'}`} />
                <h3 className="text-lg font-bold text-[#101820]">
                  {confirmingAction.status === "approved" ? "Approve Vehicle" : "Reject Vehicle"}
                </h3>
              </div>
              <p className="mt-2 text-sm text-[#4B5563]">
                Are you sure you want to <strong>{confirmingAction.status}</strong> this vehicle ({confirmingAction.vehicle.make} {confirmingAction.vehicle.model}, Plate: {confirmingAction.vehicle.plate_number})?
              </p>

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmingAction(null)}
                  className="h-11 flex-1 rounded-[10px] text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={verifyVehicleMutation.isPending}
                  onClick={() => handleVerify(confirmingAction.vehicle.id, confirmingAction.status)}
                  className={`h-11 flex-1 rounded-[10px] text-xs font-semibold text-white ${
                    confirmingAction.status === "approved" 
                      ? "bg-[#008C78] hover:bg-[#006F60]" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </section>
    </main>
  );
}
