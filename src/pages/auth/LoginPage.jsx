import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Car,
    Eye,
    EyeOff,
    Lock,
    Mail,
    UserRound,
    ShieldCheck,
    Loader2,
    Icon,
    MessageSquareText,
} from "lucide-react";
import { steeringWheel } from "@lucide/lab";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useLogin } from "@/hooks/auth/useLogin";
import { getApiErrorMessage } from "@/api/client";
import { getHomeRouteForRole } from "@/utils/authRoutes";

const DEMO_CREDENTIALS = {
    rider: {
        email_or_phone: "rider@test.com",
        password: "password123",
    },
    driver: {
        email_or_phone: "driver@test.com",
        password: "password123",
    },
    admin: {
        email_or_phone: "admin@test.com",
        password: "password123",
    },
};

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

    function fillDemo(role) {
        setSelectedRole(role);
        setValues(DEMO_CREDENTIALS[role]);
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
                        RideFlow
                    </h1>
                </header>

                <div className="mt-8 rounded-[28px] border border-[#E1E5EA] bg-[#F1FBF9] p-5">
                    <div className="relative mx-auto h-[120px] max-w-[280px]">
                        <div className="absolute left-5 top-8 h-12 w-12 rounded-full bg-white shadow-soft" />
                        <div className="absolute right-4 top-2 h-16 w-16 rounded-full bg-white/80" />
                        <div className="absolute bottom-2 left-1/2 h-14 w-40 -translate-x-1/2 rounded-[22px] bg-[#008C78] shadow-card">
                            <div className="absolute left-4 top-4 h-5 w-5 rounded-full bg-white" />
                            <div className="absolute right-4 top-4 h-5 w-5 rounded-full bg-white" />
                            <div className="absolute left-1/2 top-3 h-5 w-16 -translate-x-1/2 rounded-full bg-[#E8F7F4]" />
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-[#D8F0EC]" />
                    </div>
                </div>

                <div className="mt-7">
                    <h2 className="text-[38px] font-bold leading-[44px] tracking-[-0.04em] text-[#101820]">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-[18px] leading-7 text-[#4B5563]">
                        Sign in to book rides, drive, or manage the demo.
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
                                    "Forgot password is not enabled in demo.",
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
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (!values.email_or_phone.trim()) {
                                toast.error("Enter your email or phone first");
                                return;
                            }

                            toast.info(
                                "Log in first, then verify OTP in this demo flow.",
                            );
                        }}
                        className="h-[52px] w-full rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]"
                    >
                        <MessageSquareText className="mr-2 h-5 w-5 text-[#008C78]" />
                        Continue with OTP
                    </Button>
                </form>

                <div className="mt-6 flex items-center gap-4">
                    <Separator className="flex-1 bg-[#E1E5EA]" />
                    <span className="text-sm text-[#8A9099]">
                        demo shortcuts
                    </span>
                    <Separator className="flex-1 bg-[#E1E5EA]" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fillDemo("rider")}
                        className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
                    >
                        Rider
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fillDemo("driver")}
                        className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
                    >
                        Driver
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fillDemo("admin")}
                        className="h-[52px] rounded-[14px] border-[#E1E5EA] bg-white text-sm font-semibold text-[#101820]"
                    >
                        <ShieldCheck className="mr-1 h-4 w-4 text-[#008C78]" />
                        Admin
                    </Button>
                </div>

                <div className="mt-auto pt-8 text-center">
                    <p className="text-[15px] font-medium text-[#4B5563]">
                        New to RideFlow?{" "}
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
