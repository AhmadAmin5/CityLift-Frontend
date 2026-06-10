import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Loader2,
  Mail,
  Phone,
  UserRound,
  Icon
} from "lucide-react";
import { steeringWheel } from "@lucide/lab";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { useRegisterRider } from "@/hooks/auth/useRegisterRider";
import { useRegisterDriver } from "@/hooks/auth/useRegisterDriver";
import { getApiErrorMessage } from "@/api/client";
import { validateRegisterForm } from "@/utils/validators";

const INITIAL_VALUES = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
};

function DriverIcon(props) {
  return <Icon iconNode={steeringWheel} {...props} />;
}

export default function RegisterPage({ role = "rider" }) {
  const navigate = useNavigate();

  const registerRiderMutation = useRegisterRider();
  const registerDriverMutation = useRegisterDriver();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});

  const isDriver = role === "driver";
  const activeMutation = isDriver ? registerDriverMutation : registerRiderMutation;

  const copy = useMemo(() => {
    if (isDriver) {
      return {
        icon: DriverIcon,
        title: "Drive with CityLift",
        subtitle: "Create your driver account. Vehicle and documents come next.",
        submit: "Create driver account",
        loginText: "Already driving?",
        accentLabel: "Driver",
      };
    }

    return {
      icon: UserRound,
      title: "Create rider account",
      subtitle: "Book reliable rides with a clean and simple experience.",
      submit: "Create rider account",
      loginText: "Already have an account?",
      accentLabel: "Rider",
    };
  }, [isDriver]);

  function updateField(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      password: values.password,
    };

    activeMutation.mutate(payload, {
      onSuccess: (data) => {
        const returnedRole = data?.user?.role || role;

        toast.success("Account created successfully");

        if (returnedRole === "driver") {
          navigate("/driver/documents", { replace: true });
          return;
        }

        navigate("/auth/verify-otp", {
          replace: true,
          state: {
            role: returnedRole,
            channel: "phone",
            nextPath: "/rider/home",
          },
        });
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  const HeaderIcon = copy.icon;

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
              <p className="text-sm font-semibold text-[#008C78]">
                {copy.accentLabel}
              </p>
              <p className="text-lg font-bold text-[#101820]">CityLift</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#F1FBF9]">
              <HeaderIcon className="h-6 w-6 text-[#008C78]" />
            </div>

            <h1 className="text-[34px] font-bold leading-[40px] tracking-[-0.04em] text-[#101820]">
              {copy.title}
            </h1>

            <p className="mt-2 text-base leading-6 text-[#4B5563]">
              {copy.subtitle}
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <AuthTextField
            icon={UserRound}
            value={values.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Full name"
            autoComplete="name"
            error={errors.name}
          />

          <AuthTextField
            icon={Mail}
            value={values.email}
            onChange={(value) => updateField("email", value)}
            placeholder="Email address"
            autoComplete="email"
            error={errors.email}
          />

          <AuthTextField
            icon={Phone}
            value={values.phone}
            onChange={(value) => updateField("phone", value)}
            placeholder="+923001234567"
            autoComplete="tel"
            error={errors.phone}
          />

          <AuthPasswordField
            value={values.password}
            onChange={(value) => updateField("password", value)}
            placeholder="Password"
            autoComplete="new-password"
            error={errors.password}
          />

          <AuthPasswordField
            value={values.confirm_password}
            onChange={(value) => updateField("confirm_password", value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            error={errors.confirm_password}
          />

          <Button
            type="submit"
            disabled={activeMutation.isPending}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
          >
            {activeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              copy.submit
            )}
          </Button>
        </form>

        <div className="mt-auto pt-8 text-center">
          <p className="text-[15px] font-medium text-[#4B5563]">
            {copy.loginText}{" "}
            <Link to="/auth/login" className="font-semibold text-[#008C78]">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
