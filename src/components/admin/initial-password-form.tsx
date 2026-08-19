"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changeInitialPasswordAction } from "@/features/auth/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InitialPasswordForm() {
  const [state, action] = useActionState(changeInitialPasswordAction, INITIAL_ACTION_STATE);
  return <form action={action} className="grid gap-5"><ActionFeedback state={state} /><div className="grid gap-2"><Label htmlFor="current-password">Geçici parola</Label><Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required /></div><div className="grid gap-2"><Label htmlFor="new-password">Yeni güçlü parola</Label><Input id="new-password" name="newPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></div><SubmitButton>Parolayı değiştir</SubmitButton>{state.ok ? <Link className="text-center text-sm underline" href="/staff">Operasyon ekranına devam et</Link> : null}</form>;
}
