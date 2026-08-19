"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
export function LogoutButton() { const router = useRouter(); return <Button variant="ghost" size="sm" aria-label="Güvenli çıkış" onClick={async () => { await authClient.signOut(); router.replace("/admin/login"); router.refresh(); }}><LogOut /><span className="hidden sm:inline">Çıkış</span></Button>; }
