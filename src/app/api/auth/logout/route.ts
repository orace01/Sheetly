import { cookies } from "next/headers";
import { clearSessionCookie, destroySessionByToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await destroySessionByToken(token);
  }
  await clearSessionCookie();
  return Response.json({ ok: true });
}
