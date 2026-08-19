"use client";

import { useActionState } from "react";
import { acceptOwnerInvitationAction } from "@/features/owner-setup/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OwnerSetupForm() {
  const [state, action, pending] = useActionState(acceptOwnerInvitationAction, INITIAL_ACTION_STATE);
  return <form action={action} className="grid gap-5"><ActionFeedback state={state} /><div className="grid gap-2"><Label htmlFor="token">Tek kullanımlık kurulum kodu</Label><Input id="token" name="token" autoComplete="one-time-code" required /><FieldError errors={state.fieldErrors?.token} /></div><div className="grid gap-2"><Label htmlFor="name">Adınız</Label><Input id="name" name="name" autoComplete="name" required /><FieldError errors={state.fieldErrors?.name} /></div><div className="grid gap-2"><Label htmlFor="password">Yeni parola</Label><Input id="password" name="password" type="password" autoComplete="new-password" required /><FieldError errors={state.fieldErrors?.password} /></div><div className="grid gap-2"><Label htmlFor="confirmation">Yeni parola tekrar</Label><Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required /><FieldError errors={state.fieldErrors?.confirmation} /></div><Button type="submit" size="lg" disabled={pending}>{pending ? "Hesap hazırlanıyor…" : "İşletme hesabını oluştur"}</Button></form>;
}
