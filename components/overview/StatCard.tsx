import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number | ReactNode;
    loading?: boolean;
    colorClass?: string; // Untuk warna teks/icon (misal: text-blue-500)
    className?: string;  // Untuk styling tambahan (misal: border kuning)
}

export default function StatCard({
    icon,
    label,
    value,
    loading = false,
    colorClass = "text-muted-foreground",
    className = "",
}: StatCardProps) {
    return (
        <div
            className={`bg-card border border-border rounded-lg p-4 md:p-5 relative overflow-hidden shadow-[0_0px_5px_#02020210] flex flex-col items-center justify-center text-center ${className}`}
        >
            <div className={`mb-2 mt-3 rounded-full  ${colorClass}`}>
                {icon}
            </div>
            <div className={`text-[14px] md:text-[19px] font-extrabold tracking-tight ${colorClass}`}>
                {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : value}
            </div>
            <div className="text-[11px] md:text-[12px] text-muted-foreground/70 font-semibold uppercase mt-1">
                {label}
            </div>

        </div>
    );
}