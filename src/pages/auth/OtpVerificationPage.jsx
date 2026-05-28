import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { useMe } from "@/hooks/auth/useMe";
import { useSendOtp, useVerifyOtp } from "@/hooks/auth/useOtp";
import { getApiErrorMessage } from "@/api/client";
import { getHomeRouteForRole } from "@/utils/authRoutes";
import { validateOtpForm } from "@/utils/validators";

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: me } = useMe();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const [otp, setOtp] = useState("123456");
  const [errors, setErrors] = useState({});

  const channel = location.state?.channel || "phone";
  const role = location.state?.role || me?.user?.role;
  const nextPath =
  location.state?.nextPath ||
  (role ? getHomeRouteForRole(role) : "/splash");

  const destination = useMemo(() => {
    if (channel === "email") return me?.user?.email || "your email";
    return me?.user?.phone || "your phone";
  }, [channel, me]);

  function handleSendOtp({ silent = false } = {}) {
    sendOtpMutation.mutate(
      { channel },
      {
        onSuccess: (data) => {
          if (!silent) {
            toast.success(data?.message || "OTP sent");
          }
        },
        onError: (error) => {
          if (!silent) {
            toast.error(getApiErrorMessage(error));
          }
        },
      }
    );
  }

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/auth/login", { replace: true });
      return;
    }

    handleSendOtp({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateOtpForm({ otp });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    verifyOtpMutation.mutate(
      {
        channel,
        otp,
      },
      {
        onSuccess: () => {
          toast.success("OTP verified successfully");
          navigate(nextPath, { replace: true });
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  }

  const isBusy = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 pb-8 pt-8">
        <button
          type="button"
          onClick={() => navigate("/auth/login")}
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] bg-white text-[#101820]"
          aria-label="Back to login"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <header>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#E8F7F4]">
              <Car className="h-6 w-6 text-[#008C78]" />
            </div>

            <div>
              <p className="text-lg font-bold text-[#101820]">RideFlow</p>
              <p className="text-sm font-medium text-[#4B5563]">
                Account verification
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#F1FBF9]">
              <MessageSquareText className="h-7 w-7 text-[#008C78]" />
            </div>

            <h1 className="text-[34px] font-bold leading-[40px] tracking-[-0.04em] text-[#101820]">
              Verify OTP
            </h1>

            <p className="mt-2 text-base leading-6 text-[#4B5563]">
              We sent a mock OTP to {destination}. For the lab demo, use{" "}
              <span className="font-semibold text-[#101820]">123456</span>.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <AuthTextField
            icon={MessageSquareText}
            value={otp}
            onChange={(value) => {
              setOtp(value.replace(/\D/g, "").slice(0, 6));
              setErrors({});
            }}
            placeholder="123456"
            autoComplete="one-time-code"
            error={errors.otp}
          />

          <Button
            type="submit"
            disabled={isBusy}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
          >
            {verifyOtpMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify account"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => handleSendOtp()}
            className="h-[52px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
          >
            {sendOtpMutation.isPending ? "Sending OTP..." : "Resend OTP"}
          </Button>
        </form>

        <div className="mt-auto pt-8 text-center">
          <p className="text-[15px] font-medium text-[#4B5563]">
            Wrong account?{" "}
            <Link to="/auth/login" className="font-semibold text-[#008C78]">
              Log in again
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}