"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@rhti.local");
  const [password, setPassword] = useState("Admin@RHTI2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed");

      router.push(data.redirectTo || "/portal/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f0] text-dark">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-dark p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[url('/images/web/footer-bg.webp')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10">
            <img src="/logo/rhti-logo.png" alt="RHTI" className="h-20 w-auto bg-white p-2" />
          </div>
          <div className="relative z-10 max-w-xl">
            <p className="mb-4 text-primary font-black uppercase tracking-[0.3em]">Institution Portal</p>
            <h1 className="text-6xl font-black leading-none text-white">
              Manage Admissions to Graduation
            </h1>
            <p className="mt-6 text-white/70">
              Secure access for administrators, trainers, finance, registrar teams, and students.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <form
            onSubmit={submitLogin}
            className="w-full max-w-md border-t-8 border-primary bg-white p-8 shadow-[0_30px_80px_rgba(24,40,72,0.16)] md:p-10"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-primary text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="m-0 text-3xl font-black leading-none text-dark">Portal Login</h1>
                <p className="m-0 text-xs font-bold uppercase tracking-widest text-dark/40">RHTI IMS</p>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dark/60">
                  <Mail size={14} /> Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="w-full border border-dark/10 bg-accent/20 px-4 py-4 outline-none transition-colors focus:border-primary"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dark/60">
                  <Lock size={14} /> Password
                </span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="w-full border border-dark/10 bg-accent/20 px-4 py-4 outline-none transition-colors focus:border-primary"
                  required
                />
              </label>
            </div>

            {error && <p className="mt-5 border-l-4 border-primary bg-primary/10 p-3 text-sm font-bold text-primary">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-dark disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="mt-6 space-y-2 text-xs text-dark/50">
              <p className="m-0"><strong>Admin:</strong> admin@rhti.local / Admin@RHTI2026</p>
              <p className="m-0"><strong>Student:</strong> student@rhti.local / Student@RHTI2026</p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
