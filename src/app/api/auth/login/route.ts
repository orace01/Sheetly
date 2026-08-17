import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    return Response.json(
      { error: "Email ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
  });
}
