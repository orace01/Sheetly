import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const updateSchema = z.object({
  plan: z.enum(["FREE", "STARTER", "CABINET"]),
});

/** Billing is stubbed for this build (no Stripe integration) — this endpoint
 * changes the plan directly so quotas can be exercised end to end. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Requête invalide." }, { status: 400 });

  const updated = await db.user.update({
    where: { id: user.id },
    data: { plan: parsed.data.plan },
  });

  return Response.json({
    user: { id: updated.id, email: updated.email, name: updated.name, plan: updated.plan },
  });
}
