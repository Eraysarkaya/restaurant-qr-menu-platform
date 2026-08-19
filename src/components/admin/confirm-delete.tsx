"use client";

import { Archive, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

function ArchiveSubmit() {
  const { pending } = useFormStatus();
  return <AlertDialogAction type="submit" disabled={pending} className="bg-destructive text-white hover:bg-destructive/90">{pending ? <Loader2 className="animate-spin" /> : <Archive />}{pending ? "Arşivleniyor…" : "Arşivle"}</AlertDialogAction>;
}

export function ConfirmDelete({ id, title, description, action }: { id: string; title: string; description: string; action: (formData: FormData) => Promise<void> }) {
  return <AlertDialog><AlertDialogTrigger asChild><Button type="button" size="sm" variant="ghost" className="text-destructive"><Archive /> Arşivle</Button></AlertDialogTrigger><AlertDialogContent><form action={action}><input type="hidden" name="id" value={id} /><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="mt-6"><AlertDialogCancel>Vazgeç</AlertDialogCancel><ArchiveSubmit /></AlertDialogFooter></form></AlertDialogContent></AlertDialog>;
}
