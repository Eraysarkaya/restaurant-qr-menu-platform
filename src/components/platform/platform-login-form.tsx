"use client";

import { useActionState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { platformLoginAction } from "@/platform/auth/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlatformLoginForm() {
  const [state, action, pending] = useActionState(platformLoginAction, INITIAL_ACTION_STATE);
  return (
    <form action={action} className="grid gap-5">
      <ActionFeedback state={state} />
      <div className="grid gap-2">
        <Label htmlFor="platform-email">Geliştirici e-postası</Label>
        <Input id="platform-email" name="email" type="email" autoComplete="username" required />
        <FieldError errors={state.fieldErrors?.email} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="platform-password">Parola</Label>
        <Input id="platform-password" name="password" type="password" autoComplete="current-password" required />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
        {pending ? "Doğrulanıyor…" : "Kontrol paneline gir"}
      </Button>
    </form>
  );
}
