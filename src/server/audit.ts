import "server-only";
import { getDb } from "@/server/db/client";

export type AuditAction =
  | "CATEGORY_CREATE"
  | "CATEGORY_DELETE"
  | "CATEGORY_REORDER"
  | "CATEGORY_UPDATE"
  | "OPENING_HOURS_UPDATE"
  | "PRODUCT_AVAILABILITY_UPDATE"
  | "PRODUCT_CREATE"
  | "PRODUCT_DELETE"
  | "PRODUCT_UPDATE"
  | "PROFILE_UPDATE"
  | "SETTINGS_UPDATE"
  | "STAFF_CREATE"
  | "STAFF_UPDATE"
  | "LEGAL_DOCUMENT_UPDATE"
  | "PRODUCT_DUPLICATE"
  | "CATEGORY_AVAILABILITY_UPDATE";

type AuditSession = {
  user: { id: string };
  session: { ipAddress?: string | null; userAgent?: string | null };
};

export async function recordAuditEvent(
  session: AuditSession,
  action: AuditAction,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, string | number | boolean | null>,
) {
  try {
    await getDb().auditLog.create({
      data: {
        actorId: session.user.id,
        action,
        entityType,
        entityId: entityId ?? null,
        ipAddress: session.session.ipAddress ?? null,
        userAgent: session.session.userAgent?.slice(0, 500) ?? null,
        metadata,
      },
    });
  } catch {
    // İşletme işlemini yarıda bırakmadan sunucu loglarında iz bırakır.
    console.error("Yönetim işlemi denetim günlüğüne yazılamadı.", { action, entityType, entityId });
  }
}
