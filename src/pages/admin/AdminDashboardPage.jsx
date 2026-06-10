import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Car,
  ChevronRight,
  Database,
  FileCheck2,
  Flame,
  GitFork,
  LogOut,
  Sliders,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { queryKeys } from "@/query/queryKeys";
import { clearAccessToken } from "@/utils/tokenStorage";
import { useAdminPricingRules, useAdminMlModels } from "@/hooks/admin/useAdminPricing";
import { useAdminDriverDocuments } from "@/hooks/admin/useAdminDrivers";
import { useSurgeZones } from "@/hooks/maps/useSurgeZones";
import { usePendingVehicles } from "@/hooks/admin/useAdminVehicles";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load dashboard metrics dynamically
  const { data: pricingRules } = useAdminPricingRules();
  const { data: documents } = useAdminDriverDocuments();
  const { data: surgeZones } = useSurgeZones("Lahore");
  const { data: mlModels } = useAdminMlModels();
  const { data: pendingVehicles } = usePendingVehicles();

  const pendingDocsCount = (documents || []).filter(
    (doc) => doc.status === "pending"
  ).length;

  const pendingVehiclesCount = pendingVehicles?.length || 0;

  function handleLogout() {
    clearAccessToken();
    queryClient.removeQueries({ queryKey: queryKeys.me });
    navigate("/auth/login", { replace: true });
  }

  const adminModules = [
    {
      title: "Pricing Rules",
      description: `${pricingRules?.length || 0} active pricing rule(s) configured.`,
      icon: Sliders,
      path: "/admin/pricing-rules",
      badge: "Config",
      color: "bg-[#E8F7F4] text-[#008C78]",
    },
    {
      title: "Driver Document Review",
      description: `${pendingDocsCount} document(s) pending approval.`,
      icon: FileCheck2,
      path: "/admin/driver-documents",
      badge: "Pending Review",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Vehicle Verification",
      description: `${pendingVehiclesCount} vehicle(s) pending approval.`,
      icon: Car,
      path: "/admin/vehicle-verification",
      badge: "Pending Review",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Surge Zones",
      description: `${surgeZones?.length || 0} surge zone(s) active in Lahore.`,
      icon: Flame,
      path: "/admin/surge-zones",
      badge: "Live Multipliers",
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "ML Models",
      description: `${mlModels?.length || 0} prediction engine(s) active.`,
      icon: TrendingUp,
      path: "/admin/ml-models",
      badge: "ML Engine",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Graph Analytics",
      description: "Explore routing trends, driver density, and collusion flags.",
      icon: GitFork,
      path: "/admin/graph-analytics",
      badge: "Neo4j Graph",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white px-6 pb-8 pt-10 shadow-lg">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#E8F7F4]">
              <Database className="h-5 w-5 text-[#008C78]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#008C78]">Admin Center</p>
              <h1 className="text-xl font-bold text-[#101820]">Dashboard</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] text-[#4B5563] hover:bg-slate-50"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-8 rounded-[24px] border border-[#E1E5EA] bg-[#F7F8FA] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#008C78]">
            Database & System Control
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
            Control Center
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#4B5563]">
            Configure and run the platform parameters including fare estimation rates, demand zones, and ML models.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {adminModules.map((mod) => {
            const Icon = mod.icon;

            return (
              <Card
                key={mod.path}
                className="group cursor-pointer rounded-[22px] border border-[#E1E5EA] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => navigate(mod.path)}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${mod.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[#101820] group-hover:text-[#008C78]">
                        {mod.title}
                      </h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${mod.color}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-4 text-[#4B5563]">
                      {mod.description}
                    </p>
                  </div>

                  <ChevronRight className="mt-3.5 h-4 w-4 shrink-0 text-[#8A9099] transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-[#8A9099]">CityLift Portal v1.0.0</p>
        </div>
      </section>
    </main>
  );
}
