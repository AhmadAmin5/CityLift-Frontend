import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, FileText, ShieldAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  useAdminDriverDocuments,
  useUpdateDriverApproval,
  useVerifyDriverDocument,
} from "@/hooks/admin/useAdminDrivers";
import { getApiErrorMessage } from "@/api/client";
import { LoadingState } from "@/common/LoadingState";
import { ErrorState } from "@/common/ErrorState";

export default function AdminDriverDocumentsPage() {
  const navigate = useNavigate();

  const { data: docs, isLoading, isError } = useAdminDriverDocuments();
  const verifyDocMutation = useVerifyDriverDocument();
  const driverApprovalMutation = useUpdateDriverApproval();

  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleVerify(doc, status, reason = null) {
    try {
      // 1. Verify the document
      await verifyDocMutation.mutateAsync({
        documentId: doc.id,
        status,
        rejection_reason: reason,
      });

      // 2. Automatically update driver status based on document status
      await driverApprovalMutation.mutateAsync({
        driverId: doc.driver_id,
        approval_status: status === "approved" ? "approved" : "rejected",
      });

      setRejectingDoc(null);
      setRejectReason("");
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  function startReject(doc) {
    setRejectingDoc(doc);
    setRejectReason("");
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading driver documents..." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Could not load driver documents." />
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
            <h1 className="text-xl font-bold text-[#101820]">Driver Review</h1>
          </div>
        </header>

        <div className="mt-8 space-y-4">
          <p className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">
            Documents Pending Review
          </p>

          {docs.map((doc) => (
            <Card key={doc.id} className="rounded-[22px] border border-[#E1E5EA] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#101820] capitalize">
                      {doc.document_type.replace("_", " ")}
                    </h3>
                    <p className="text-xs text-[#8A9099]">
                      Driver: {doc.driver_name || (doc.driver_id === "driver_001" ? "Ahmed Raza" : doc.driver_id)}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    doc.status === "approved"
                      ? "bg-[#E8F7F4] text-[#008C78]"
                      : doc.status === "rejected"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-1 rounded-xl bg-[#F7F8FA] p-3 text-xs text-[#4B5563]">
                <p>
                  <span className="font-semibold text-[#101820]">Document ID:</span> {doc.id}
                </p>
                <p>
                  <span className="font-semibold text-[#101820]">File URL:</span>{" "}
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#008C78] underline"
                  >
                    View Document File
                  </a>
                </p>
                {doc.rejection_reason ? (
                  <p className="mt-2 text-red-600">
                    <span className="font-bold">Rejection Reason:</span> {doc.rejection_reason}
                  </p>
                ) : null}
              </div>

              {doc.status === "pending" ? (
                <div className="mt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => startReject(doc)}
                    disabled={verifyDocMutation.isPending || driverApprovalMutation.isPending}
                    className="h-10 flex-1 rounded-[10px] border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleVerify(doc, "approved")}
                    disabled={verifyDocMutation.isPending || driverApprovalMutation.isPending}
                    className="h-10 flex-1 rounded-[10px] bg-[#008C78] text-xs font-semibold text-white hover:bg-[#006F60]"
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>

        {rejectingDoc ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-[2px]">
            <Card className="w-full max-w-[340px] rounded-[24px] border-[#E1E5EA] bg-white p-5 shadow-xl">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-bold text-[#101820]">Reject Document</h3>
              </div>
              <p className="mt-2 text-sm text-[#4B5563]">
                Please provide the reason for document rejection.
              </p>

              <div className="mt-4 space-y-4">
                <Input
                  placeholder="e.g. Blurred photo, expired date"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRejectingDoc(null)}
                    className="h-11 flex-1 rounded-[10px] text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={!rejectReason.trim()}
                    onClick={() => handleVerify(rejectingDoc, "rejected", rejectReason)}
                    className="h-11 flex-1 rounded-[10px] bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Submit Rejection
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : null}
      </section>
    </main>
  );
}
