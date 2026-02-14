"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
    expiryDate: string;
}

export default function MembershipCountdown({ expiryDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(expiryDate) - +new Date();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                return `${days} D, ${hours} H, ${minutes} Mnt, ${seconds} Sec`;
            }
            return "EXPIRED";
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryDate]);

    // Show nothing during initial load to prevent flash
    if (!timeLeft) {
        return null;
    }

    if (timeLeft === "EXPIRED") {
        return (
            <div className="  bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-xs font-bold text-red-500 flex items-center gap-2"> Membership Expired
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-2 bg-[#1566fd]/10 border border-[#1566fd2c] rounded-lg">
            <div className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                Remaining:
            </div>
            <div className="text-[12px] font-semibold text-foreground/90 ">
                {timeLeft}
            </div>
        </div>
    );
}
