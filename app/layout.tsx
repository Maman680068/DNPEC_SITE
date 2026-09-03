import type { Metadata } from "next";
import { Poppins, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";
import ChatWidget from "@/components/chat/ChatWidget";
import { getLocale, getMessages } from "@/lib/i18n/locale";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return {
    title: {
      default: t.meta.titleDefault,
      template: t.meta.titleTemplate,
    },
    description: t.meta.description,
    icons: {
      icon: [{ url: "/logos/favicon-dnpec.png", type: "image/png" }],
      apple: [{ url: "/logos/favicon-dnpec.png", type: "image/png" }],
      shortcut: "/logos/favicon-dnpec.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${poppins.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SiteHeader />
        <MainNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <ChatWidget />
      </body>
    </html>
  );
}
