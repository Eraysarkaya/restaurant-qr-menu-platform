import { OpeningHoursForm } from "@/components/admin/opening-hours-form";
import { getAdminDb } from "@/server/dal/admin";
import { requireStaffPage } from "@/server/auth/session";

export default async function OpeningHoursPage() {
  await requireStaffPage("SETTINGS_MANAGE");
  const hours = await (await getAdminDb()).openingHour.findMany({
    where: { settingsId: "singleton" },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold">Çalışma saatleri</h1>
        <p className="mt-2 text-muted-foreground">Gece yarısını aşan çalışma saatleri desteklenir; örneğin 18:00–02:00.</p>
      </div>
      <OpeningHoursForm hours={hours} />
    </div>
  );
}
