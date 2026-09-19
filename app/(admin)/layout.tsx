import type { Metadata } from "next";
import { Poppins, IBM_Plex_Sans } from "next/font/google";
import "../globals.css";

export const dynamic = "force-dynamic";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Espace contributeurs — DNPEC",
  robots: { index: false, follow: false },
};

/**
 * Racine indépendante (voir Next.js "multiple root layouts") : l'espace
 * contributeurs a son propre <html>/<body>, sans l'en-tête, le menu, le
 * pied de page ni l'assistant du site public (app/(site)/layout.tsx) — mais
 * reprend exactement les mêmes polices et couleurs (globals.css) pour rester
 * visuellement cohérent avec le site.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
