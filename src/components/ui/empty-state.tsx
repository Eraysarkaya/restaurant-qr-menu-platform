import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }: { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-dashed bg-card/50 px-5 py-12 text-center", className)}>{Icon ? <span className="mx-auto grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"><Icon className="size-5" /></span> : null}<h2 className="mt-4 text-lg font-bold">{title}</h2>{description ? <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p> : null}{action ? <div className="mt-4">{action}</div> : null}</div>;
}
