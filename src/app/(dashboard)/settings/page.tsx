import { requireUser } from "@/lib/auth";
import { getQuotaStatus } from "@/lib/quotas";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await requireUser();
  const quota = await getQuotaStatus(user.id, user.plan);

  return (
    <SettingsClient
      user={{ email: user.email, name: user.name, plan: user.plan }}
      quota={quota}
    />
  );
}
