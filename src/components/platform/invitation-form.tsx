"use client";

import { useActionState } from "react";
import { createOwnerInvitationAction, type InvitationState } from "@/platform/instances/actions";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: InvitationState = { ok: false, message: "" };

export function InvitationForm({ instanceId, defaultEmail }: { instanceId: string; defaultEmail?: string | null }) {
  const [state, action, pending] = useActionState(createOwnerInvitationAction, initial);
  return (
    <form action={action} className="grid gap-4 rounded-xl border bg-card p-5">
      <input type="hidden" name="instanceId" value={instanceId} />
      <div><h2 className="text-lg font-semibold">İşletme sahibi kurulumu</h2><p className="text-sm text-muted-foreground">24 saat geçerli kodu üretin; sahibi `/owner/setup` sayfasına yönlendirin.</p></div>
      <ActionFeedback state={state} />
      <div className="grid gap-2"><Label htmlFor="invite-email">E-posta</Label><Input id="invite-email" name="email" type="email" defaultValue={defaultEmail ?? ""} required /><FieldError errors={state.fieldErrors?.email} /></div>
      {state.setupCode ? <div className="rounded-lg bg-muted p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Bir kez gösterilen kurulum kodu</p><code className="mt-2 block break-all text-sm">{state.setupCode}</code></div> : null}
      <Button type="submit" variant="outline" disabled={pending}>{pending ? "Oluşturuluyor…" : "Yeni kurulum kodu üret"}</Button>
    </form>
  );
}
