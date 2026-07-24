import type { Metadata } from "next";
import { Poppins, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";

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
  title: {
    default: "DNPEC — Direction Nationale des Prévisions Économiques et de la Conjoncture",
    template: "%s — DNPEC",
  },
  description:
    "Site institutionnel de la Direction Nationale des Prévisions Économiques et de la Conjoncture (DNPEC), République de Guinée : publications, indicateurs macroéconomiques, actualités et données de conjoncture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SiteHeader />
        <MainNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
