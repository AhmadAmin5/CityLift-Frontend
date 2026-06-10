import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Car,
    Eye,
    EyeOff,
    Lock,
    Mail,
    UserRound,
    Loader2,
    Icon,
} from "lucide-react";
import { steeringWheel } from "@lucide/lab";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useLogin } from "@/hooks/auth/useLogin";
import { getApiErrorMessage } from "@/api/client";
import { getHomeRouteForRole } from "@/utils/authRoutes";

export default function LoginPage() {
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const [selectedRole, setSelectedRole] = useState("rider");
    const [showPassword, setShowPassword] = useState(false);
    const [values, setValues] = useState({
        email_or_phone: "",
        password: "",
    });

    const signupRoute = useMemo(() => {
        if (selectedRole === "driver") return "/auth/register/driver";
        return "/auth/register/rider";
    }, [selectedRole]);

    function updateField(field, value) {
        setValues((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function validateForm() {
        if (!values.email_or_phone.trim()) {
            return "Email or phone is required";
        }

        if (!values.password.trim()) {
            return "Password is required";
        }

        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            toast.error(validationError);
            return;
        }

        loginMutation.mutate(
            {
                email_or_phone: values.email_or_phone.trim(),
                password: values.password,
            },
            {
                onSuccess: (data) => {
                    const role = data?.user?.role;

                    toast.success("Logged in successfully");
                    navigate(getHomeRouteForRole(role), { replace: true });
                },
                onError: (error) => {
                    toast.error(getApiErrorMessage(error));
                },
            },
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 pb-8 pt-12">
                <header className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E8F7F4]">
                        <Car className="h-7 w-7 text-[#008C78]" />
                    </div>

                    <h1 className="mt-3 text-[32px] font-bold leading-10 tracking-[-0.03em] text-[#101820]">
                        CityLift
                    </h1>
                </header>

                <div className="mt-7">
                    <h2 className="text-[38px] font-bold leading-[44px] tracking-[-0.04em] text-[#101820]">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-[18px] leading-7 text-[#4B5563]">
                        Sign in to book rides, drive, or manage the platform.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid h-14 grid-cols-2 rounded-[14px] border border-[#E1E5EA] bg-white p-1">
                        <button
                            type="button"
                            onClick={() => setSelectedRole("rider")}
                            className={
                                selectedRole === "rider"
                                    ? "flex items-center justify-center gap-2 rounded-[12px] bg-[#E8F7F4] text-sm font-semibold text-[#008C78] transition-all"
                                    : "flex items-center justify-center gap-2 rounded-[12px] text-sm font-semibold text-[#4B5563] transition-all"
                            }
                        >
                            <UserRound className="h-4 w-4" />
                            Rider
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedRole("driver")}
                            className={
                                selectedRole === "driver"
                                    ? "flex items-center justify-center gap-2 rounded-[12px] bg-[#E8F7F4] text-sm font-semibold text-[#008C78] transition-all"
                                    : "flex items-center justify-center gap-2 rounded-[12px] text-sm font-semibold text-[#4B5563] transition-all"
                            }
                        >
                            <Icon
                                iconNode={steeringWheel}
                                className="h-4 w-4"
                            />
                            Driver
                        </button>
                    </div>

                    <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
                        <Mail className="h-5 w-5 text-[#7A8088]" />
                        <Input
                            value={values.email_or_phone}
                            onChange={(event) =>
                                updateField(
                                    "email_or_phone",
                                    event.target.value,
                                )
                            }
                            placeholder="Email or phone"
                            autoComplete="username"
                            className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
                        />
                    </div>

                    <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
                        <Lock className="h-5 w-5 text-[#7A8088]" />
                        <Input
                            value={values.password}
                            onChange={(event) =>
                                updateField("password", event.target.value)
                            }
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            autoComplete="current-password"
                            className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((current) => !current)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-full text-[#7A8088]"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() =>
                                toast.info(
                                    "Forgot password functionality is currently unavailable. Please contact system support.",
                                )
                            }
                            className="text-sm font-semibold text-[#008C78]"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60] disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        {loginMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Log in"
                        )}
                    </Button>
                </form>

                <div className="mt-auto pt-8 text-center">
                    <p className="text-[15px] font-medium text-[#4B5563]">
                        New to CityLift?{" "}
                        <Link
                            to={signupRoute}
                            className="font-semibold text-[#008C78]"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
