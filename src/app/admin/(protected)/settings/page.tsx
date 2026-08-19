import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminDb } from "@/server/dal/admin";
import { requireStaffPage } from "@/server/auth/session";

export default async function SettingsPage() {
  await requireStaffPage("SETTINGS_MANAGE");
  const settings = await (await getAdminDb()).restaurantSettings.findUniqueOrThrow({ where: { id: "singleton" } });
  const initial = Object.fromEntries(
    Object.entries(settings).map(([key, value]) => [key, value instanceof Date ? value.toISOString() : value]),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold">Restoran ayarları</h1>
        <p className="mt-2 text-muted-foreground">Sitenizin içeriğini, görünümünü ve iletişim bilgilerini kolayca yönetin.</p>
      </div>
      <SettingsForm initial={initial} canEditBranding={settings.ownerCanEditBranding} />
    </div>
  );
}
