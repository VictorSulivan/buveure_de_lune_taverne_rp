"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { NOM_ENTREPRISE } from "@/lib/branding";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    await signIn("credentials", {
      username,
      password,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  }

  return (
    <main className="tavern-scene relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <img
        src="/textures/tavern-hall.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#120c08]/30" />
      <div className="tavern-card relative z-10 w-full max-w-sm rounded-2xl p-8 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
        <div className="mb-8">
          <p className="font-display text-[#f3d7a5] text-2xl leading-tight">{NOM_ENTREPRISE}</p>
          <p className="text-[#f4e6cf]/45 text-xs mt-1 tracking-wide">Le livre de comptes de l&apos;auberge</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-[#f4e6cf]/55 mb-1.5">Nom d&apos;utilisateur</label>
          <input
            type="text"
            placeholder="ex: johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-dark"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs text-[#f4e6cf]/55 mb-1.5">Mot de passe</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="input-dark pr-10"
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f4e6cf]/35 hover:text-[#f4e6cf]/70 text-xs"
            >
              {showPwd ? "Cacher" : "Voir"}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#6b3e22] hover:bg-[#8a532c] border border-[#a06b3c] text-[#f3d7a5] font-medium text-sm rounded-lg py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Pousser la porte"}
        </button>
      </div>
    </main>
  );
}
