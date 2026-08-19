"use client";

import { useActionState } from "react";
import { saveProfileAction } from "@/features/admin/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ name, email }: { name: string; email: string }) { const [state, action] = useActionState(saveProfileAction, INITIAL_ACTION_STATE); return <form action={action} className="grid max-w-2xl gap-6"><ActionFeedback state={state} /><section className="grid gap-5 rounded-xl border bg-card p-6"><div className="grid gap-2"><Label htmlFor="name">Ad soyad</Label><Input id="name" name="name" defaultValue={name} required /><FieldError errors={state.fieldErrors?.name} /></div><div className="grid gap-2"><Label htmlFor="email">E-posta</Label><Input id="email" name="email" type="email" defaultValue={email} required /><FieldError errors={state.fieldErrors?.email} /></div></section><section className="grid gap-5 rounded-xl border bg-card p-6"><div><h2 className="font-heading text-2xl font-bold">Parola değiştir</h2><p className="mt-1 text-sm text-muted-foreground">Değiştirmek istemiyorsanız bu alanları boş bırakın.</p></div><div className="grid gap-2"><Label htmlFor="currentPassword">Mevcut parola</Label><Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" /></div><div className="grid gap-2"><Label htmlFor="newPassword">Yeni parola</Label><Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={12} /><FieldError errors={state.fieldErrors?.newPassword} /></div></section><div><SubmitButton>Profili kaydet</SubmitButton></div></form>; }
