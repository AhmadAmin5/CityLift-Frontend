import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AuthPasswordField({
  value,
  onChange,
  placeholder = "Password",
  autoComplete,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div
        className={
          error
            ? "flex h-14 items-center gap-3 rounded-[14px] border border-[#DC2626] bg-white px-4 focus-within:ring-4 focus-within:ring-[#DC2626]/10"
            : "flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10"
        }
      >
        <Lock className="h-5 w-5 text-[#7A8088]" />

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#7A8088]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-1.5 text-sm font-medium text-[#DC2626]">{error}</p>
      ) : null}
    </div>
  );
}