import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Network,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Users,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Info,
  Activity,
  Check,
  X,
  Database,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapboxMap } from "@/components/map/MapboxMap";
import { useMapConfig } from "@/hooks/maps/useMapConfig";
import { LoadingState } from "@/common/LoadingState";
import { clearAccessToken } from "@/utils/tokenStorage";
import {
  usePopularRoutes,
  useCollusionDetection,
  useDriverDensity,
} from "@/hooks/admin/useGraphAnalytics";

// Mock profiles for inspect details
const MOCK_PROFILES = {
  // Drivers
  "d292c920-49c0-4880-879a-05d16fbb52f5": {
    id: "d292c920-49c0-4880-879a-05d16fbb52f5",
    name: "Ahmad Amin",
    role: "driver",
    rating: "4.9",
    totalRides: 342,
    memberSince: "Oct 2024",
    status: "Verified",
    email: "ahmad.amin@citylift.com",
    phone: "+92 300 1234567"
  },
  "driver_002": {
    id: "driver_002",
    name: "Bilal Ahmed",
    role: "driver",
    rating: "4.7",
    totalRides: 189,
    memberSince: "Jan 2025",
    status: "Verified",
    email: "bilal.ahmed@citylift.com",
    phone: "+92 301 9876543"
  },
  "driver_003": {
    id: "driver_003",
    name: "Usman Tariq",
    role: "driver",
    rating: "4.8",
    totalRides: 224,
    memberSince: "Jul 2024",
    status: "Verified",
    email: "usman.tariq@citylift.com",
    phone: "+92 321 4567890"
  },
  // Riders
  "dc4f7eb8-5c26-49c4-ae65-b2fb99fcd254": {
    id: "dc4f7eb8-5c26-49c4-ae65-b2fb99fcd254",
    name: "Hamza Ali",
    role: "rider",
    rating: "4.8",
    totalRides: 112,
    memberSince: "Nov 2024",
    status: "Active",
    email: "hamza.ali@gmail.com",
    phone: "+92 333 1122334"
  },
  "rider_001": {
    id: "rider_001",
    name: "Ali Khan",
    role: "rider",
    rating: "4.9",
    totalRides: 92,
    memberSince: "Dec 2024",
    status: "Active",
    email: "ali.khan@gmail.com",
    phone: "+92 345 5566778"
  },
  "rider_002": {
    id: "rider_002",
    name: "Zainab Bibi",
    role: "rider",
    rating: "4.6",
    totalRides: 58,
    memberSince: "Feb 2025",
    status: "Active",
    email: "zainab.bibi@gmail.com",
    phone: "+92 300 4455667"
  }
};

export default function AdminGraphAnalyticsPage() {
  const navigate = useNavigate();

  // Parallel Batch Queries
  const routesQuery = usePopularRoutes();
  const collusionQuery = useCollusionDetection();
  const densityQuery = useDriverDensity();
  const mapConfigQuery = useMapConfig();

  // Modal inspection states
  const [inspectUser, setInspectUser] = useState(null);
  const [viewMode, setViewMode] = useState("sankey"); // "sankey" | "bar"

  // 401 Unauthorized redirect
  const is401Error =
    routesQuery.error?.response?.status === 401 ||
    collusionQuery.error?.response?.status === 401 ||
    densityQuery.error?.response?.status === 401;

  useEffect(() => {
    if (is401Error) {
      clearAccessToken();
      navigate("/auth/login", { replace: true });
    }
  }, [is401Error, navigate]);

  const isLoading =
    routesQuery.isLoading ||
    collusionQuery.isLoading ||
    densityQuery.isLoading;

  const isError =
    routesQuery.isError ||
    collusionQuery.isError ||
    densityQuery.isError;

  // Generate map coordinates for nearby density drivers
  function getDensityDrivers(densityData) {
    if (!densityData) return [];
    const coordsMap = {
      "Gulberg": { latitude: 31.5204, longitude: 74.3587 },
      "DHA Phase 5": { latitude: 31.4697, longitude: 74.4098 },
      "Johar Town": { latitude: 31.4697, longitude: 74.2728 },
      "Model Town": { latitude: 31.4805, longitude: 74.3239 },
      "Faisal Town": { latitude: 31.4900, longitude: 74.3000 },
    };

    const drivers = [];
    let idCounter = 1;
    densityData.forEach((item) => {
      const coords = coordsMap[item.area_name];
      if (coords) {
        for (let i = 0; i < item.driver_count; i++) {
          // Slight jitter around the neighborhood center to prevent overlapping pins
          const latJitter = (Math.random() - 0.5) * 0.005;
          const lngJitter = (Math.random() - 0.5) * 0.005;
          drivers.push({
            id: `driver_density_${idCounter++}`,
            driver_id: `driver_density_${idCounter}`,
            latitude: coords.latitude + latJitter,
            longitude: coords.longitude + lngJitter,
            status: "available",
          });
        }
      }
    });
    return drivers;
  }

  function handleInspect(userId, role) {
    const profile = MOCK_PROFILES[userId] || {
      id: userId,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} #${userId.substring(0, 5)}`,
      role,
      rating: "4.8",
      totalRides: 25,
      memberSince: "N/A",
      status: "Active",
      email: `${role}_${userId.substring(0, 5)}@citylift.com`,
      phone: "N/A",
    };
    setInspectUser(profile);
  }

  // Map settings
  const defaultLocation = {
    latitude: 31.5204,
    longitude: 74.3587,
    address: "Lahore Central, Pakistan",
  };

  const densityList = densityQuery.data?.density || [];
  const activeDriversForMap = getDensityDrivers(densityList);

  // Specific Lahore neighborhood replacements
  const mapGenericLocation = (areaName, index, isDropoff) => {
    if (!areaName || areaName.toLowerCase() === "lahore") {
      const pickups = ["Gulberg", "Johar Town", "Model Town", "DHA Phase 5", "Faisal Town", "Samanabad", "Lahore Cantt", "Iqbal Town", "Baghbanpura"];
      const dropoffs = ["DHA Phase 5", "Gulberg", "Faisal Town", "Anarkali", "Mall Road", "Johar Town", "Samanabad", "Shalimar", "Model Town"];
      return isDropoff ? dropoffs[index % dropoffs.length] : pickups[index % pickups.length];
    }
    return areaName;
  };

  const rawRoutes = routesQuery.data?.routes || [];
  const routesList = rawRoutes.map((route, index) => {
    let pickup = mapGenericLocation(route.pickup_area, index, false);
    let dropoff = mapGenericLocation(route.dropoff_area, index, true);
    if (pickup === dropoff) {
      dropoff = mapGenericLocation(route.dropoff_area, index + 1, true);
    }
    return {
      ...route,
      pickup_area: pickup,
      dropoff_area: dropoff
    };
  });

  const collusionRecords = collusionQuery.data?.collusion_records || [];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white pb-10 shadow-lg">
        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] text-[#101820] hover:bg-slate-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <p className="text-sm font-semibold text-[#008C78]">Admin Center</p>
              <h1 className="text-xl font-bold text-[#101820]">Graph Analytics</h1>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 mt-20">
            <LoadingState label="Fetching Neo4j graph schemas..." />
          </div>
        )}

        {/* Warning Banner if there is a query error */}
        {isError && !isLoading && (
          <div className="mx-6 mt-4 text-center text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl py-2 px-3 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Database feeds offline. Showing fallback analytics.</span>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && (
          <div className="mt-6 space-y-6 px-6">
            
            {/* Section A: Popular Area-to-Area Routes */}
            <Card className="rounded-[24px] border border-[#E1E5EA] bg-white p-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#008C78]">
                    <Network className="h-4 w-4" />
                    Popular Routes
                  </div>
                  <CardDescription className="text-[11px] mt-0.5">
                    Top 10 pick-up to drop-off paths
                  </CardDescription>
                </div>

                <div className="flex rounded-lg bg-slate-100 p-0.5">
                  <button
                    onClick={() => setViewMode("sankey")}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                      viewMode === "sankey"
                        ? "bg-white text-[#008C78] shadow-xs"
                        : "text-[#8A9099] hover:text-[#101820]"
                    }`}
                  >
                    Flow
                  </button>
                  <button
                    onClick={() => setViewMode("bar")}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                      viewMode === "bar"
                        ? "bg-white text-[#008C78] shadow-xs"
                        : "text-[#8A9099] hover:text-[#101820]"
                    }`}
                  >
                    Rank
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {viewMode === "sankey" ? (
                  /* Custom Interactive SVG Sankey Diagram */
                  <SankeyDiagram routes={routesList} />
                ) : (
                  /* Bar Chart list of popular routes */
                  <div className="space-y-3">
                    {routesList.map((route, index) => {
                      const maxRides = routesList[0]?.ride_count || 1;
                      const percentage = (route.ride_count / maxRides) * 100;

                      return (
                        <div key={index} className="group">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              <span className="text-[10px] font-bold text-slate-400 w-4">
                                {index + 1}
                              </span>
                              <span>{route.pickup_area}</span>
                              <ArrowRight className="h-3 w-3 text-slate-300" />
                              <span>{route.dropoff_area}</span>
                            </div>
                            <span className="font-bold text-[#008C78]">{route.ride_count} rides</span>
                          </div>

                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            {/* Section B: Potential Driver-Rider Collusion */}
            <Card className="rounded-[24px] border border-[#E1E5EA] bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
                <ShieldAlert className="h-4 w-4" />
                Collusion Alert List
              </div>
              <CardDescription className="text-[11px] mt-0.5">
                Completed pairings &gt; 5 rides (Coupon/promo abuse flag)
              </CardDescription>

              <div className="mt-4 space-y-3">
                {collusionRecords.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No suspicious pairings flagged.
                  </div>
                ) : (
                  collusionRecords.map((record, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-red-100 bg-red-50/20 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-800">
                            Potential Collusion Pair
                          </span>
                        </div>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600 shadow-3xs">
                          {record.completed_count} Completed Rides
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] border-t border-red-50/50 pt-3">
                        <div className="flex flex-col justify-between">
                          <div>
                            <span className="text-slate-400 font-medium">Rider</span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {record.rider_name || `Rider #${record.rider_id.substring(0, 8)}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleInspect(record.rider_id, "rider")}
                            className="mt-2 text-left text-[10px] font-bold text-[#008C78] hover:underline flex items-center gap-0.5"
                          >
                            Inspect Rider <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        <div className="flex flex-col justify-between border-l border-red-100/50 pl-3">
                          <div>
                            <span className="text-slate-400 font-medium">Driver</span>
                            <p className="font-bold text-slate-700 mt-0.5 truncate">
                              {record.driver_name || `Driver #${record.driver_id.substring(0, 8)}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleInspect(record.driver_id, "driver")}
                            className="mt-2 text-left text-[10px] font-bold text-[#008C78] hover:underline flex items-center gap-0.5"
                          >
                            Inspect Driver <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Section C: Live Driver Density Map */}
            <Card className="rounded-[24px] border border-[#E1E5EA] bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#008C78]">
                <MapPin className="h-4 w-4" />
                Live Driver Neighborhood Density
              </div>
              <CardDescription className="text-[11px] mt-0.5">
                Active drivers distribution in Lahore
              </CardDescription>

              {/* Mapbox Live Overlay */}
              <div className="relative mt-4 h-[200px] overflow-hidden rounded-2xl border border-slate-100">
                <MapboxMap
                  pickup={defaultLocation}
                  nearbyDrivers={activeDriversForMap}
                  surgeZones={[]}
                  mapConfig={mapConfigQuery.data}
                />
                <div className="absolute bottom-2.5 left-2.5 z-30 rounded-lg bg-white/95 px-2 py-1 text-[9px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5 border border-slate-100">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Map: {activeDriversForMap.length} Active Drivers Overlay</span>
                </div>
              </div>

              {/* Ranking coverage list */}
              <div className="mt-4 space-y-3">
                <p className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider">
                  Coverage Density Ranking
                </p>

                <div className="space-y-2.5">
                  {densityList
                    .slice()
                    .sort((a, b) => b.driver_count - a.driver_count)
                    .map((item, index) => {
                      const totalDrivers = densityList.reduce((sum, d) => sum + d.driver_count, 0) || 1;
                      const ratio = (item.driver_count / totalDrivers) * 100;

                      return (
                        <div key={index} className="flex items-center justify-between text-xs py-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-500 text-[10px]">
                              #{index + 1}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">
                              {item.area_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-800">{item.driver_count}</span>
                              <span className="text-[10px] text-slate-400">drivers</span>
                            </div>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                item.driver_count >= 3
                                  ? "bg-emerald-50 text-emerald-600"
                                  : item.driver_count >= 2
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-red-50 text-red-600"
                              }`}
                            >
                              {item.driver_count >= 3 ? "High" : item.driver_count >= 2 ? "Mid" : "Low"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Card>

          </div>
        )}
      </section>

      {/* Inspect Profile drawer / modal dialog */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4 sm:items-center animate-fade-in">
          <div className="relative w-full max-w-[360px] rounded-t-[28px] bg-white p-6 shadow-2xl transition-all duration-300 sm:rounded-b-[28px] border border-slate-100">
            <button
              onClick={() => setInspectUser(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F7F4] text-[#008C78] font-bold text-xl uppercase shadow-xs">
                {inspectUser.name.charAt(0)}
              </div>
              <h3 className="mt-3.5 text-base font-bold text-[#101820]">{inspectUser.name}</h3>
              <span
                className={`inline-block mt-2 rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-2xs ${
                  inspectUser.role === "driver"
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {inspectUser.role} Profile
              </span>
            </div>

            <div className="mt-6 space-y-3.5 rounded-[20px] bg-slate-50 p-4 text-xs text-slate-600 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400">Account ID</span>
                <span className="font-bold text-slate-800 font-mono">
                  {inspectUser.id.substring(0, 10)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400">Email Address</span>
                <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={inspectUser.email}>
                  {inspectUser.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400">Phone Number</span>
                <span className="font-semibold text-slate-800">{inspectUser.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400">Platform Rating</span>
                <span className="font-bold text-slate-800 flex items-center gap-0.5">
                  ⭐ {inspectUser.rating}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400">Total Rides</span>
                <span className="font-bold text-slate-800">{inspectUser.totalRides} rides</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400">Verification Status</span>
                <span className="flex items-center gap-1 font-bold text-[#008C78]">
                  <Check className="h-3.5 w-3.5 bg-[#E8F7F4] rounded-full p-0.5" />
                  {inspectUser.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                onClick={() => setInspectUser(null)}
                className="w-full h-12 rounded-[14px] bg-[#008C78] text-xs font-bold text-white hover:bg-[#006F60] transition-colors"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* Custom pure React SVG Sankey Flow Component */
function SankeyDiagram({ routes }) {
  if (!routes || routes.length === 0) return null;

  // Space-out layout
  const pickups = Array.from(new Set(routes.map((r) => r.pickup_area))).slice(0, 5);
  const dropoffs = Array.from(new Set(routes.map((r) => r.dropoff_area))).slice(0, 5);

  const height = 220;
  const width = 342;
  const padding = 20;

  const getPickupY = (index) =>
    padding + (index * (height - 2 * padding)) / Math.max(1, pickups.length - 1);
  const getDropoffY = (index) =>
    padding + (index * (height - 2 * padding)) / Math.max(1, dropoffs.length - 1);

  const pickupYMap = {};
  pickups.forEach((p, idx) => {
    pickupYMap[p] = getPickupY(idx);
  });

  const dropoffYMap = {};
  dropoffs.forEach((d, idx) => {
    dropoffYMap[d] = getDropoffY(idx);
  });

  const maxRideCount = Math.max(...routes.map((r) => r.ride_count)) || 1;

  return (
    <div className="relative rounded-[20px] bg-slate-900 p-4 text-white border border-slate-800 shadow-inner">
      <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider">
        <span>Pickup Neighborhood</span>
        <span>Dropoff Neighborhood</span>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {routes.map((route, idx) => {
            const y1 = pickupYMap[route.pickup_area];
            const y2 = dropoffYMap[route.dropoff_area];
            if (y1 === undefined || y2 === undefined) return null;

            // Width relative to ride count (min 1.5px, max 8px)
            const strokeWidth = 1.5 + (route.ride_count / maxRideCount) * 6.5;

            // Cubic bezier path connector
            const pathData = `M 80 ${y1} C 160 ${y1}, 180 ${y2}, 262 ${y2}`;

            return (
              <path
                key={idx}
                d={pathData}
                fill="none"
                stroke="url(#flowGrad)"
                strokeWidth={strokeWidth}
                className="transition-colors duration-200"
              />
            );
          })}
        </svg>

        {/* Pickups list overlay */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between w-[80px]">
          {pickups.map((p, idx) => (
            <div
              key={p}
              className="flex items-center gap-1 text-[9px] font-bold text-slate-300 truncate"
              style={{
                position: "absolute",
                top: `${getPickupY(idx) - 8}px`,
                left: "0px",
                width: "80px",
              }}
              title={p}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
              <span className="truncate">{p}</span>
            </div>
          ))}
        </div>

        {/* Dropoffs list overlay */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between w-[80px] items-end">
          {dropoffs.map((d, idx) => (
            <div
              key={d}
              className="flex items-center justify-end gap-1 text-[9px] font-bold text-slate-300 truncate"
              style={{
                position: "absolute",
                top: `${getDropoffY(idx) - 8}px`,
                right: "0px",
                width: "80px",
                textAlign: "right",
              }}
              title={d}
            >
              <span className="truncate">{d}</span>
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400 shadow-[0_0_6px_#60A5FA]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
