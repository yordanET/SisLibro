"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BookOpenIcon } from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          securityCode,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "No se pudo iniciar sesión.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de red. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl p-6 sm:p-8 anim-fade-up"
      style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(44,53,57,0.06)" }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "#2C3539" }}
        >
          <BookOpenIcon className="h-5 w-5" style={{ color: "#F7F5F0" }} />
        </div>
        <div>
          <p
            className="font-body text-xs tracking-[0.25em] uppercase"
            style={{ color: "#8B7D6B" }}
          >
            Acceso privado
          </p>
          <h1 className="font-display text-2xl font-bold" style={{ color: "#2C3539" }}>
            Panel Administrativo
          </h1>
        </div>
      </div>

      <p className="font-body text-sm mb-6" style={{ color: "#8B7D6B" }}>
        Ingresa con correo, contraseña y código de seguridad.
      </p>

      <div className="grid gap-4">
        <label className="font-body text-sm" style={{ color: "#6B635A" }}>
          Correo
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@dominio.com"
            className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
            style={{
              background: "#EFECE5",
              borderColor: "#DDD7CC",
              color: "#2C3539",
            }}
          />
        </label>

        <label className="font-body text-sm" style={{ color: "#6B635A" }}>
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
            style={{
              background: "#EFECE5",
              borderColor: "#DDD7CC",
              color: "#2C3539",
            }}
          />
        </label>

        <label className="font-body text-sm" style={{ color: "#6B635A" }}>
          Código de seguridad
          <input
            type="text"
            required
            value={securityCode}
            onChange={(event) => setSecurityCode(event.target.value)}
            placeholder="SL-SEC-0000"
            className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
            style={{
              background: "#EFECE5",
              borderColor: "#DDD7CC",
              color: "#2C3539",
            }}
          />
        </label>

        {error ? (
          <p className="font-body text-sm" style={{ color: "#9C2B2B" }}>
            {error}
          </p>
        ) : null}

        <button
          className="font-body text-sm px-6 py-2.5 rounded-full transition-all"
          style={{ background: "#2C3539", color: "#F7F5F0" }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Verificando..." : "Iniciar sesión"}
        </button>
      </div>
    </form>
  );
}
