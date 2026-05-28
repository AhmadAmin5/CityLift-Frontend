import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  ReceiptText,
  Route,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const demoEarnings = {
  today: {
    label: "Today",
    total_earnings: 5300,
    gross_fare: 6120,
    platform_fee: 820,
    rides_count: 5,
    online_hours: 6.5,
    average_per_ride: 1060,
    cash_collected: 5300,
    wallet_payout: 0,
    trend_percent: 12,
  },
  week: {
    label: "This week",
    total_earnings: 28650,
    gross_fare: 33400,
    platform_fee: 4750,
    rides_count: 31,
    online_hours: 38,
    average_per_ride: 924,
    cash_collected: 21400,
    wallet_payout: 7250,
    trend_percent: 8,
  },
  month: {
    label: "This month",
    total_earnings: 124800,
    gross_fare: 146300,
    platform_fee: 21500,
    rides_count: 142,
    online_hours: 168,
    average_per_ride: 879,
    cash_collected: 94400,
    wallet_payout: 30400,
    trend_percent: -3,
  },
};

const weeklyBars = [
  { day: "Mon", amount: 3600 },
  { day: "Tue", amount: 4200 },
  { day: "Wed", amount: 3900 },
  { day: "Thu", amount: 5100 },
  { day: "Fri", amount: 5300 },
  { day: "Sat", amount: 3700 },
  { day: "Sun", amount: 2850 },
];

const recentRideEarnings = [
  {
    id: "ride_123",
    time: "4:58 PM",
    route: "Gulberg → Johar Town",
    fare: 760,
    driver_earnings: 665,
    payment_method: "Cash",
    distance_km: 12.4,
  },
  {
    id: "ride_122",
    time: "3:10 PM",
    route: "DHA → MM Alam Road",
    fare: 920,
    driver_earnings: 805,
    payment_method: "Cash",
    distance_km: 14.2,
  },
  {
    id: "ride_121",
    time: "1:35 PM",
    route: "Model Town → Liberty",
    fare: 540,
    driver_earnings: 470,
    payment_method: "Wallet",
    distance_km: 8.6,
  },
  {
    id: "ride_120",
    time: "11:20 AM",
    route: "Wapda Town → Emporium",
    fare: 680,
    driver_earnings: 595,
    payment_method: "Cash",
    distance_km: 9.8,
  },
];

const payoutItems = [
  {
    id: "payout_001",
    title: "Available balance",
    amount: 7250,
    status: "available",
    description: "Ready for payout",
  },
  {
    id: "payout_002",
    title: "Pending clearance",
    amount: 3040,
    status: "pending",
    description: "Processing wallet rides",
  },
];

function EarningsHero({ stats }) {
  const isPositiveTrend = stats.trend_percent >= 0;

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <Wallet className="mr-1.5 h-3.5 w-3.5" />
            {stats.label}
          </Badge>

          <p className="mt-5 text-sm font-medium text-[#4B5563]">
            Driver earnings
          </p>

          <h1 className="mt-1 text-[42px] font-bold leading-[48px] tracking-[-0.05em] text-[#101820]">
            PKR {stats.total_earnings.toLocaleString()}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <Badge
              className={
                isPositiveTrend
                  ? "rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white"
                  : "rounded-full bg-white px-3 py-1.5 text-[#DC2626] shadow-soft hover:bg-white"
              }
            >
              {isPositiveTrend ? (
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="mr-1 h-3.5 w-3.5" />
              )}
              {Math.abs(stats.trend_percent)}%
            </Badge>

            <p className="text-sm text-[#4B5563]">
              vs previous period
            </p>
          </div>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white shadow-soft">
          <Banknote className="h-8 w-8 text-[#008C78]" />
        </div>
      </div>
    </Card>
  );
}

function EarningsStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <Car className="h-5 w-5 text-[#008C78]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          {stats.rides_count}
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Rides</p>
      </Card>

      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <Clock className="h-5 w-5 text-[#008C78]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          {stats.online_hours}h
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Online</p>
      </Card>

      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <ReceiptText className="h-5 w-5 text-[#008C78]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          PKR {stats.average_per_ride}
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Avg / ride</p>
      </Card>

      <Card className="rounded-[22px] border-[#E1E5EA] bg-white p-4 shadow-sm">
        <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          4.8
        </p>
        <p className="mt-1 text-sm text-[#4B5563]">Rating</p>
      </Card>
    </div>
  );
}

function EarningsChartCard({ bars }) {
  const maxAmount = Math.max(...bars.map((bar) => bar.amount));

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Weekly trend</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Static chart preview for UI.
          </p>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
          7 days
        </Badge>
      </div>

      <div className="mt-6 flex h-40 items-end gap-2">
        {bars.map((bar) => {
          const heightPercent = Math.round((bar.amount / maxAmount) * 100);

          return (
            <div key={bar.day} className="flex flex-1 flex-col items-center">
              <div className="flex h-32 w-full items-end rounded-full bg-[#F7F8FA] p-1">
                <div
                  className="w-full rounded-full bg-[#008C78]"
                  style={{
                    height: `${heightPercent}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs font-semibold text-[#4B5563]">
                {bar.day}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EarningsBreakdownCard({ stats }) {
  const rows = [
    {
      label: "Gross fare",
      value: stats.gross_fare,
    },
    {
      label: "Platform fee",
      value: -stats.platform_fee,
      muted: true,
    },
    {
      label: "Cash collected",
      value: stats.cash_collected,
    },
    {
      label: "Wallet payout",
      value: stats.wallet_payout,
    },
  ];

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">
            Earnings breakdown
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Gross fare minus platform fee.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <Wallet className="h-5 w-5 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <p className="text-sm text-[#4B5563]">{row.label}</p>
            <p
              className={
                row.muted
                  ? "text-sm font-bold text-[#8A9099]"
                  : "text-sm font-bold text-[#101820]"
              }
            >
              {row.value < 0 ? "-" : ""}
              PKR {Math.abs(row.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4 bg-[#E1E5EA]" />

      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-[#101820]">Net earnings</p>
        <p className="text-xl font-bold tracking-[-0.03em] text-[#101820]">
          PKR {stats.total_earnings.toLocaleString()}
        </p>
      </div>
    </Card>
  );
}

function PayoutCard({ payouts }) {
  const totalAvailable = payouts.reduce(
    (sum, payout) => sum + Number(payout.amount || 0),
    0
  );

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Payouts</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Available and pending driver balance.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
          <Banknote className="h-5 w-5 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-4 rounded-[20px] bg-[#F7F8FA] p-4">
        <p className="text-sm text-[#4B5563]">Total balance</p>
        <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          PKR {totalAvailable.toLocaleString()}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {payouts.map((payout) => (
          <div
            key={payout.id}
            className="flex items-center gap-3 rounded-[18px] bg-[#F7F8FA] p-3"
          >
            <div
              className={
                payout.status === "available"
                  ? "flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F7F4]"
                  : "flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7ED]"
              }
            >
              {payout.status === "available" ? (
                <CheckCircle2 className="h-5 w-5 text-[#008C78]" />
              ) : (
                <Clock className="h-5 w-5 text-[#F59E0B]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#101820]">
                {payout.title}
              </p>
              <p className="mt-0.5 text-xs text-[#4B5563]">
                {payout.description}
              </p>
            </div>

            <p className="text-sm font-bold text-[#101820]">
              PKR {payout.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <Button
        type="button"
        className="mt-4 h-12 w-full rounded-[14px] bg-[#008C78] text-sm font-semibold text-white hover:bg-[#006F60]"
      >
        Request payout
      </Button>
    </Card>
  );
}

function RecentRideEarningsCard({ rides, onViewRide }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Recent rides</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Latest completed earnings.
          </p>
        </div>

        <Badge className="rounded-full bg-[#F7F8FA] px-3 py-1.5 text-[#4B5563] hover:bg-[#F7F8FA]">
          {rides.length} rides
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {rides.map((ride) => (
          <button
            key={ride.id}
            type="button"
            onClick={() => onViewRide(ride)}
            className="w-full rounded-[18px] bg-[#F7F8FA] p-3 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#101820]">
                  {ride.route}
                </p>
                <p className="mt-1 text-xs text-[#4B5563]">
                  {ride.time} · {ride.payment_method}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-[#008C78]">
                  PKR {ride.driver_earnings}
                </p>
                <p className="mt-1 text-xs text-[#8A9099]">
                  Fare {ride.fare}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-[#4B5563]">
              <span className="flex items-center gap-1">
                <Route className="h-3.5 w-3.5 text-[#008C78]" />
                {ride.distance_km} km
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#008C78]" />
                Completed
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function DriverEarningsPage() {
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState("today");

  const stats = useMemo(() => demoEarnings[activeRange], [activeRange]);

  function handleViewRide(ride) {
    navigate(`/driver/rides/${ride.id}/summary`);
  }

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
            <h1 className="text-lg font-bold text-[#101820]">Earnings</h1>
          </div>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <Download className="h-5 w-5" />
          </Button>
        </header>

        <div className="mt-8 space-y-4">
          <Tabs value={activeRange} onValueChange={setActiveRange}>
            <TabsList className="grid h-12 w-full grid-cols-3 rounded-[16px] bg-[#F7F8FA] p-1">
              <TabsTrigger
                value="today"
                className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Today
              </TabsTrigger>

              <TabsTrigger
                value="week"
                className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Week
              </TabsTrigger>

              <TabsTrigger
                value="month"
                className="rounded-[12px] text-sm font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <EarningsHero stats={stats} />

          <EarningsStatsGrid stats={stats} />

          <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <CalendarDays className="h-5 w-5 text-[#008C78]" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#101820]">
                  Earnings are UI-only
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                  Later this screen will use real completed rides, payouts, and
                  driver earning records.
                </p>
              </div>
            </div>
          </Card>

          <EarningsChartCard bars={weeklyBars} />

          <EarningsBreakdownCard stats={stats} />

          <PayoutCard payouts={payoutItems} />

          <RecentRideEarningsCard
            rides={recentRideEarnings}
            onViewRide={handleViewRide}
          />

          <Button
            type="button"
            onClick={() => navigate("/driver/home")}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            Back to driver home
          </Button>
        </div>
      </section>
    </main>
  );
}