import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireUser, destroySessionByToken, clearSessionCookie } from "@/lib/auth";
import { SESSION_COOKIE_NAME, PLAN_DETAILS } from "@/lib/constants";
import { getQuotaStatus } from "@/lib/quotas";

async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) await destroySessionByToken(token);
  await clearSessionCookie();
  redirect("/login");
}

const NAV_LINKS = [
  { href: "/documents", label: "Documents" },
  { href: "/accounts", label: "Comptes" },
  { href: "/export", label: "Export" },
  { href: "/settings", label: "Paramètres" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const quota = await getQuotaStatus(user.id, user.plan);
  const overQuota = quota.used > quota.limit;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/documents" className="text-lg font-semibold text-zinc-900 dark:text-white">
              Sheetly
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                overQuota
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {quota.used}/{quota.limit} documents · {PLAN_DETAILS[user.plan].label}
            </span>
            <span className="hidden text-sm text-zinc-500 sm:inline">{user.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
