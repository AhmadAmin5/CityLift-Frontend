import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  ReceiptText,
  Route,
  Search,
  Star,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const demoRides = [
  {
    id: "ride_001",
    status: "completed",
    date: "Today",
    time: "4:42 PM",
    driver_name: "Ahmed Raza",
    driver_rating: 4.8,
    vehicle: "White Toyota Corolla",
    pickup: "Gulberg, Lahore",
    dropoff: "Johar Town, Lahore",
    fare: {
      currency: "PKR",
      final_fare: 760,
    },
    distance_km: 12.8,
    duration_min: 35,
  },
  {
    id: "ride_002",
    status: "completed",
    date: "Yesterday",
    time: "8:20 PM",
    driver_name: "Usman Ali",
    driver_rating: 4.7,
    vehicle: "Silver Honda City",
    pickup: "DHA Phase 5, Lahore",
    dropoff: "MM Alam Road, Lahore",
    fare: {
      currency: "PKR",
      final_fare: 540,
    },
    distance_km: 8.6,
    duration_min: 24,
  },
  {
    id: "ride_003",
    status: "cancelled",
    date: "May 24",
    time: "10:15 AM",
    driver_name: null,
    driver_rating: null,
    vehicle: null,
    pickup: "Model Town, Lahore",
    dropoff: "Liberty Market, Lahore",
    fare: {
      currency: "PKR",
      final_fare: 0,
    },
    distance_km: 6.2,
    duration_min: 18,
  },
  {
    id: "ride_004",
    status: "completed",
    date: "May 22",
    time: "6:05 PM",
    driver_name: "Bilal Khan",
    driver_rating: 4.9,
    vehicle: "Black Suzuki Alto",
    pickup: "Emporium Mall, Lahore",
    dropoff: "Wapda Town, Lahore",
    fare: {
      currency: "PKR",
      final_fare: 430,
    },
    distance_km: 5.9,
    duration_min: 20,
  },
];

function getStatusConfig(status) {
  if (status === "completed") {
    return {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-red-50 text-[#DC2626] hover:bg-red-50",
    };
  }

  return {
    label: "Active",
    icon: Car,
    className: "bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFF7ED]",
  };
}

function RideHistoryCard({ ride, onViewDetails }) {
  const statusConfig = getStatusConfig(ride.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[#7A8088]" />
            <p className="text-sm font-semibold text-[#4B5563]">
              {ride.date} · {ride.time}
            </p>
          </div>

          <p className="mt-2 text-lg font-bold tracking-[-0.02em] text-[#101820]">
            {ride.pickup.split(",")[0]} → {ride.dropoff.split(",")[0]}
          </p>
        </div>

        <Badge className={`shrink-0 rounded-full px-3 py-1.5 ${statusConfig.className}`}>
          <StatusIcon className="mr-1 h-3.5 w-3.5" />
          {statusConfig.label}
        </Badge>
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

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
          <p className="truncate text-sm font-semibold text-[#101820]">
            {ride.pickup}
          </p>

          <Separator className="my-3 bg-[#E1E5EA]" />

          <p className="truncate text-sm font-semibold text-[#101820]">
            {ride.dropoff}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <ReceiptText className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.fare.currency} {ride.fare.final_fare}
          </p>
          <p className="text-xs text-[#8A9099]">Fare</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Route className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.distance_km} km
          </p>
          <p className="text-xs text-[#8A9099]">Distance</p>
        </div>

        <div className="rounded-[16px] bg-[#F7F8FA] p-3">
          <Clock className="h-4 w-4 text-[#008C78]" />
          <p className="mt-2 text-sm font-bold text-[#101820]">
            {ride.duration_min} min
          </p>
          <p className="text-xs text-[#8A9099]">Time</p>
        </div>
      </div>

      {ride.driver_name ? (
        <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-[#F7F8FA] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Car className="h-5 w-5 text-[#008C78]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#101820]">
              {ride.driver_name}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#4B5563]">
              {ride.vehicle}
            </p>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-bold text-[#101820]">
              {ride.driver_rating}
            </span>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        onClick={() => onViewDetails(ride)}
        className="mt-4 h-[48px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
      >
        View details
      </Button>
    </Card>
  );
}

function RideHistoryStats({ rides }) {
  const completedCount = rides.filter((ride) => ride.status === "completed").length;
  const totalSpent = rides.reduce(
    (sum, ride) => sum + Number(ride.fare.final_fare || 0),
    0
  );
  const totalDistance = rides.reduce(
    (sum, ride) => sum + Number(ride.distance_km || 0),
    0
  );

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            Ride summary
          </Badge>

          <h1 className="mt-4 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
            Your rides
          </h1>

          <p className="mt-2 text-sm leading-5 text-[#4B5563]">
            Review completed, cancelled, and active rides.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-soft">
          <Car className="h-7 w-7 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <p className="text-lg font-bold text-[#101820]">{completedCount}</p>
          <p className="mt-0.5 text-xs text-[#8A9099]">Completed</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <p className="text-lg font-bold text-[#101820]">PKR {totalSpent}</p>
          <p className="mt-0.5 text-xs text-[#8A9099]">Spent</p>
        </div>

        <div className="rounded-[18px] bg-white p-3 shadow-soft">
          <p className="text-lg font-bold text-[#101820]">
            {totalDistance.toFixed(1)}
          </p>
          <p className="mt-0.5 text-xs text-[#8A9099]">Km</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyRideHistory() {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E8F7F4]">
        <Car className="h-8 w-8 text-[#008C78]" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#101820]">No rides found</h2>

      <p className="mt-2 text-sm leading-5 text-[#4B5563]">
        Try changing the filter or search term.
      </p>
    </Card>
  );
}

export default function RiderRideHistoryPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");

  const filteredRides = useMemo(() => {
    return demoRides.filter((ride) => {
      const matchesTab = activeTab === "all" || ride.status === activeTab;

      const searchableText = [
        ride.pickup,
        ride.dropoff,
        ride.driver_name,
        ride.vehicle,
        ride.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText.trim() ||
        searchableText.includes(searchText.trim().toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchText]);

  function handleViewDetails(ride) {
    navigate(`/rider/rides/${ride.id}`);
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/rider/home")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] bg-white text-[#101820]"
            aria-label="Back home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Ride history</h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
            <Car className="h-5 w-5 text-[#008C78]" />
          </div>
        </header>

        <div className="mt-8 space-y-4">
          <RideHistoryStats rides={demoRides} />

          <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
            <Search className="h-5 w-5 text-[#7A8088]" />

            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search rides, places, drivers"
              className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-12 w-full grid-cols-3 rounded-[16px] bg-[#F7F8FA] p-1">
              <TabsTrigger
                value="all"
                className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                All
              </TabsTrigger>

              <TabsTrigger
                value="completed"
                className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Completed
              </TabsTrigger>

              <TabsTrigger
                value="cancelled"
                className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredRides.length ? (
              filteredRides.map((ride) => (
                <RideHistoryCard
                  key={ride.id}
                  ride={ride}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <EmptyRideHistory />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}