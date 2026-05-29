import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Car,
  FileCheck2,
  History,
  Home,
  LogOut,
  Menu,
  Star,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLogout } from "@/hooks/shared/useProfileActions";

function getInitials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const menuItems = {
  rider: [
    { label: "Home", path: "/rider/home", icon: Home },
    { label: "Profile & Settings", path: "/rider/profile", icon: UserRound },
    { label: "Ride History", path: "/rider/rides", icon: History },
    { label: "Saved Places", path: "/rider/saved-places", icon: Bookmark },
    { label: "Notifications", action: "notifications", icon: Bell },
  ],
  driver: [
    { label: "Home", path: "/driver/home", icon: Home },
    { label: "Profile & Settings", path: "/profile", icon: UserRound },
    { label: "Ratings", path: "/driver/ratings", icon: Star },
    { label: "Earnings", path: "/driver/earnings", icon: Wallet },
    { label: "Documents", path: "/driver/documents", icon: FileCheck2 },
    { label: "Vehicle", path: "/driver/vehicles", icon: Car },
    { label: "Notifications", action: "notifications", icon: Bell },
  ],
};

export function HomeSidebar({
  role = "rider",
  profile,
  triggerClassName = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);

  const items = menuItems[role] || menuItems.rider;
  const roleLabel = role === "driver" ? "Driver mode" : "Rider";
  const name = profile?.name || roleLabel;
  const email = profile?.email || profile?.phone || roleLabel;
  const initials = profile?.initials || getInitials(name);
  const rating = profile?.rating;

  const activePath = useMemo(() => {
    if (role === "driver" && location.pathname === "/drive/home") {
      return "/driver/home";
    }

    return location.pathname;
  }, [location.pathname, role]);

  function handleItemSelect(item) {
    if (item.action === "notifications") {
      toast.info("No new notifications");
      setOpen(false);
      return;
    }

    if (item.path) {
      navigate(item.path);
      setOpen(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setOpen(false);
      navigate("/auth/login", { replace: true });
    }
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => setOpen(true)}
        className={`h-11 w-11 shrink-0 rounded-full border-white/70 bg-white/95 text-[#101820] shadow-soft backdrop-blur hover:bg-white ${triggerClassName}`}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[84vw] max-w-[340px] gap-0 border-[#E1E5EA] bg-white p-0 data-[state=closed]:animate-[ride-sidebar-out_220ms_ease-in_forwards] data-[state=open]:animate-[ride-sidebar-in_260ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SheetDescription className="sr-only">
            Home navigation, profile, settings, notifications, and logout.
          </SheetDescription>

          <div className="flex min-h-full flex-col">
            <div className="bg-[#F1FBF9] px-5 pb-5 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-soft">
                    {profile?.profile_photo_url ? (
                      <AvatarImage
                        src={profile.profile_photo_url}
                        alt={name}
                      />
                    ) : null}
                    <AvatarFallback className="bg-[#008C78] text-base font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-[#101820]">
                      {name}
                    </p>
                    <p className="truncate text-sm text-[#4B5563]">{email}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 shrink-0 rounded-full text-[#4B5563] hover:bg-white"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-sm hover:bg-white">
                  {roleLabel}
                </Badge>
                {rating ? (
                  <Badge className="rounded-full bg-white px-3 py-1.5 text-[#101820] shadow-sm hover:bg-white">
                    <Star className="mr-1 h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    {rating} rating
                  </Badge>
                ) : null}
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = item.path && activePath === item.path;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#E8F7F4] text-[#008C78]"
                        : "text-[#101820] hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isActive ? "bg-white" : "bg-[#F1FBF9]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-[#E1E5EA] p-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex min-h-12 w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left text-sm font-semibold text-[#DC2626] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <LogOut className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
