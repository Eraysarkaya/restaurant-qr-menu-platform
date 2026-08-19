"use client";

import { useActionState } from "react";
import { saveOpeningHoursAction } from "@/features/admin/actions";
import { DAY_NAMES } from "@/lib/constants";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";

type Hour = { dayOfWeek: number; isClosed: boolean; openTime: string | null; closeTime: string | null };
export function OpeningHoursForm({ hours }: { hours: Hour[] }) { const [state, action] = useActionState(saveOpeningHoursAction, INITIAL_ACTION_STATE); const map = new Map(hours.map((hour) => [hour.dayOfWeek, hour])); return <form action={action} className="grid gap-5"><ActionFeedback state={state} /><div className="overflow-hidden rounded-xl border bg-card">{DAY_NAMES.map((day, index) => { const hour = map.get(index); return <div key={day} className="grid gap-4 border-b p-5 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><strong>{day}</strong><label className="flex items-center gap-2 text-sm"><input type="checkbox" name={`closed-${index}`} defaultChecked={hour?.isClosed} /> Kapalı</label><label className="grid gap-1 text-xs text-muted-foreground">Açılış<Input type="time" name={`open-${index}`} defaultValue={hour?.openTime ?? "09:00"} /></label><label className="grid gap-1 text-xs text-muted-foreground">Kapanış<Input type="time" name={`close-${index}`} defaultValue={hour?.closeTime ?? "23:00"} /></label></div>; })}</div><div className="flex justify-end"><SubmitButton>Saatleri kaydet</SubmitButton></div></form>; }
