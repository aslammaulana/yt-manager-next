import { Users, Eye, CheckCircle, Clock, Shield } from "lucide-react";
import StatCard from "./StatCard";

interface StatsGridProps {
  loading: boolean;
  profile: any;
  stats: {
    totalChannel: number;
    totalSubs: number;
    totalViews: number;
  };
}

export default function StatsGrid({ loading, profile, stats }: StatsGridProps) {
  // Helper Format Angka
  const formatNumber = (n: number | string) =>
    Number(n || 0).toLocaleString("id-ID");

  // Logic Tampilan (Derived State)
  const isActive = profile?.role && profile.role !== "inactive";
  const roleDisplay = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "User";

  let expiryDisplay = "Lifetime";
  if (profile?.access_expires_at) {
    expiryDisplay = new Date(profile.access_expires_at).toLocaleDateString(
      "id-ID",
      { day: "numeric", month: "long", year: "numeric" }
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-8">
      {/* 1. Status Akun */}
      <StatCard
        label="Status Akun"
        loading={loading}
        value={isActive ? "Aktif" : "Nonaktif"}
        colorClass={isActive ? "text-[#3d455a] dark:text-[#155cfd]" : "text-red-500"}
        icon={<CheckCircle size={30} className="md:w-8 md:h-8" />}
      />

      {/* 2. Status Membership */}
      <StatCard
        label="Status Membership"
        loading={loading}
        value={roleDisplay}
        colorClass="text-[#3d455a] dark:text-[#f3f6f9]"
        icon={<Shield size={30} className="md:w-8 md:h-8" />}
      />

      {/* 3. Masa Aktif (Ada border kuning khusus) */}
      <StatCard
        label="Masa Aktif"
        loading={loading}
        value={expiryDisplay}
        colorClass="text-[#3d455a] dark:text-[#f3f6f9]"
        className="before:absolute before:top-0 before:left-0 before:w-full before:h-[3px] before:bg-[#155cfd]"
        icon={<Clock size={30} className="md:w-8 md:h-8" />}
      />

      {/* 4. Total Channel */}
      <StatCard
        label="Total Channel"
        loading={loading}
        value={stats.totalChannel}
        colorClass="text-[#3d455a] dark:text-[#f3f6f9]"
        icon={<Users size={30} className="md:w-8 md:h-8" />}
      />

      {/* 5. Total Subs */}
      <StatCard
        label="Total Subscribers"
        loading={loading}
        value={formatNumber(stats.totalSubs)}
        colorClass="text-[#3d455a] dark:text-[#f3f6f9]"
        icon={<Users size={30} className="md:w-8 md:h-8" />}
      />

      {/* 6. Total Views */}
      <StatCard
        label="Total Views"
        loading={loading}
        value={formatNumber(stats.totalViews)}
        colorClass="text-[#3d455a] dark:text-[#f3f6f9]"
        icon={<Eye size={30} className="md:w-8 md:h-8" />}
      />
    </div>
  );
}