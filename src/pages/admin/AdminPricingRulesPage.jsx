import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Plus, Sliders, ToggleLeft, ToggleRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useAdminPricingRules,
  useCreatePricingRule,
  useUpdatePricingRule,
} from "@/hooks/admin/useAdminPricing";
import { LoadingState } from "@/common/LoadingState";
import { ErrorState } from "@/common/ErrorState";
import { getApiErrorMessage } from "@/api/client";

export default function AdminPricingRulesPage() {
  const navigate = useNavigate();

  const { data: rules, isLoading, isError } = useAdminPricingRules();
  const createMutation = useCreatePricingRule();
  const updateMutation = useUpdatePricingRule();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Form states
  const [city, setCity] = useState("Lahore");
  const [vehicleType, setVehicleType] = useState("car");
  const [baseFare, setBaseFare] = useState("100");
  const [perKmRate, setPerKmRate] = useState("40");
  const [perMinRate, setPerMinRate] = useState("8");
  const [waitingPerMinRate, setWaitingPerMinRate] = useState("5");
  const [trafficDelayPerMinRate, setTrafficDelayPerMinRate] = useState("4");
  const [minimumFare, setMinimumFare] = useState("250");
  const [peakMultiplier, setPeakMultiplier] = useState("1.2");
  const [peakStartTime, setPeakStartTime] = useState("17:00:00");
  const [peakEndTime, setPeakEndTime] = useState("21:00:00");

  function openCreate() {
    setEditingRule(null);
    setCity("Lahore");
    setVehicleType("car");
    setBaseFare("100");
    setPerKmRate("40");
    setPerMinRate("8");
    setWaitingPerMinRate("5");
    setTrafficDelayPerMinRate("4");
    setMinimumFare("250");
    setPeakMultiplier("1.2");
    setPeakStartTime("17:00:00");
    setPeakEndTime("21:00:00");
    setSheetOpen(true);
  }

  function openEdit(rule) {
    setEditingRule(rule);
    setCity(rule.city || "Lahore");
    setVehicleType(rule.vehicle_type || "car");
    setBaseFare(String(rule.base_fare || 100));
    setPerKmRate(String(rule.per_km_rate || 40));
    setPerMinRate(String(rule.per_min_rate || 8));
    setWaitingPerMinRate(String(rule.waiting_per_min_rate || 5));
    setTrafficDelayPerMinRate(String(rule.traffic_delay_per_min_rate || 4));
    setMinimumFare(String(rule.minimum_fare || 250));
    setPeakMultiplier(String(rule.peak_multiplier || 1.2));
    setPeakStartTime(rule.peak_start_time || "17:00:00");
    setPeakEndTime(rule.peak_end_time || "21:00:00");
    setSheetOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      city,
      vehicle_type: vehicleType,
      base_fare: Number(baseFare),
      per_km_rate: Number(perKmRate),
      per_min_rate: Number(perMinRate),
      waiting_per_min_rate: Number(waitingPerMinRate),
      traffic_delay_per_min_rate: Number(trafficDelayPerMinRate),
      minimum_fare: Number(minimumFare),
      peak_multiplier: Number(peakMultiplier),
      peak_start_time: peakStartTime,
      peak_end_time: peakEndTime,
    };

    try {
      if (editingRule) {
        await updateMutation.mutateAsync({
          ruleId: editingRule.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setSheetOpen(false);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  async function handleToggleStatus(rule) {
    try {
      await updateMutation.mutateAsync({
        ruleId: rule.id,
        is_active: !rule.is_active,
      });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading pricing rules..." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Could not load pricing rules." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white px-6 pb-8 pt-10 shadow-lg">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <h1 className="text-xl font-bold text-[#101820]">Pricing Rules</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008C78] text-white hover:bg-[#006F60]"
            aria-label="Add Rule"
          >
            <Plus className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-8 space-y-4">
          {rules.length === 0 ? (
            <Card className="rounded-[22px] border border-dashed border-[#E1E5EA] bg-[#F7F8FA] p-8 text-center">
              <Sliders className="mx-auto h-8 w-8 text-[#8A9099]" />
              <h3 className="mt-3 text-base font-bold text-[#101820]">No pricing rules</h3>
              <p className="mt-1 text-sm text-[#4B5563]">
                Click the plus icon to add your first pricing rule.
              </p>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card
                key={rule.id}
                className={`rounded-[22px] border border-[#E1E5EA] bg-white p-4 transition-all duration-200 ${
                  rule.is_active ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#101820] capitalize">
                      {rule.city} · {rule.vehicle_type}
                    </h3>
                    <p className="text-xs text-[#8A9099]">ID: {rule.id}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(rule)}
                      className="text-[#008C78] hover:text-[#006F60]"
                      aria-label="Toggle Status"
                    >
                      {rule.is_active ? (
                        <ToggleRight className="h-7 w-7 text-[#008C78]" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-slate-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(rule)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E1E5EA] text-[#4B5563] hover:bg-slate-50"
                      aria-label="Edit Rule"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Separator className="my-3 bg-[#E1E5EA]" />

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex justify-between pr-2 border-r border-[#E1E5EA]">
                    <span className="text-[#8A9099]">Base Fare</span>
                    <span className="font-bold text-[#101820]">PKR {rule.base_fare}</span>
                  </div>
                  <div className="flex justify-between pl-3">
                    <span className="text-[#8A9099]">Per KM Rate</span>
                    <span className="font-bold text-[#101820]">PKR {rule.per_km_rate}</span>
                  </div>
                  <div className="flex justify-between pr-2 border-r border-[#E1E5EA]">
                    <span className="text-[#8A9099]">Per Min Rate</span>
                    <span className="font-bold text-[#101820]">PKR {rule.per_min_rate}</span>
                  </div>
                  <div className="flex justify-between pl-3">
                    <span className="text-[#8A9099]">Min Fare</span>
                    <span className="font-bold text-[#101820]">PKR {rule.minimum_fare}</span>
                  </div>
                  <div className="flex justify-between pr-2 border-r border-[#E1E5EA]">
                    <span className="text-[#8A9099]">Peak Multiplier</span>
                    <span className="font-bold text-[#101820]">{rule.peak_multiplier}x</span>
                  </div>
                  <div className="flex justify-between pl-3">
                    <span className="text-[#8A9099]">Peak Hours</span>
                    <span className="font-semibold text-[#101820] text-xs">
                      {rule.peak_start_time.slice(0, 5)} - {rule.peak_end_time.slice(0, 5)}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4 h-[85vh] overflow-y-auto"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

            <SheetHeader className="text-left">
              <SheetTitle className="text-[22px] font-bold tracking-[-0.03em] text-[#101820]">
                {editingRule ? "Edit Pricing Rule" : "Create Pricing Rule"}
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-[#4B5563]">
                Enter details to configure ride pricing structure.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Vehicle Type</label>
                  <Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Base Fare (PKR)</label>
                  <Input type="number" value={baseFare} onChange={(e) => setBaseFare(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Per KM Rate (PKR)</label>
                  <Input type="number" value={perKmRate} onChange={(e) => setPerKmRate(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Per Min Rate (PKR)</label>
                  <Input type="number" value={perMinRate} onChange={(e) => setPerMinRate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Min Fare (PKR)</label>
                  <Input type="number" value={minimumFare} onChange={(e) => setMinimumFare(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Waiting (Per Min)</label>
                  <Input type="number" value={waitingPerMinRate} onChange={(e) => setWaitingPerMinRate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Traffic Delay (Per Min)</label>
                  <Input type="number" value={trafficDelayPerMinRate} onChange={(e) => setTrafficDelayPerMinRate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Peak Multiplier</label>
                  <Input type="number" step="0.1" value={peakMultiplier} onChange={(e) => setPeakMultiplier(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Peak Start Time</label>
                  <Input value={peakStartTime} onChange={(e) => setPeakStartTime(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A9099]">Peak End Time</label>
                  <Input value={peakEndTime} onChange={(e) => setPeakEndTime(e.target.value)} required />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
              >
                {editingRule ? "Update Rule" : "Create Rule"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </section>
    </main>
  );
}
