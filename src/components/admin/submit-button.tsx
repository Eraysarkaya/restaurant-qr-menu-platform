"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children = "Kaydet", className }: { children?: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className={className}>{pending ? <Loader2 className="animate-spin" /> : null}{pending ? "Kaydediliyor…" : children}</Button>;
}
