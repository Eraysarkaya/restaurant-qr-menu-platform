"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ImageInput({
  name,
  label,
  currentUrl,
  removeName,
  aspectClass = "aspect-[16/7] max-w-xl",
  imageClassName = "object-cover",
  onPreviewChange,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  removeName?: string;
  aspectClass?: string;
  imageClassName?: string;
  onPreviewChange?: (url: string) => void;
}) {
  const [preview, setPreview] = useState(currentUrl ?? "");
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div className="grid gap-3">
      <Label htmlFor={name}>{label}</Label>
      {preview ? (
        <div className={cn("relative overflow-hidden rounded-xl border bg-muted", aspectClass)}>
          <Image src={preview} alt={`${label} önizlemesi`} fill sizes="700px" className={imageClassName} unoptimized={preview.startsWith("blob:")} />
        </div>
      ) : (
        <div className={cn("grid place-items-center rounded-xl border border-dashed text-sm text-muted-foreground", aspectClass)}><span className="flex items-center gap-2"><ImagePlus /> Görsel seçilmedi</span></div>
      )}
      <Input id={name} name={name} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); setPreview(url); onPreviewChange?.(url); } }} />
      <p className="text-xs text-muted-foreground">JPEG, PNG veya WebP · en fazla 4 MB</p>
      {currentUrl && removeName ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={removeName} onChange={(event) => { const url = event.target.checked ? "" : currentUrl; setPreview(url); onPreviewChange?.(url); }} /> Mevcut görseli kaldır</label> : null}
    </div>
  );
}
