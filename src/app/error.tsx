"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="container-shell grid min-h-[70vh] place-items-center text-center"><div><h1 className="font-heading text-4xl font-bold">Bir şeyler ters gitti.</h1><p className="mt-3 text-muted-foreground">Sayfayı yenileyebilir veya biraz sonra tekrar deneyebilirsiniz.</p><Button onClick={reset} className="mt-6">Tekrar dene</Button></div></div>; }
