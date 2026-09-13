"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() || undefined, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/documents");
    router.refresh();
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--mint-bg)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: "var(--forest)",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(61,220,132,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Card */}
      <div
        className="anim-fade-up card"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: "1.25rem",
          padding: "2.5rem",
          position: "relative",
          zIndex: 2,
          boxShadow: "0 8px 40px rgba(11,61,46,0.15)",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "block",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--forest)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
            marginBottom: "1.75rem",
          }}
        >
          Sheetly
        </Link>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--forest)",
            marginBottom: "0.375rem",
          }}
        >
          Créer un compte
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
          20 documents offerts par mois, sans carte bancaire.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-dark)",
                marginBottom: "0.375rem",
                letterSpacing: "0.01em",
              }}
            >
              Nom <span style={{ color: "var(--text-light)", fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              className="input-field"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-dark)",
                marginBottom: "0.375rem",
                letterSpacing: "0.01em",
              }}
            >
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="input-field"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-dark)",
                marginBottom: "0.375rem",
                letterSpacing: "0.01em",
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
            <p style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--text-light)" }}>
              8 caractères minimum.
            </p>
          </div>

          {error && (
            <div
              style={{
                borderRadius: "0.625rem",
                padding: "0.625rem 0.875rem",
                fontSize: "0.8rem",
                background: "#fee2e2",
                color: "#991b1b",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="btn-lime"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.75rem",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Création en cours..." : "Créer mon compte →"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--mint-border)",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          Déjà un compte ?{" "}
          <Link
            href="/login"
            style={{ fontWeight: 600, color: "var(--forest)", textDecoration: "none" }}
            className="login-link"
          >
            Se connecter
          </Link>
        </div>
      </div>

      <style>{`
        .login-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
