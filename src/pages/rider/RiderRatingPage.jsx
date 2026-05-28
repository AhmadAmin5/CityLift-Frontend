import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Car,
  CheckCircle2,
  Heart,
  Home,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { getApiErrorMessage } from "@/api/client";
import { useRide } from "@/hooks/rides/useRide";
import { useSubmitRideRating } from "@/hooks/rides/useRideActions";
import { getRideFromResponse } from "@/utils/apiShapes";
import { toRatingDriverView } from "@/utils/rideUi";

const demoDriver = {
  name: "Ahmed Raza",
  initials: "AR",
  rating: 4.8,
  total_rides: 215,
  vehicle: "White Toyota Corolla",
  plate_number: "LEA-1234",
};

const feedbackOptions = [
  "Safe driving",
  "Clean car",
  "Polite driver",
  "On time",
  "Smooth route",
  "Helpful",
];

const ratingLabels = {
  1: "Poor",
  2: "Could be better",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

function DriverRatingHero({ driver }) {
  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#E8F7F4] text-2xl font-bold text-[#008C78] shadow-card">
            {driver.initials}
          </div>

          <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#F1FBF9] bg-[#008C78]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
        </div>

        <h1 className="mt-5 text-[30px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
          How was your ride?
        </h1>

        <p className="mt-2 text-base leading-6 text-[#4B5563]">
          Rate your experience with {driver.name}.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft">
          <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-sm font-bold text-[#101820]">
            {driver.rating}
          </span>
          <span className="text-sm text-[#4B5563]">
            · {driver.total_rides} rides
          </span>
        </div>
      </div>
    </Card>
  );
}

function StarRating({ rating, onChange }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-5 text-center shadow-sm">
      <p className="text-sm font-semibold text-[#4B5563]">Your rating</p>

      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= rating;

          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={
                isActive
                  ? "flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF7ED] text-[#F59E0B] transition-all"
                  : "flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F8FA] text-[#CED4DA] transition-all"
              }
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={
                  isActive
                    ? "h-7 w-7 fill-[#F59E0B]"
                    : "h-7 w-7 fill-transparent"
                }
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-[-0.03em] text-[#101820]">
          {ratingLabels[rating]}
        </p>
        <p className="mt-1 text-sm text-[#8A9099]">
          {rating === 5
            ? "Glad the ride went great."
            : "Your feedback helps improve RideFlow."}
        </p>
      </div>
    </Card>
  );
}

function FeedbackChips({ selectedFeedback, onToggle }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <ThumbsUp className="h-5 w-5 text-[#008C78]" />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#101820]">
            What went well?
          </h2>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            Choose quick feedback tags.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {feedbackOptions.map((option) => {
          const isSelected = selectedFeedback.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={
                isSelected
                  ? "rounded-full border border-[#008C78] bg-[#E8F7F4] px-3 py-2 text-sm font-semibold text-[#008C78]"
                  : "rounded-full border border-[#E1E5EA] bg-white px-3 py-2 text-sm font-semibold text-[#4B5563]"
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function CommentCard({ comment, onChange }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F8FA]">
          <MessageSquareText className="h-5 w-5 text-[#008C78]" />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#101820]">
            Add a comment
          </h2>
          <p className="mt-0.5 text-sm text-[#4B5563]">
            Optional, but helpful for the demo.
          </p>
        </div>
      </div>

      <Textarea
        value={comment}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Great driver, clean car, smooth ride..."
        className="mt-4 min-h-[110px] rounded-[16px] border-[#E1E5EA] text-base focus-visible:ring-[#008C78]/20"
      />

      <p className="mt-2 text-right text-xs text-[#8A9099]">
        {comment.length}/240
      </p>
    </Card>
  );
}

function TripMiniSummary({ driver }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F7F4]">
          <Car className="h-5 w-5 text-[#008C78]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#101820]">
            {driver.vehicle}
          </p>
          <p className="mt-0.5 text-xs text-[#4B5563]">
            Plate {driver.plate_number}
          </p>
        </div>

        <Badge className="rounded-full bg-[#E8F7F4] px-3 py-1.5 text-[#008C78] hover:bg-[#E8F7F4]">
          Completed
        </Badge>
      </div>
    </Card>
  );
}

function ThankYouState({ onDone }) {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 pb-8 pt-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#E8F7F4]">
            <CheckCircle2 className="h-12 w-12 text-[#008C78]" />
          </div>

          <h1 className="mt-6 text-[34px] font-bold leading-10 tracking-[-0.04em] text-[#101820]">
            Thanks for rating
          </h1>

          <p className="mt-3 text-base leading-6 text-[#4B5563]">
            Your feedback helps keep RideFlow safe, reliable, and useful for
            everyday rides.
          </p>

          <Card className="mt-8 w-full rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Award className="mx-auto h-5 w-5 text-[#008C78]" />
                <p className="mt-2 text-xs font-semibold text-[#101820]">
                  Quality
                </p>
              </div>

              <div className="text-center">
                <ShieldCheck className="mx-auto h-5 w-5 text-[#008C78]" />
                <p className="mt-2 text-xs font-semibold text-[#101820]">
                  Safety
                </p>
              </div>

              <div className="text-center">
                <Heart className="mx-auto h-5 w-5 text-[#008C78]" />
                <p className="mt-2 text-xs font-semibold text-[#101820]">
                  Trust
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Button
          type="button"
          onClick={onDone}
          className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to home
        </Button>
      </section>
    </main>
  );
}

export default function RiderRatingPage() {
  const navigate = useNavigate();
  const { ride_id } = useParams();
  const rideQuery = useRide(ride_id);
  const ratingMutation = useSubmitRideRating(ride_id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState([
    "Safe driving",
    "Polite driver",
  ]);
  const [submitted, setSubmitted] = useState(false);
  const ride = getRideFromResponse(rideQuery.data);
  const driver = toRatingDriverView(ride);

  const canSubmit = rating >= 1;

  const submitLabel = useMemo(() => {
    if (rating === 5) return "Submit excellent rating";
    return "Submit rating";
  }, [rating]);

  function toggleFeedback(option) {
    setSelectedFeedback((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }

      return [...current, option];
    });
  }

  async function handleSubmitRating() {
    try {
      const feedbackText = selectedFeedback.length
        ? `${selectedFeedback.join(", ")}${comment ? ` - ${comment}` : ""}`
        : comment;

      await ratingMutation.mutateAsync({
        rating,
        comment: feedbackText || null,
      });
      setSubmitted(true);
    } catch (error) {
      window.alert(getApiErrorMessage(error));
    }
  }

  function goHome() {
    navigate("/rider/home", { replace: true });
  }

  if (submitted) {
    return <ThankYouState onDone={goHome} />;
  }

  if (rideQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading rating screen..." />
      </main>
    );
  }

  if (rideQuery.isError || !ride) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Ride not found. Return home and try again." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(`/rider/ride/${ride_id}/receipt`)
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] bg-white text-[#101820]"
            aria-label="Back to receipt"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Rate driver</h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1FBF9]">
            <Sparkles className="h-5 w-5 text-[#008C78]" />
          </div>
        </header>

        <div className="mt-8 space-y-4">
          <DriverRatingHero driver={driver} />
          <StarRating rating={rating} onChange={setRating} />

          <TripMiniSummary driver={driver} />

          <FeedbackChips
            selectedFeedback={selectedFeedback}
            onToggle={toggleFeedback}
          />

          <CommentCard
            comment={comment}
            onChange={(value) => setComment(value.slice(0, 240))}
          />

          <Card className="rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-[#008C78]" />

              <div>
                <p className="text-sm font-bold text-[#101820]">
                  Ratings help improve RideFlow
                </p>
                <p className="mt-1 text-sm leading-5 text-[#4B5563]">
                  Your rating is used to improve driver quality and rider safety
                  in the demo system.
                </p>
              </div>
            </div>
          </Card>

          <Separator className="bg-[#E1E5EA]" />

          <Button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmitRating}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Star className="mr-2 h-5 w-5 fill-white" />
            {submitLabel}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={goHome}
            className="h-[52px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
          >
            Skip for now
          </Button>
        </div>
      </section>
    </main>
  );
}
