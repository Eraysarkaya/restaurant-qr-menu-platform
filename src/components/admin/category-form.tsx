"use client";

import { useActionState, useId } from "react";
import { saveCategoryAction } from "@/features/admin/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageInput } from "@/components/admin/image-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Initial = { id?: string; name?: string; description?: string | null; sortOrder?: number; isActive?: boolean; imageUrl?: string | null };
export function CategoryForm({ initial = {}, compact = false }: { initial?: Initial; compact?: boolean }) { const [state, action] = useActionState(saveCategoryAction, INITIAL_ACTION_STATE); const uid = useId(); const nameId = `${uid}-category-name`; const sortId = `${uid}-category-sort`; const descriptionId = `${uid}-category-description`; return <form action={action} className="grid gap-4">{initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}<ActionFeedback state={state} /><div className={compact ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}><div className="grid gap-2"><Label htmlFor={nameId}>Kategori adı</Label><Input id={nameId} name="name" defaultValue={initial.name} required maxLength={80} /><FieldError errors={state.fieldErrors?.name} /></div><div className="grid gap-2"><Label htmlFor={sortId}>Sıra</Label><Input id={sortId} name="sortOrder" type="number" min="0" defaultValue={initial.sortOrder ?? 0} /></div></div><div className="grid gap-2"><Label htmlFor={descriptionId}>Açıklama</Label><Textarea id={descriptionId} name="description" defaultValue={initial.description ?? ""} rows={compact ? 2 : 4} maxLength={300} /></div><ImageInput name="image" label="Kategori görseli" currentUrl={initial.imageUrl} removeName="removeImage" aspectClass="aspect-[16/5] max-w-xl" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={initial.isActive ?? true} /> Kategoriyi public menüde göster</label><div><SubmitButton>{initial.id ? "Kategoriyi güncelle" : "Kategori ekle"}</SubmitButton></div></form>; }
