import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountsClient } from "./AccountsClient";

export default async function AccountsPage() {
  const user = await requireUser();
  const mappings = await db.vendorMapping.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return <AccountsClient initialMappings={mappings} />;
}
