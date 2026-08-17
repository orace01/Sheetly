import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DocumentsClient } from "./DocumentsClient";

export default async function DocumentsPage() {
  const user = await requireUser();
  const documents = await db.document.findMany({
    where: { userId: user.id },
    include: { extraction: true },
    orderBy: { createdAt: "desc" },
  });

  return <DocumentsClient initialDocuments={documents} />;
}
