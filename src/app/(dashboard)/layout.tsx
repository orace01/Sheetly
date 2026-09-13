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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        background: "var(--mint-bg)",
      }}
    >
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header
        style={{
          background: "var(--forest)",
          borderBottom: "1px solid var(--forest-rim)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
            gap: "1rem",
          }}
        >
          {/* Brand + Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link
              href="/documents"
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
                letterSpacing: "-0.02em",
              }}
            >
              Sheetly
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.65)",
                    textDecoration: "none",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    transition: "color 150ms, background 150ms",
                  }}
                  className="dash-nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Quota badge */}
            <span
              className={overQuota ? "badge badge-amber" : "badge"}
              style={
                overQuota
                  ? {}
                  : {
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.75)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }
              }
            >
              {quota.used}/{quota.limit} docs · {PLAN_DETAILS[user.plan].label}
            </span>

            {/* Email – hidden on small screens */}
            <span
              style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", display: "none" }}
              className="email-label"
            >
              {user.email}
            </span>

            {/* Logout */}
            <form action={logoutAction}>
              <button
                type="submit"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "0.5rem",
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  transition: "background 150ms, color 150ms",
                }}
                className="logout-btn"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          maxWidth: 1152,
          width: "100%",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        {children}
      </main>

      <style>{`
        .dash-nav-link:hover { color: #fff !important; background: rgba(255,255,255,0.08) !important; }
        .logout-btn:hover { background: rgba(255,255,255,0.15) !important; color: #fff !important; }
        @media (min-width: 640px) { .email-label { display: inline !important; } }
      `}</style>
    </div>
  );
}
