import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Route, Sparkles, TrafficCone } from "lucide-react";

export function FareEstimateCard({ estimate, routePreview }) {
  const fare = estimate?.fare_estimate || estimate;
  const route = routePreview?.route || estimate?.route;

  if (!fare) return null;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4B5563]">Estimated fare</p>
          <h3 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
            {fare.currency || "PKR"} {fare.estimated_min_fare} -{" "}
            {fare.estimated_max_fare}
          </h3>
        </div>

        {Number(fare.surge_multiplier || 1) > 1 ? (
          <Badge className="rounded-full bg-[#FFF7ED] px-3 py-1 text-[#C2410C] hover:bg-[#FFF7ED]">
            {fare.surge_multiplier}x surge
          </Badge>
        ) : (
          <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1 text-[#008C78] hover:bg-[#E8F7F4]">
            Normal
          </Badge>
        )}
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {fare.estimated_distance_km || route?.distance_km || "--"} km
          </p>
          <p className="text-xs text-[#8A9099]">Distance</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {fare.estimated_duration_min ||
              route?.traffic_duration_min ||
              route?.normal_duration_min ||
              "--"}{" "}
            min
          </p>
          <p className="text-xs text-[#8A9099]">ETA</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <TrafficCone className="h-4 w-4 text-[#F59E0B]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {fare.estimated_traffic_delay_min || route?.traffic_delay_min || 0}m
          </p>
          <p className="text-xs text-[#8A9099]">Traffic</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Sparkles className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {fare.pre_ride_ml_predicted_fare || "--"}
          </p>
          <p className="text-xs text-[#8A9099]">ML</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#8A9099]">
        Final fare is calculated by backend after ride completion. This estimate
        is for confirmation only.
      </p>
    </Card>
  );
}