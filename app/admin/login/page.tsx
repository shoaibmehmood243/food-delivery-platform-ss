"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Invalid email or password. Please try again.");
        setLoading(false);
      } else {
        router.push("/admin/orders");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-deep text-cream flex items-center justify-center p-4 font-work selection:bg-orange selection:text-ink">
      <div className="max-w-md w-full bg-ink/90 border border-cream/20 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header Branding */}
        <div className="text-center space-y-3 border-b border-cream/10 pb-6">
          <h1 className="font-anton text-3xl text-cream uppercase tracking-wide">
            Admin Portal
          </h1>
          <p className="font-work text-xs text-cream/70">
            Sign in to manage orders, branch status queues, and updates.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red/20 border border-red text-red rounded-xl p-3.5 text-xs text-center font-medium animate-in fade-in">
            🚨 {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="font-anton text-xs text-cream uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@sevensides.pk"
              className="w-full px-4 py-3 bg-teal-deep/50 border border-cream/20 rounded-xl text-cream font-work text-sm focus:outline-none focus:border-orange placeholder:text-cream/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-anton text-xs text-cream uppercase tracking-wider block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-teal-deep/50 border border-cream/20 rounded-xl text-cream font-work text-sm focus:outline-none focus:border-orange placeholder:text-cream/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-orange hover:bg-orange/90 disabled:opacity-50 text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all"
          >
            {loading ? "Signing In..." : "Sign In to Dashboard"}
          </button>
        </form>

        {/* Quick Demo Credentials Help */}
        <div className="bg-cream/5 border border-cream/10 rounded-2xl p-4 text-[11px] font-mono text-cream/60 space-y-1 text-left">
          <p className="text-orange font-bold uppercase tracking-wider">Demo Credentials:</p>
          <p>• Owner: <span className="text-cream">owner@sevensides.pk</span> / <span className="text-cream">password123</span></p>
          <p>• DHA Staff: <span className="text-cream">dha@sevensides.pk</span> / <span className="text-cream">password123</span></p>
          <p>• Cantt Staff: <span className="text-cream">cantt@sevensides.pk</span> / <span className="text-cream">password123</span></p>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="font-mono text-xs text-cream/50 hover:text-orange transition-colors">
            ← Return to Seven Sides Website
          </Link>
        </div>
      </div>
    </div>
  );
}
