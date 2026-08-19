import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { InstanceForm } from "@/components/platform/instance-form";

export default function NewInstancePage() {
  return <div className="mx-auto grid max-w-3xl gap-6"><Link href="/platform" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Kurulumlara dön</Link><header><h1 className="text-3xl font-bold">Yeni restoran kurulumu</h1><p className="mt-1 text-muted-foreground">Müşteri verisi veya secret girmeden kurulum metadata’sını oluşturun.</p></header><InstanceForm /></div>;
}
