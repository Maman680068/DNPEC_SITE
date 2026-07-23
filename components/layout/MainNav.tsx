"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Actualités", href: "/actualites" },
  { label: "La DNPEC", href: "/la-dnpec" },
  { label: "Publications", href: "/publications" },
  { label: "Données", href: "/donnees" },
  { label: "Conférences & Séminaires", href: "/conferences-seminaires" },
  { label: "Revue Scientifique", href: "/revue-scientifique" },
  { label: "Organigramme", href: "/la-dnpec/organigramme" },
  { label: "Contact", href: "/contact" },
  { label: "Postuler aux enquêtes", href: "/enquetes" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-navy">
      <div className="wrap flex gap-[22px] h-[52px] items-center text-[13.5px] font-medium overflow-x-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href === "/actualites" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap py-1.5 border-b-2 transition-colors ${
                isActive
                  ? "text-white border-yellow"
                  : "text-[#dbe2f0] border-transparent hover:text-white hover:border-yellow"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-label="Rechercher"
          className="ml-auto text-[#dbe2f0] hover:text-white text-lg"
        >
          ⌕
        </button>
      </div>
    </nav>
  );
}
