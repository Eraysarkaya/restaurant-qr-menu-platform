"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getRestaurantStatus, type OpeningHourLike } from "@/lib/opening-hours";

type Status = ReturnType<typeof getRestaurantStatus>;

export function RestaurantStatus({ openingHours, timezone, initialStatus, className = "" }: { openingHours: OpeningHourLike[]; timezone: string; initialStatus: Status; className?: string }) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const update = () => setStatus(getRestaurantStatus(openingHours, timezone));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [openingHours, timezone]);

  return <Badge aria-live="polite" className={`h-8 rounded-full border px-3 ${status.isOpen ? "border-emerald-300/45 bg-emerald-950/55 text-emerald-50" : "border-red-300/45 bg-red-950/55 text-red-50"} ${className}`}>
    <span className={`size-2 rounded-full ${status.isOpen ? "bg-emerald-300" : "bg-red-300"}`} />
    {status.label}
  </Badge>;
}
