"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/espace-contributeurs", label: "Accueil" },
  { href: "/espace-contributeurs/actualites", label: "Actualités" },
  { href: "/espace-contributeurs/indicateurs", label: "Indicateurs" },
  { href: "/espace-contributeurs/publications", label: "Publications" },
  { href: "/espace-contributeurs/partenaires", label: "Partenaires" },
  { href: "/espace-contributeurs/revue-scientifique", label: "Revue scientifique" },
  { href: "/espace-contributeurs/journal", label: "Journal des validations" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/espace-contributeurs") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminShellProps = {
  name: string;
  roleLabel: string;
  children: React.ReactNode;
};

export default function AdminShell({ name, roleLabel, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/espace-contributeurs/connexion");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy text-white sticky top-0 z-30">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/10"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {menuOpen ? "✕" : "☰"}
              </span>
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white shrink-0">
              <Image
                src="/logos/logo-dnpec-clean.png"
                alt=""
                width={36}
                height={36}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <span className="font-heading font-semibold text-[15px] truncate">Espace contributeurs</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-[11.5px] text-[#c3cee0]">{roleLabel}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors rounded-md px-3.5 h-9 disabled:opacity-60"
            >
              {loggingOut ? "…" : "Se déconnecter"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <nav
          className={`${
            menuOpen ? "block" : "hidden"
          } lg:block w-full lg:w-64 shrink-0 bg-white border-r border-line lg:min-h-[calc(100vh-64px)]`}
        >
          <ul className="p-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                      active ? "bg-navy text-white" : "text-navy hover:bg-navy/[0.06]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 min-w-0 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
