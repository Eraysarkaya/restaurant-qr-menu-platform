import { ProfileForm } from "@/components/admin/profile-form";
import { requireAdminPage } from "@/server/auth/session";

export default async function ProfilePage() {
  const session = await requireAdminPage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold">Profil</h1>
        <p className="mt-2 text-muted-foreground">Yönetici hesabınızı ve parolanızı güncelleyin.</p>
      </div>
      <ProfileForm name={session.user.name} email={session.user.email} />
    </div>
  );
}
