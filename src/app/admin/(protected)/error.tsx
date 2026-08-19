"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Admin ekranı yüklenemedi", error); }, [error]);

  return <main className="grid min-h-screen place-items-center bg-[#f3f5f4] p-5"><section className="w-full max-w-md rounded-2xl border bg-white p-7 text-center shadow-sm"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-red-700"><ServerCrash /></span><h1 className="mt-5 text-2xl font-extrabold">Yönetim paneline ulaşılamıyor</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Veritabanı bağlantısı geçici olarak kesilmiş olabilir. Birkaç saniye sonra tekrar deneyin.</p><div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"><Button onClick={reset}><RefreshCw />Tekrar dene</Button><Button asChild variant="outline"><Link href="/">Müşteri sitesine dön</Link></Button></div></section></main>;
}
