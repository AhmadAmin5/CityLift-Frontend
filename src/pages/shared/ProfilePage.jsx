import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  Edit3,
  HelpCircle,
  Lock,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
  Wallet,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorState } from "@/common/ErrorState";
import { LoadingState } from "@/common/LoadingState";
import { getApiErrorMessage } from "@/api/client";
import { useMe } from "@/hooks/auth/useMe";
import { useDriverProfile } from "@/hooks/driver/useDriverProfile";
import { useRiderProfile } from "@/hooks/rider/useRiderProfile";
import { useSavedPlaces } from "@/hooks/rider/useSavedPlaces";
import {
  useLogout,
  useUpdateProfile,
  useUploadProfilePhoto,
} from "@/hooks/shared/useProfileActions";

const settingsItems = [
  {
    id: "personal",
    title: "Personal information",
    description: "Name, email, and phone",
    icon: UserRound,
  },
  {
    id: "payment",
    title: "Payment methods",
    description: "Cash and future wallet options",
    icon: Wallet,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Ride updates and alerts",
    icon: Bell,
  },
  {
    id: "security",
    title: "Security",
    description: "Password and account safety",
    icon: Lock,
  },
  {
    id: "support",
    title: "Help & support",
    description: "Contact RideFlow support",
    icon: HelpCircle,
  },
];

function getRoleConfig(role) {
  if (role === "driver") {
    return {
      label: "Driver",
      icon: Car,
      className: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
    };
  }

  if (role === "admin") {
    return {
      label: "Admin",
      icon: ShieldCheck,
      className: "bg-[#EEF2FF] text-[#2563EB] hover:bg-[#EEF2FF]",
    };
  }

  return {
    label: "Rider",
    icon: UserRound,
    className: "bg-[#E8F7F4] text-[#008C78] hover:bg-[#E8F7F4]",
  };
}

function getInitials(name) {
  return String(name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatMemberSince(timestamp) {
  if (!timestamp) return "—";

  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric",
    }).format(new Date(timestamp));
  } catch {
    return "—";
  }
}

function makeProfileView({ user, rider, driver, savedPlaceCount }) {
  const roleProfile = user?.role === "driver" ? driver : rider;
  const name = user?.name || "";

  return {
    id: user?.id || "",
    name,
    initials: getInitials(name),
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "rider",
    profile_photo_url: user?.profile_photo_url || null,
    email_verified_at: user?.email_verified_at || null,
    phone_verified_at: user?.phone_verified_at || null,
    member_since: formatMemberSince(user?.created_at),
    stats: {
      total_rides: roleProfile?.total_rides ?? 0,
      average_rating: roleProfile?.average_rating ?? 0,
      saved_places: user?.role === "rider" ? (savedPlaceCount ?? 0) : 0,
    },
  };
}

function ProfileHero({ profile, onEdit, onPhotoClick, isUploadingPhoto }) {
  const roleConfig = getRoleConfig(profile.role);
  const RoleIcon = roleConfig.icon;

  return (
    <Card className="rounded-[28px] border-[#E1E5EA] bg-[#F1FBF9] p-5 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-card">
            {profile.profile_photo_url ? (
              <AvatarImage src={profile.profile_photo_url} alt={profile.name} />
            ) : null}
            <AvatarFallback className="bg-[#E8F7F4] text-2xl font-bold text-[#008C78]">
              {profile.initials}
            </AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={onPhotoClick}
            disabled={isUploadingPhoto}
            className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#F1FBF9] bg-[#008C78] text-white"
            aria-label="Change profile photo"
          >
            {isUploadingPhoto ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>

        <h1 className="mt-5 text-[32px] font-bold leading-9 tracking-[-0.04em] text-[#101820]">
          {profile.name}
        </h1>

        <p className="mt-1 text-sm text-[#4B5563]">
          Member since {profile.member_since}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge className={`rounded-full px-3 py-1.5 ${roleConfig.className}`}>
            <RoleIcon className="mr-1.5 h-3.5 w-3.5" />
            {roleConfig.label}
          </Badge>

          <Badge className="rounded-full bg-white px-3 py-1.5 text-[#008C78] shadow-soft hover:bg-white">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Verified
          </Badge>
        </div>

        <Button
          type="button"
          onClick={onEdit}
          className="mt-5 h-12 rounded-[14px] bg-[#008C78] px-5 text-sm font-semibold text-white hover:bg-[#006F60]"
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Edit profile
        </Button>
      </div>
    </Card>
  );
}

function ProfileStatsCard({ profile }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[18px] bg-[#F7F8FA] p-3 text-center">
          <Car className="mx-auto h-5 w-5 text-[#008C78]" />
          <p className="mt-2 text-lg font-bold text-[#101820]">
            {profile.stats.total_rides}
          </p>
          <p className="text-xs text-[#8A9099]">Rides</p>
        </div>

        <div className="rounded-[18px] bg-[#F7F8FA] p-3 text-center">
          <Star className="mx-auto h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
          <p className="mt-2 text-lg font-bold text-[#101820]">
            {profile.stats.average_rating}
          </p>
          <p className="text-xs text-[#8A9099]">Rating</p>
        </div>

        <div className="rounded-[18px] bg-[#F7F8FA] p-3 text-center">
          <ShieldCheck className="mx-auto h-5 w-5 text-[#008C78]" />
          <p className="mt-2 text-lg font-bold text-[#101820]">
            {profile.stats.saved_places}
          </p>
          <p className="text-xs text-[#8A9099]">Places</p>
        </div>
      </div>
    </Card>
  );
}

function ContactInfoCard({ profile }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Contact details</h2>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 rounded-[18px] bg-[#F7F8FA] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Mail className="h-5 w-5 text-[#008C78]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#8A9099]">Email</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#101820]">
              {profile.email}
            </p>
          </div>

          {profile.email_verified_at ? (
            <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
          ) : (
            <XCircle className="h-5 w-5 text-[#DC2626]" />
          )}
        </div>

        <div className="flex items-center gap-3 rounded-[18px] bg-[#F7F8FA] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Phone className="h-5 w-5 text-[#008C78]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#8A9099]">Phone</p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#101820]">
              {profile.phone}
            </p>
          </div>

          {profile.phone_verified_at ? (
            <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
          ) : (
            <XCircle className="h-5 w-5 text-[#DC2626]" />
          )}
        </div>
      </div>
    </Card>
  );
}

function SettingsCard({ onSelect }) {
  return (
    <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-[#101820]">Account</h2>

      <div className="mt-4">
        {settingsItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full items-center gap-3 rounded-[18px] p-3 text-left hover:bg-[#F7F8FA]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1FBF9]">
                  <Icon className="h-5 w-5 text-[#008C78]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#101820]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#4B5563]">
                    {item.description}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-[#8A9099]" />
              </button>

              {index !== settingsItems.length - 1 ? (
                <Separator className="my-1 bg-[#E1E5EA]" />
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EditProfileSheet({
  open,
  onOpenChange,
  profileDraft,
  setProfileDraft,
  onSave,
  isSaving,
}) {
  function updateField(field, value) {
    setProfileDraft({
      ...profileDraft,
      [field]: value,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
            Edit profile
          </SheetTitle>

          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            Update your account details.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Full name
            </p>
            <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <UserRound className="h-5 w-5 text-[#7A8088]" />
              <Input
                value={profileDraft.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Full name"
                className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Email
            </p>
            <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <Mail className="h-5 w-5 text-[#7A8088]" />
              <Input
                value={profileDraft.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Email"
                className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#101820]">
              Phone
            </p>
            <div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
              <Phone className="h-5 w-5 text-[#7A8088]" />
              <Input
                value={profileDraft.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Phone"
                className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            )}
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SettingsInfoSheet({ selectedItem, onOpenChange }) {
  const open = Boolean(selectedItem);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-[#E1E5EA] bg-white px-6 pb-6 pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D7DCE2]" />

        <SheetHeader className="text-left">
          <SheetTitle className="text-[24px] font-bold tracking-[-0.03em] text-[#101820]">
            {selectedItem?.title}
          </SheetTitle>

          <SheetDescription className="text-base leading-6 text-[#4B5563]">
            {selectedItem?.description}
          </SheetDescription>
        </SheetHeader>

        <Card className="mt-6 rounded-[24px] border-[#E1E5EA] bg-[#F7F8FA] p-4 shadow-none">
          <p className="text-sm leading-6 text-[#4B5563]">
            This section is UI-only for now. Later, we can wire it to profile,
            payments, notifications, support, or security APIs depending on the
            feature.
          </p>
        </Card>

        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-5 h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
        >
          Done
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const meQuery = useMe();
  const user = meQuery.data?.user;
  const riderQuery = useRiderProfile({
    enabled: user?.role === "rider",
  });
  const driverQuery = useDriverProfile({
    enabled: user?.role === "driver",
  });
  const updateProfileMutation = useUpdateProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const logoutMutation = useLogout();
  const savedPlacesQuery = useSavedPlaces({
    enabled: user?.role === "rider",
  });
  const savedPlaceCount = savedPlacesQuery.data?.length || 0;

  const photoInputRef = useRef(null);

  const [profileDraft, setProfileDraft] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const rider = riderQuery.data?.rider || riderQuery.data;
  const driver = driverQuery.data?.driver || driverQuery.data;
  const profile = useMemo(
    () =>
      makeProfileView({
        user,
        rider,
        driver,
        savedPlaceCount,
      }),
    [user, rider, driver, savedPlaceCount]
  );
  const roleConfig = useMemo(() => getRoleConfig(profile.role), [profile.role]);

  function openEditSheet() {
    setProfileDraft(profile);
    setEditOpen(true);
  }

  async function saveProfile() {
    try {
      await updateProfileMutation.mutateAsync({
        name: profileDraft.name.trim() || profile.name,
        email: profileDraft.email.trim() || profile.email,
        phone: profileDraft.phone.trim() || profile.phone,
      });

      toast.success("Profile updated");
      setEditOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handlePhotoSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadPhotoMutation.mutateAsync(file);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      event.target.value = "";
    }
  }

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setLogoutOpen(false);
      navigate("/auth/login", { replace: true });
    }
  }

  function goBackByRole() {
    if (profile.role === "driver") {
      navigate("/driver/home");
      return;
    }

    if (profile.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    navigate("/rider/home");
  }

  if (meQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <LoadingState label="Loading profile..." />
      </main>
    );
  }

  if (meQuery.isError) {
    return (
      <main className="min-h-screen bg-white px-6 pt-24">
        <ErrorState message="Could not load profile." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-6 pb-8 pt-8">
        <header className="flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={goBackByRole}
            className="h-11 w-11 rounded-full border-[#E1E5EA] bg-white text-[#101820]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
            <h1 className="text-lg font-bold text-[#101820]">Profile</h1>
          </div>

          <Badge className={`rounded-full px-3 py-2 ${roleConfig.className}`}>
            {roleConfig.label}
          </Badge>
        </header>

        <div className="mt-8 space-y-4">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelected}
          />
          <ProfileHero
            profile={profile}
            onEdit={openEditSheet}
            onPhotoClick={() => photoInputRef.current?.click()}
            isUploadingPhoto={uploadPhotoMutation.isPending}
          />
          <ProfileStatsCard profile={profile} />
          <ContactInfoCard profile={profile} />
          <SettingsCard onSelect={setSelectedSettingsItem} />

          <Card className="rounded-[24px] border-[#E1E5EA] bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="flex w-full items-center gap-3 rounded-[18px] p-3 text-left hover:bg-red-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                <LogOut className="h-5 w-5 text-[#DC2626]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#DC2626]">Logout</p>
                <p className="mt-0.5 text-xs text-[#4B5563]">
                  Sign out from this device
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-[#8A9099]" />
            </button>
          </Card>
        </div>

        <EditProfileSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          profileDraft={profileDraft}
          setProfileDraft={setProfileDraft}
          onSave={saveProfile}
          isSaving={updateProfileMutation.isPending}
        />

        <SettingsInfoSheet
          selectedItem={selectedSettingsItem}
          onOpenChange={(open) => {
            if (!open) setSelectedSettingsItem(null);
          }}
        />

        <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <AlertDialogContent className="max-w-[360px] rounded-[24px] border-[#E1E5EA] bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-[#101820]">
                Log out?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-base leading-6 text-[#4B5563]">
                You will return to the login screen.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="h-12 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold text-[#101820]">
                Stay logged in
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleLogout}
                className="h-12 rounded-[14px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C]"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  );
}
