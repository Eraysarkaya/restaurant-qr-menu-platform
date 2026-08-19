import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, className }: { eyebrow: string; title: string; description?: string; className?: string }) {
  return <header className={cn("max-w-3xl", className)}><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">{title}</h1>{description ? <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p> : null}</header>;
}
