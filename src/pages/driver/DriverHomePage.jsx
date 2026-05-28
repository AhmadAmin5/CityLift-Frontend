import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Car,
  CheckCircle2,
  Clock,
  FileCheck2,
  Flame,
  Gauge,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Route,
  ShieldCheck,
  Star,
  Icon,
  Wallet,
  X,
} from "lucide-react";
import { steeringWheel } from "@lucide/lab";
import { useQueryClient } from "@tanstack/react-query";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MapboxMap } from "@/components/map/MapboxMap";
import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { getApiErrorMessage } from "@/api/client";
import {
  useAcceptRideOffer,
  useDeclineRideOffer,
  useDriverAvailability,
  useDriverLocation,
} from "@/hooks/driver/useDriverActions";
import { useDriverOffers } from "@/hooks/driver/useDriverOffers";
import { useDriverProfile } from "@/hooks/driver/useDriverProfile";
import { useMapConfig } from "@/hooks/maps/useMapConfig";
import { useSurgeZones } from "@/hooks/maps/useSurgeZones";
import { useRideSocket } from "@/hooks/socket/useRideSocket";
import { queryKeys } from "@/query/queryKeys";
import { clearAccessToken } from "@/utils/tokenStorage";
import { getDriverFromResponse } from "@/utils/apiShapes";

const demoDriver = {
  name: "Ahmed Raza",
  initials: "AR",
  approval_status: "approved",
  average_rating: 4.8,
  total_rides: 215,
  is_available: false,
  active_vehicle: {
    id: "vehicle_001",
    make: "Toyota",
    model: "Corolla",
    color: "White",
    plate_number: "LEA-1234",
    vehicle_type: "car",
    verification_status: "approved",
    is_active: true,
  },
  documents: {
    cnic: "approved",
    license: "approved",
    vehicle_registration: "approved",
  },
};

const demoStats = {
  today_earnings: 5300,
  today_rides: 5,
  online_hours: 6.5,
  acceptance_rate: 92,
};

const demoSurgeZones = [
  {
    id: "zone_1",
    area_name: "Gulberg",
    surge_multiplier: 1.5,
    demand_count: 25,
    available_drivers: 8,
    left: "20%",
    top: "32%",
    size: 150,
  },
  {
    id: "zone_2",
    area_name: "Johar Town",
    surge_multiplier: 1.2,
    demand_count: 18,
    available_drivers: 10,
    left: "56%",
    top: "50%",
    size: 120,
  },
];

const demoOffer = {
  id: "offer_001",
  ride_id: "ride_123",
  expires_in_seconds: 45,
  distance_to_pickup_km: 1.4,
  rider: {
    name: "Ali Khan",
    initials: "AK",
    rating: 5.0,
  },
  pickup: {
    address: "Gulberg, Lahore",
  },
  dropoff: {
    address: "Johar Town, Lahore",
  },
  estimated_fare: {
    currency: "PKR",
    estimated_min_fare: 630,
    estimated_max_fare: 770,
  },
  estimated_distance_km: 12.4,
  estimated_duration_min: 33,
  rider_note_to_driver: "Call me when arrived",
};

function getInitials(name = "Driver") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function toDriverHomeView(driverData) {
  const driver = getDriverFromResponse(driverData) || demoDriver;
  const user = driver.user || {};
  const name = user.name || driver.name || demoDriver.name;

  return {
    ...demoDriver,
    ...driver,
    name,
    initials: getInitials(name),
    active_vehicle: driver.active_vehicle || demoDriver.active_vehicle,
    documents: demoDriver.documents,
  };
}

function toDemandZones(zones = []) {
  return zones.map((zone, index) => ({
    ...zone,
    left: index % 2 === 0 ? "20%" : "56%",
    top: index % 2 === 0 ? "32%" : "50%",
    size: 120 + Number(zone.surge_multiplier || 1) * 20,
  }));
}

function toOfferView(offer) {
  if (!offer) return null;
  return {
    ...demoOffer,
    ...offer,
    ride_id: offer.ride_id || offer.ride?.id,
    rider: {
      name: "Ali Khan",
      initials: "AK",
      rating: offer.ride?.rider_rating || 5.0,
    },
    pickup: offer.ride?.pickup || offer.pickup || demoOffer.pickup,
    dropoff: offer.ride?.dropoff || offer.dropoff || demoOffer.dropoff,
    estimated_fare:
      offer.ride?.estimated_fare ||
      offer.estimated_fare ||
      demoOffer.estimated_fare,
    estimated_distance_km:
      offer.ride?.fare?.estimated_distance_km || demoOffer.estimated_distance_km,
    estimated_duration_min:
      offer.ride?.fare?.estimated_duration_min || demoOffer.estimated_duration_min,
    rider_note_to_driver:
      offer.ride?.rider_note_to_driver ||
      offer.rider_note_to_driver ||
      demoOffer.rider_note_to_driver,
  };
}

function DriverMapMock({ isOnline, surgeZones }) {
  return (
    <div className="relative h-full min-h-[410px] overflow-hidden rounded-b-[32px] bg-[#EAF2F0]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-20%] top-12 h-28 w-[140%] rotate-[-12deg] rounded-full border-[18px] border-white/80" />
        <div className="absolute left-[-10%] top-44 h-24 w-[120%] rotate-[18deg] rounded-full border-[14px] border-white/70" />
        <div className="absolute bottom-16 left-[-15%] h-24 w-[130%] rotate-[-5deg] rounded-full border-[12px] border-white/70" />
      </div>

      {surgeZones.map((zone) => (
        <div
          key={zone.id}
          className="absolute rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/15"
          style={{
            width: zone.size,
            height: zone.size,
            left: zone.left,
            top: zone.top,
          }}
        >
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#101820] shadow-soft">
            <Flame className="h-3 w-3 text-[#F59E0B]" />
            {zone.surge_multiplier}x
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-[48%] z-30 -translate-x-1/2 -translate-y-1/2">
        {isOnline ? (
          <div className="absolute inset-0 h-20 w-20 animate-ping rounded-full bg-[#008C78]/20" />
        ) : null}

        <div
          className={
            isOnline
              ? "relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#008C78] text-white shadow-card"
              : "relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#8A9099] text-white shadow-card"
          }
        >
          <Car className="h-8 w-8" />
        </div>
      </div>

      <div className="absolute left-5 top-6 z-30">
        <Badge
          className={
            isOnline
              ? "rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white"
              : "rounded-full bg-white px-3 py-1.5 text-[#4B5563] shadow-soft hover:bg-white"
          }
        >
          <Gauge className="mr-1 h-3.5 w-3.5" />
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="absolute bottom-8 left-6 right-6 z-30 rounded-[22px] border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#101820]">
              {isOnline ? "Ready for ride offers" : "You are currently offline"}
            </p>
            <p className="mt-1 truncate text-xs text-[#4B5563]">
              {isOnline
                ? "Demand is active near Gulberg and Johar Town"
                : "Go online to receive nearby ride requests"}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F7F4]">
            <Navigation className="h-5 w-5 text-[#008C78]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadinessCard({ driver }) {
  const checks = [
    {
      label: "Approval",
      value: driver.approval_status,
      passed: driver.approval_status === "approved",
    },
    {
      label: "Vehicle",
      value: driver.active_vehicle ? "active" : "missing",
      passed:
        Boolean(driver.active_vehicle) &&
        driver.active_vehicle.verification_status === "approved",
    },
    {
      label: "Documents",
      value: "approved",
      passed: Object.values(driver.documents).every(
        (status) => status === "approved"
      ),
    },
  ];

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Driver readiness</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Required before going online.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <ShieldCheck className="h-5 w-5 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-3 rounded-[16px] bg-[#F7F8FA] p-3"
          >
            <div
              className={
                check.passed
                  ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F7F4]"
                  : "flex h-8 w-8 items-center justify-center rounded-full bg-red-50"
              }
            >
              {check.passed ? (
                <CheckCircle2 className="h-4 w-4 text-[#008C78]" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#101820]">{check.label}</p>
              <p className="mt-0.5 text-xs capitalize text-[#4B5563]">
                {check.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DriverStatusCard({
  driver,
  isOnline,
  canGoOnline,
  hasOffer,
  isUpdatingAvailability,
  onToggleOnline,
  onShowOffer,
}) {
  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border border-[#E1E5EA]">
          <AvatarFallback className="bg-[#E8F7F4] text-base font-bold text-[#008C78]">
            {driver.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-[#101820]">
            {driver.name}
          </p>

          <div className="mt-1 flex items-center gap-2 text-sm text-[#4B5563]">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-[#101820]">
              {driver.average_rating}
            </span>
            <span>·</span>
            <span>{driver.total_rides} rides</span>
          </div>
        </div>

        <Badge
          className={
            isOnline
              ? "rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]"
              : "rounded-full bg-[#F7F8FA] px-3 py-1.5 text-[#4B5563] hover:bg-[#F7F8FA]"
          }
        >
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="flex items-center justify-between gap-4 rounded-[20px] bg-[#F7F8FA] p-4">
        <div>
          <p className="text-base font-bold text-[#101820]">
            Availability
          </p>
          <p className="mt-1 text-sm leading-5 text-[#4B5563]">
            {canGoOnline
              ? "Turn on to receive incoming ride offers."
              : "Complete approval, documents, and vehicle setup first."}
          </p>
        </div>

        <Switch
          checked={isOnline}
          disabled={!canGoOnline}
          onCheckedChange={onToggleOnline}
        />
      </div>

      <Button
        type="button"
        disabled={!canGoOnline || isUpdatingAvailability}
        onClick={() => onToggleOnline(!isOnline)}
        className={
          isOnline
            ? "mt-4 h-14 w-full rounded-[14px] bg-[#101820] text-base font-semibold text-white hover:bg-[#1F2937]"
            : "mt-4 h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
        }
      >
        <Gauge className="mr-2 h-5 w-5" />
        {isUpdatingAvailability
          ? "Updating availability..."
          : isOnline
            ? "Go offline"
            : "Go online"}
      </Button>

      {isOnline ? (
        <Button
          type="button"
          onClick={onShowOffer}
          disabled={!hasOffer}
          className="mt-4 h-12 w-full rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
        >
          <Bell className="mr-2 h-4 w-4" />
          {hasOffer ? "Review incoming offer" : "Waiting for offers"}
        </Button>
      ) : null}
    </Card>
  );
}

function PendingRideOfferCard({
  offer,
  isLoading,
  isOnline,
  onReview,
  onAccept,
  onDecline,
}) {
  if (isLoading) {
    return (
      <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
            <Bell className="h-5 w-5 text-[#008C78]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101820]">
              Loading ride requests
            </h2>
            <p className="mt-1 text-sm text-[#4B5563]">
              Checking pending offers from the mock API.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!offer) {
    return (
      <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F8FA]">
            <Bell className="h-5 w-5 text-[#7A8088]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[#101820]">
              Ride requests
            </h2>
            <p className="mt-1 text-sm text-[#4B5563]">
              {isOnline
                ? "No pending requests yet."
                : "Go online to receive pending requests."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border-[#008C78]/25 bg-[#F1FBF9] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            Pending request
          </Badge>
          <h2 className="mt-3 text-lg font-bold text-[#101820]">
            Ride request available
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            {offer.distance_to_pickup_km} km to pickup
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
          <Bell className="h-6 w-6 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-4 rounded-[18px] bg-white p-3">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F7F4]">
              <MapPin className="h-4 w-4 text-[#008C78]" />
            </div>
            <div className="h-8 w-px bg-[#D7DCE2]" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101820]">
              <Navigation className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#101820]">
              {offer.pickup.address}
            </p>
            <Separator className="my-3 bg-[#E1E5EA]" />
            <p className="truncate text-sm font-bold text-[#101820]">
              {offer.dropoff.address}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-white p-3">
          <Wallet className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {offer.estimated_fare.currency} {offer.estimated_fare.estimated_min_fare}
          </p>
          <p className="text-xs text-[#8A9099]">From</p>
        </div>
        <div className="rounded-[16px] bg-white p-3">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {offer.estimated_distance_km} km
          </p>
          <p className="text-xs text-[#8A9099]">Trip</p>
        </div>
        <div className="rounded-[16px] bg-white p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {offer.estimated_duration_min} min
          </p>
          <p className="text-xs text-[#8A9099]">ETA</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReview}
          className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
        >
          Review
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onDecline}
          className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#DC2626]"
        >
          Decline
        </Button>
        <Button
          type="button"
          onClick={onAccept}
          className="h-12 rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
        >
          Accept
        </Button>
      </div>
    </Card>
  );
}

function ActiveVehicleCard({ vehicle, onNavigate }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#E8F7F4]">
          <Car className="h-6 w-6 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#8A9099]">
            Active vehicle
          </p>
          <p className="mt-1 truncate text-base font-bold text-[#101820]">
            {vehicle.color} {vehicle.make} {vehicle.model}
          </p>
        </div>

        <div className="rounded-[12px] border border-[#E1E5EA] bg-[#F7F8FA] px-3 py-2">
          <p className="text-sm font-bold tracking-wide text-[#101820]">
            {vehicle.plate_number}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onNavigate}
        className="mt-4 h-[48px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
      >
        Manage vehicles
      </Button>
    </Card>
  );
}

function DriverStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <Wallet className="h-5 w-5 text-[#008C78]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          PKR {stats.today_earnings}
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Today earned</p>
      </Card>

      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <Car className="h-5 w-5 text-[#008C78]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          {stats.today_rides}
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Today rides</p>
      </Card>

      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <Clock className="h-5 w-5 text-[#008C78]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          {stats.online_hours}h
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Online time</p>
      </Card>

      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <Gauge className="h-5 w-5 text-[#008C78]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          {stats.acceptance_rate}%
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Acceptance</p>
      </Card>
    </div>
  );
}

function QuickLinks({ onNavigate }) {
  const links = [
    {
      label: "Earnings",
      description: "Daily and weekly income",
      icon: Wallet,
      path: "/driver/earnings",
    },
    {
      label: "Vehicles",
      description: "Manage active vehicle",
      icon: Car,
      path: "/driver/vehicles",
    },
    {
      label: "Documents",
      description: "CNIC, license, registration",
      icon: FileCheck2,
      path: "/driver/documents",
    },
    {
      label: "Ratings",
      description: "Rider feedback",
      icon: Star,
      path: "/driver/ratings",
    },
  ];

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Quick links</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <button
              key={link.path}
              type="button"
              onClick={() => onNavigate(link.path)}
              className="rounded-[18px] border border-[#E1E5EA] bg-white p-3 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1FBF9]">
                <Icon className="h-5 w-5 text-[#008C78]" />
              </div>

              <p className="mt-3 text-sm font-bold text-[#101820]">
                {link.label}
              </p>
              <p className="mt-1 text-xs leading-4 text-[#4B5563]">
                {link.description}
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function DemandZonesCard({ zones }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Demand zones</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Higher activity areas nearby.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF7ED]">
          <Flame className="h-5 w-5 text-[#F59E0B]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="flex items-center gap-3 rounded-[18px] bg-[#F7F8FA] p-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Flame className="h-5 w-5 text-[#F59E0B]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#101820]">
                {zone.area_name}
              </p>
              <p className="mt-0.5 text-xs text-[#4B5563]">
                {zone.demand_count} requests · {zone.available_drivers} drivers
              </p>
            </div>

            <Badge className="rounded-full bg-[#FFF7ED] px-3 py-1.5 text-[#C2410C] hover:bg-[#FFF7ED]">
              {zone.surge_multiplier}x
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function IncomingOfferSheet({ open, offer, onOpenChange, onAccept, onDecline }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
                Incoming ride offer
              </SheetTitle>
              <SheetDescription className="mt-1 text-base leading-6 text-[#4B5563]">
                Review the pickup, destination, and fare before responding.
              </SheetDescription>
            </div>

            <Badge className="rounded-full bg-[#FFF7ED] px-3 py-1.5 text-[#C2410C] hover:bg-[#FFF7ED]">
              {offer.expires_in_seconds}s
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F1FBF9] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-white">
                <AvatarFallback className="bg-white text-sm font-bold text-[#008C78]">
                  {offer.rider.initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[#101820]">
                  {offer.rider.name}
                </p>
                <div className="mt-1 flex items-center gap-1 text-sm text-[#4B5563]">
                  <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-semibold text-[#101820]">
                    {offer.rider.rating}
                  </span>
                  <span>rider rating</span>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white"
              >
                <Phone className="h-5 w-5 text-[#008C78]" />
              </Button>
            </div>
          </Card>

          <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F4]">
                  <MapPin className="h-4 w-4 text-[#008C78]" />
                </div>

                <div className="h-10 w-px bg-[#D7DCE2]" />

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101820]">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div>
                  <p className="text-xs font-medium text-[#8A9099]">Pickup</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#101820]">
                    {offer.pickup.address}
                  </p>
                </div>

                <Separator className="my-3 bg-[#E1E5EA]" />

                <div>
                  <p className="text-xs font-medium text-[#8A9099]">Dropoff</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#101820]">
                    {offer.dropoff.address}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
              <MapPin className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 text-sm font-bold text-[#101820]">
                {offer.distance_to_pickup_km} km
              </p>
              <p className="text-xs text-[#8A9099]">To pickup</p>
            </Card>

            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
              <Route className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 text-sm font-bold text-[#101820]">
                {offer.estimated_distance_km} km
              </p>
              <p className="text-xs text-[#8A9099]">Trip</p>
            </Card>

            <Card className="rounded-[18px] border-[#E1E5EA] bg-white p-3 shadow-sm">
              <Clock className="h-4 w-4 text-[#008C78]" />
              <p className="mt-2 text-sm font-bold text-[#101820]">
                {offer.estimated_duration_min} min
              </p>
              <p className="text-xs text-[#8A9099]">ETA</p>
            </Card>
          </div>

          <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">Estimated fare</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
                  {offer.estimated_fare.currency}{" "}
                  {offer.estimated_fare.estimated_min_fare}-
                  {offer.estimated_fare.estimated_max_fare}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F7F4]">
                <Wallet className="h-6 w-6 text-[#008C78]" />
              </div>
            </div>

            <Separator className="my-4 bg-[#E1E5EA]" />

            <p className="text-sm leading-5 text-[#4B5563]">
              Rider note:{" "}
              <span className="font-semibold text-[#101820]">
                {offer.rider_note_to_driver}
              </span>
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onDecline}
              className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#DC2626]"
            >
              <X className="mr-2 h-5 w-5" />
              Decline
            </Button>

            <Button
              type="button"
              onClick={onAccept}
              className="h-[52px] rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Accept
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function DriverHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [offerOpen, setOfferOpen] = useState(false);
  const [socketOffer, setSocketOffer] = useState(null);
  const [driverLocation, setDriverLocation] = useState({
    latitude: 31.5204,
    longitude: 74.3587,
    address: "Driver location, Gulberg",
    provider: "mapbox",
    provider_place_id: "mock.driver_location",
  });
  const driverQuery = useDriverProfile();
  const offersQuery = useDriverOffers("sent");
  const mapConfigQuery = useMapConfig();
  const surgeZonesQuery = useSurgeZones("Lahore");
  const availabilityMutation = useDriverAvailability();
  const driverLocationMutation = useDriverLocation();
  const acceptOfferMutation = useAcceptRideOffer();
  const declineOfferMutation = useDeclineRideOffer();

  const driver = toDriverHomeView(driverQuery.data);
  const pendingOffer = socketOffer || offersQuery.data?.[0] || null;
  const offer = toOfferView(pendingOffer);
  const surgeZones = toDemandZones(surgeZonesQuery.data || demoSurgeZones);
  const isOnline = Boolean(driver.is_available);

  const canGoOnline = useMemo(() => {
    const approved = driver.approval_status === "approved";
    const hasActiveApprovedVehicle =
      Boolean(driver.active_vehicle) &&
      driver.active_vehicle.verification_status === "approved";
    const docsApproved = Object.values(driver.documents || {}).every(
      (status) => status === "approved"
    );

    return approved && hasActiveApprovedVehicle && docsApproved;
  }, [driver]);

  useRideSocket({
    handlers: {
      onOffer: (nextOffer) => {
        setSocketOffer(nextOffer);
        setOfferOpen(true);
      },
      onOfferExpired: (expiredOffer) => {
        if (!expiredOffer?.id || expiredOffer.id === pendingOffer?.id) {
          setOfferOpen(false);
          setSocketOffer(null);
        }
      },
    },
  });

  async function handleToggleOnline(nextValue) {
    if (!canGoOnline) return;

    try {
      await availabilityMutation.mutateAsync({
        is_available: nextValue,
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        heading: 90,
        speed_kmph: 0,
        current_area: "Gulberg",
      });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  async function handleDriverLocationChange(location) {
    const nextLocation = {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      address: "Selected driver location",
      provider: "mapbox",
      provider_place_id: null,
    };

    setDriverLocation(nextLocation);

    try {
      await driverLocationMutation.mutateAsync({
        latitude: nextLocation.latitude,
        longitude: nextLocation.longitude,
        heading: 90,
        speed_kmph: isOnline ? 20 : 0,
        current_area: "Gulberg",
      });
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  function handleLogout() {
    clearAccessToken();
    queryClient.removeQueries({ queryKey: queryKeys.me });
    queryClient.removeQueries({ queryKey: queryKeys.driverProfile });
    navigate("/auth/login", { replace: true });
  }

  async function handleAcceptOffer() {
    if (!pendingOffer?.id) return;

    try {
      const data = await acceptOfferMutation.mutateAsync(pendingOffer.id);
      const acceptedRide = data?.ride || data;
      const rideId = acceptedRide?.id || pendingOffer.ride_id;
      setOfferOpen(false);
      setSocketOffer(null);
      navigate(`/driver/rides/${rideId}/navigation`);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  async function handleDeclineOffer() {
    if (!pendingOffer?.id) {
      setOfferOpen(false);
      return;
    }

    try {
      await declineOfferMutation.mutateAsync({
        offerId: pendingOffer.id,
        decline_reason: "Not available",
      });
      setSocketOffer(null);
      setOfferOpen(false);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  if (driverQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading driver home..." />
      </main>
    );
  }

  if (driverQuery.isError) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Could not load driver profile." />
      </main>
    );
  }

  function handleShowOffer() {
    if (offer) {
      setOfferOpen(true);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
        <div className="relative h-[47vh] min-h-[410px]">
          <MapboxMap
            pickup={driverLocation}
            nearbyDrivers={
              isOnline
                ? [
                    {
                      driver_id: driver.id,
                      vehicle_id: driver.active_vehicle?.id,
                      latitude: driverLocation.latitude,
                      longitude: driverLocation.longitude,
                      heading: 90,
                    },
                  ]
                : []
            }
            surgeZones={surgeZones}
            mapConfig={mapConfigQuery.data}
            onPickupChange={handleDriverLocationChange}
          />

          <header className="absolute left-0 right-0 top-0 z-40 px-5 pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-[22px] border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#E8F7F4]">
                    <Icon
                                iconNode={steeringWheel}
                                className="h-4 w-4"
                            />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#008C78]">
                      Driver mode
                    </p>
                    <p className="max-w-[170px] truncate text-sm font-bold text-[#101820]">
                      {driver.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-full border-white/70 bg-white/95 text-[#101820] shadow-soft"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleLogout}
                  className="h-11 w-11 rounded-full border-white/70 bg-white/95 text-[#101820] shadow-soft"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
                <Star className="mr-1 h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                {driver.average_rating} rating
              </Badge>

              <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-soft hover:bg-white">
                <BarChart3 className="mr-1 h-3.5 w-3.5 text-[#008C78]" />
                {demoStats.today_rides} rides today
              </Badge>

              <Badge className="rounded-full bg-[#FFF7ED] px-3 py-1.5 text-[#C2410C] shadow-soft hover:bg-[#FFF7ED]">
                <Flame className="mr-1 h-3.5 w-3.5" />
                Demand nearby
              </Badge>
            </div>
          </header>
        </div>

        <div className="-mt-7 relative z-50 rounded-t-[28px] border border-[#E1E5EA] bg-white px-6 pb-8 pt-4 shadow-sheet">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

          <div className="space-y-4">
            <DriverStatusCard
              driver={driver}
              isOnline={isOnline}
              canGoOnline={canGoOnline}
              hasOffer={Boolean(offer)}
              isUpdatingAvailability={availabilityMutation.isPending}
              onToggleOnline={handleToggleOnline}
              onShowOffer={handleShowOffer}
            />

            {!canGoOnline ? <ReadinessCard driver={driver} /> : null}

            <PendingRideOfferCard
              offer={offer}
              isLoading={offersQuery.isLoading}
              isOnline={isOnline}
              onReview={handleShowOffer}
              onAccept={handleAcceptOffer}
              onDecline={handleDeclineOffer}
            />

            <ActiveVehicleCard
              vehicle={driver.active_vehicle}
              onNavigate={() => navigate("/driver/vehicles")}
            />

            <DriverStatsGrid stats={demoStats} />

            <DemandZonesCard zones={surgeZones} />

            <QuickLinks onNavigate={navigate} />
          </div>
        </div>

        <IncomingOfferSheet
          open={offerOpen && Boolean(offer)}
          offer={offer || demoOffer}
          onOpenChange={setOfferOpen}
          onAccept={handleAcceptOffer}
          onDecline={handleDeclineOffer}
        />
      </section>
    </main>
  );
}
