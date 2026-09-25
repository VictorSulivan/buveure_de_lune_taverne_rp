"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import beerLogo from "./../../../public/beer.png";
import { NOM_ENTREPRISE } from "@/lib/branding";
const NAV = [
  { href: "/dashboard",                 label: "Dashboard",  icon: "⬡" },
  { href: "/dashboard/ventes",          label: "Ventes",     icon: "💰" },
  { href: "/dashboard/stock",           label: "Stock",      icon: "📦" },
  { href: "/dashboard/clients",         label: "Clients",    icon: "👥" },
  { href: "/dashboard/organisations",   label: "Cie & nations", icon: "🏛️" },
  { href: "/dashboard/banque",          label: "Banque",     icon: "🏦" },
  { href: "/dashboard/calendrier",      label: "Calendrier", icon: "📅" },
];

const RH_NAV = [
  { href: "/dashboard/employes",                label: "Employés",  icon: "👷" },
  { href: "/dashboard/employes/salaires",       label: "Salaires",  icon: "🪙" },
  { href: "/dashboard/employes/primes",         label: "Primes",    icon: "🏆" },
];

type Props = {
  user: { username: string; role: string; name?: string | null };
};

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-[#6b3e22] text-[#f3d7a5] border border-[#a06b3c]"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  // Détecte si on est sur une fiche employé pour afficher les sous-liens
  const employeMatch = pathname.match(/^\/dashboard\/employes\/(\d+)/);
  const employeId = employeMatch?.[1];

  return (
    <aside className="w-60 shrink-0 flex flex-col tavern-wood border-r border-[#e4b56a]/20 h-full shadow-[8px_0_24px_rgba(0,0,0,0.35)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#e4b56a]/15">
        <div className="w-8 h-8 bg-[#6b3e22] border border-[#a06b3c] rounded-lg flex items-center justify-center overflow-hidden">
          <Image 
            src={beerLogo}
            alt="Logo Le Buveur de Lune"
            className="w-6 h-6 object-contain"
          />
        </div>
        <div>
          <p className="font-display text-[#f3d7a5] font-medium text-sm leading-none">{NOM_ENTREPRISE}</p>
          <p className="text-[#f4e6cf]/40 text-xs mt-0.5">L&apos;auberge</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => <NavLink key={item.href} {...item} />)}

        <div className="pt-3 pb-1 px-3">
          <p className="text-white/20 text-xs uppercase tracking-widest">RH</p>
        </div>
        {RH_NAV.map((item) => <NavLink key={item.href} {...item} />)}

        {/* Sous-menu employé si on est sur une fiche */}
        {employeId && (
          <div className="ml-3 pl-3 border-l border-white/10 space-y-1">
            {[
              { href: `/dashboard/employes/${employeId}`,          label: "Fiche",     icon: "👤" },
              { href: `/dashboard/employes/${employeId}/contrats`, label: "Contrats",  icon: "📄" },
            ].map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    active
                      ? "bg-[#6b3e22] text-[#f3d7a5] border border-[#a06b3c]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}>
                  <span>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        )}

      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#6b3e22] border border-[#a06b3c] flex items-center justify-center text-[#e4b56a] text-xs font-medium uppercase">
            {user.username?.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.username}</p>
            <p className="text-white/30 text-xs capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          ← Déconnexion
        </button>
      </div>
    </aside>
  );
}
