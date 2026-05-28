import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Car,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Send,
  ShieldCheck,
  Star,
  ThumbsUp,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ratingSummary = {
  average_rating: 4.8,
  total_reviews: 186,
  total_rides: 215,
  positive_feedback_percent: 96,
  repeat_riders: 42,
  distribution: [
    { stars: 5, count: 142 },
    { stars: 4, count: 31 },
    { stars: 3, count: 9 },
    { stars: 2, count: 3 },
    { stars: 1, count: 1 },
  ],
};

const compliments = [
  {
    id: "safe_driving",
    label: "Safe driving",
    count: 82,
    icon: ShieldCheck,
  },
  {
    id: "clean_car",
    label: "Clean car",
    count: 64,
    icon: Car,
  },
  {
    id: "polite_driver",
    label: "Polite driver",
    count: 73,
    icon: Heart,
  },
  {
    id: "on_time",
    label: "On time",
    count: 51,
    icon: Clock,
  },
];

const reviews = [
  {
    id: "review_001",
    rider_name: "Ali Khan",
    rider_initials: "AK",
    rating: 5,
    created_at: "Today · 4:58 PM",
    route: "Gulberg → Johar Town",
    comment: "Great driver, clean car, smooth ride.",
    tags: ["Safe driving", "Clean car", "Polite driver"],
    replied: false,
  },
  {
    id: "review_002",
    rider_name: "Sara Ahmed",
    rider_initials: "SA",
    rating: 5,
    created_at: "Yesterday · 8:30 PM",
    route: "DHA → MM Alam Road",
    comment: "Very professional and arrived on time.",
    tags: ["On time", "Polite driver"],
    replied: true,
    reply: "Thank you for riding with me.",
  },
  {
    id: "review_003",
    rider_name: "Hassan R.",
    rider_initials: "HR",
    rating: 4,
    created_at: "May 25 · 6:12 PM",
    route: "Model Town → Liberty",
    comment: "Good ride overall. Slight delay due to traffic.",
    tags: ["Safe driving"],
    replied: false,
  },
  {
    id: "review_004",
    rider_name: "Minaal S.",
    rider_initials: "MS",
    rating: 3,
    created_at: "May 24 · 11:10 AM",
    route: "Wapda Town → Emporium",
    comment: "Ride was okay, but pickup communication could be better.",
    tags: ["Safe driving"],
    replied: false,
  },
];

function RatingHero({ summary }) {
  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <Award className="mr-1.5 h-3.5 w-3.5" />
            Driver quality
          </Badge>

          <p className="mt-5 text-sm font-medium text-[#4B5563]">
            Average rating
          </p>

          <div className="mt-1 flex items-end gap-2">
            <h1 className="text-[52px] font-bold leading-[54px] tracking-[-0.06em] text-[#101820]">
              {summary.average_rating}
            </h1>
            <p className="pb-2 text-lg font-bold text-[#8A9099]">/ 5</p>
          </div>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]"
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-[#4B5563]">
            Based on {summary.total_reviews} rider reviews.
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white shadow-soft">
          <Star className="h-8 w-8 fill-[#F59E0B] text-[#F59E0B]" />
        </div>
      </div>
    </Card>
  );
}

function RatingStatsGrid({ summary }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="rounded-[20px] border-[#E1E5EA] bg-white p-3 text-center shadow-sm">
        <Car className="mx-auto h-5 w-5 text-[#008C78]" />
        <p className="mt-2 text-lg font-bold text-[#101820]">
          {summary.total_rides}
        </p>
        <p className="text-xs text-[#8A9099]">Rides</p>
      </Card>

      <Card className="rounded-[20px] border-[#E1E5EA] bg-white p-3 text-center shadow-sm">
        <ThumbsUp className="mx-auto h-5 w-5 text-[#008C78]" />
        <p className="mt-2 text-lg font-bold text-[#101820]">
          {summary.positive_feedback_percent}%
        </p>
        <p className="text-xs text-[#8A9099]">Positive</p>
      </Card>

      <Card className="rounded-[20px] border-[#E1E5EA] bg-white p-3 text-center shadow-sm">
        <UserRound className="mx-auto h-5 w-5 text-[#008C78]" />
        <p className="mt-2 text-lg font-bold text-[#101820]">
          {summary.repeat_riders}
        </p>
        <p className="text-xs text-[#8A9099]">Repeats</p>
      </Card>
    </div>
  );
}

function RatingDistributionCard({ summary }) {
  const maxCount = Math.max(...summary.distribution.map((item) => item.count));

  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">
            Rating breakdown
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            Distribution across all rider reviews.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF7ED]">
          <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {summary.distribution.map((item) => {
          const width = Math.max(8, Math.round((item.count / maxCount) * 100));

          return (
            <div key={item.stars} className="flex items-center gap-3">
              <div className="flex w-10 items-center gap-1">
                <span className="text-sm font-bold text-[#101820]">
                  {item.stars}
                </span>
                <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              </div>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E1E5EA]">
                <div
                  className="h-full rounded-full bg-[#008C78]"
                  style={{ width: `${width}%` }}
                />
              </div>

              <p className="w-8 text-right text-sm font-semibold text-[#4B5563]">
                {item.count}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ComplimentsCard({ compliments }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101820]">Top compliments</h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            What riders appreciate most.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <Heart className="h-5 w-5 text-[#008C78]" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {compliments.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="rounded-[18px] bg-[#F7F8FA] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <Icon className="h-5 w-5 text-[#008C78]" />
              </div>

              <p className="mt-3 text-sm font-bold text-[#101820]">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-[#8A9099]">
                {item.count} mentions
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ReviewCard({ review, onReply }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 border border-[#E1E5EA]">
          <AvatarFallback className="bg-[#E8F7F4] text-sm font-bold text-[#008C78]">
            {review.rider_initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[#101820]">
                {review.rider_name}
              </p>
              <p className="mt-0.5 text-xs text-[#4B5563]">
                {review.created_at}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-1">
              <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="text-xs font-bold text-[#101820]">
                {review.rating}
              </span>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-[#4B5563]">
            “{review.comment}”
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {review.tags.map((tag) => (
              <Badge
                key={tag}
                className="rounded-full bg-[#F7F8FA] px-3 py-1.5 text-[#4B5563] hover:bg-[#F7F8FA]"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <Separator className="my-4 bg-[#E1E5EA]" />

          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-xs font-medium text-[#8A9099]">
              {review.route}
            </p>

            {review.replied ? (
              <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Replied
              </Badge>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onReply(review)}
                className="h-9 rounded-full border-[#E1E5EA] bg-white px-3 text-xs font-semibold text-[#101820]"
              >
                <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-[#008C78]" />
                Reply
              </Button>
            )}
          </div>

          {review.reply ? (
            <div className="mt-3 rounded-[16px] bg-[#F7F8FA] p-3">
              <p className="text-xs font-semibold text-[#8A9099]">
                Your reply
              </p>
              <p className="mt-1 text-sm leading-5 text-[#101820]">
                “{review.reply}”
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ImprovementCard() {
  return (
    <Card className="rounded-[24px] border-[#F59E0B]/25 bg-[#FFF7ED] p-4 shadow-none">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
          <TrendingUp className="h-5 w-5 text-[#F59E0B]" />
        </div>

        <div>
          <p className="text-sm font-bold text-[#92400E]">
            Opportunity to improve
          </p>
          <p className="mt-1 text-sm leading-5 text-[#92400E]">
            A few riders mentioned pickup communication. Keep riders updated
            when traffic or parking delays happen.
          </p>
        </div>
      </div>
    </Card>
  );
}

function ReplySheet({
  open,
  selectedReview,
  replyText,
  onOpenChange,
  onReplyTextChange,
  onSend,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
            Reply to review
          </SheetTitle>

          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            UI-only reply. Later this can send a response to the review endpoint.
          </SheetDescription>
        </SheetHeader>

        {selectedReview ? (
          <Card className="mt-5 rounded-[22px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-white text-sm font-bold text-[#008C78]">
                  {selectedReview.rider_initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-sm font-bold text-[#101820]">
                  {selectedReview.rider_name}
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                  “{selectedReview.comment}”
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-[#101820]">
            Your reply
          </p>

          <Textarea
            value={replyText}
            onChange={(event) => onReplyTextChange(event.target.value)}
            placeholder="Thank you for riding with me..."
            className="min-h-[120px] rounded-[16px] border-[#E1E5EA] text-base focus-visible:ring-[#008C78]/20"
          />

          <p className="mt-2 text-right text-xs text-[#8A9099]">
            {replyText.length}/200
          </p>
        </div>

        <Button
          type="button"
          onClick={onSend}
          className="mt-5 h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
        >
          <Send className="mr-2 h-5 w-5" />
          Send reply
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export default function DriverRatingsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [reviewItems, setReviewItems] = useState(reviews);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("Thank you for riding with me.");

  const filteredReviews = useMemo(() => {
    if (activeTab === "all") return reviewItems;

    if (activeTab === "positive") {
      return reviewItems.filter((review) => review.rating >= 5);
    }

    if (activeTab === "needs_reply") {
      return reviewItems.filter((review) => !review.replied);
    }

    return reviewItems.filter((review) => review.rating <= 3);
  }, [activeTab, reviewItems]);

  function openReplySheet(review) {
    setSelectedReview(review);
    setReplyText("Thank you for riding with me.");
  }

  function sendReplyUiOnly() {
    if (!selectedReview) return;

    setReviewItems((current) =>
      current.map((review) =>
        review.id === selectedReview.id
          ? {
              ...review,
              replied: true,
              reply: replyText.trim() || "Thank you for riding with me.",
            }
          : review
      )
    );

    setSelectedReview(null);
    setReplyText("");
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
            <h1 className="text-lg font-bold text-[#101820]">Ratings</h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF7ED]">
            <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
        </header>

        <div className="mt-8 space-y-4">
          <RatingHero summary={ratingSummary} />

          <RatingStatsGrid summary={ratingSummary} />

          <RatingDistributionCard summary={ratingSummary} />

          <ComplimentsCard compliments={compliments} />

          <ImprovementCard />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-12 w-full grid-cols-4 rounded-[16px] bg-[#F7F8FA] p-1">
              <TabsTrigger
                value="all"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                All
              </TabsTrigger>

              <TabsTrigger
                value="positive"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                5★
              </TabsTrigger>

              <TabsTrigger
                value="needs_reply"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Reply
              </TabsTrigger>

              <TabsTrigger
                value="low"
                className="rounded-[12px] text-xs font-semibold data-[state=active]:bg-[#E8F7F4] data-[state=active]:text-[#008C78]"
              >
                Low
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReply={openReplySheet}
              />
            ))}
          </div>

          <Button
            type="button"
            onClick={() => navigate("/driver/home")}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            Back to driver home
          </Button>
        </div>

        <ReplySheet
          open={Boolean(selectedReview)}
          selectedReview={selectedReview}
          replyText={replyText}
          onOpenChange={(open) => {
            if (!open) setSelectedReview(null);
          }}
          onReplyTextChange={(value) => setReplyText(value.slice(0, 200))}
          onSend={sendReplyUiOnly}
        />
      </section>
    </main>
  );
}