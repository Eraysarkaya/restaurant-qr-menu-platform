"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/lib/action-state";

export function ActionFeedback({ state }: { state: ActionState }) {
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
  if (!state.message) return null;
  return <Alert variant={state.ok ? "default" : "destructive"}><AlertDescription>{state.message}</AlertDescription></Alert>;
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-sm text-destructive">{errors[0]}</p>;
}
