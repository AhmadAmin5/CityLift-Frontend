import { Input } from "@/components/ui/input";

export function AuthTextField({
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
}) {
  return (
    <div>
      <div
        className={
          error
            ? "flex h-14 items-center gap-3 rounded-[14px] border border-[#DC2626] bg-white px-4 focus-within:ring-4 focus-within:ring-[#DC2626]/10"
            : "flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10"
        }
      >
        {Icon ? <Icon className="h-5 w-5 text-[#7A8088]" /> : null}

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-sm font-medium text-[#DC2626]">{error}</p>
      ) : null}
    </div>
  );
}