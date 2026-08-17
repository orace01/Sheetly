import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_ACCOUNT_SUGGESTIONS } from "@/lib/constants";
import { ReviewClient } from "./ReviewClient";

export default async function DocumentReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const document = await db.document.findUnique({
    where: { id },
    include: { extraction: true },
  });
  if (!document || document.userId !== user.id) notFound();

  const vendorMappings = await db.vendorMapping.findMany({
    where: { userId: user.id },
    orderBy: { timesUsed: "desc" },
    take: 50,
  });

  const suggestionMap = new Map<string, string>();
  for (const s of DEFAULT_ACCOUNT_SUGGESTIONS) suggestionMap.set(s.code, s.label);
  for (const m of vendorMappings) suggestionMap.set(m.accountCode, m.accountLabel ?? m.accountCode);
  const accountSuggestions = Array.from(suggestionMap, ([code, label]) => ({ code, label }));

  return <ReviewClient document={document} accountSuggestions={accountSuggestions} />;
}
