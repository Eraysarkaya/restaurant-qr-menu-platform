"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type RestaurantImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackClassName?: string;
};

export function RestaurantImage({ src, alt, className, fallbackClassName, onError, ...props }: RestaurantImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div role="img" aria-label={`${alt} için görsel bulunamadı`} className={cn("absolute inset-0 grid place-items-center bg-secondary text-muted-foreground", fallbackClassName)}><ImageOff className="size-6" aria-hidden="true" /></div>;
  return <Image src={src} alt={alt} className={className} onError={(event) => { setFailed(true); onError?.(event); }} {...props} />;
}
