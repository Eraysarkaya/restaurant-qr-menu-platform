import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";

export function BrandMark({ name, logoUrl, compact = false, subtitle }: { name: string; logoUrl?: string | null; compact?: boolean; subtitle?: string }) {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3">
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--brand-primary)] text-white shadow-sm ring-1 ring-black/5 sm:size-10">
        {logoUrl ? <Image src={logoUrl} alt="" fill sizes="40px" className="bg-white object-contain p-1" /> : <UtensilsCrossed className="size-5" aria-hidden="true" />}
      </span>
      {compact ? null : (
        <span className="min-w-0">
          <span className="block max-w-[12rem] truncate font-heading text-lg font-semibold leading-tight tracking-[-0.025em] sm:text-xl">{name}</span>
          {subtitle ? <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{subtitle}</span> : null}
        </span>
      )}
    </Link>
  );
}
