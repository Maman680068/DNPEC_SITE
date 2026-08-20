import Link from "next/link";
import { FacebookIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from "./SocialIcons";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { localizeHref } from "@/lib/i18n/href";

const usefulHrefs = [
  { key: "presidency" as const, href: "http://www.presidence.gov.gn/" },
  { key: "primature" as const, href: "https://primature.gov.gn/" },
  { key: "government" as const, href: "http://www.gouvernement.gov.gn/" },
  { key: "mef" as const, href: "https://www.mefb.gov.gn/" },
  { key: "budget" as const, href: "https://mbudget.gov.gn/" },
  { key: "plan" as const, href: "https://mpci.gov.gn/" },
  { key: "sgg" as const, href: "https://sgg.gov.gn/" },
  { key: "mines" as const, href: "https://mines.gov.gn/" },
  { key: "bcrg" as const, href: "https://www.bcrg-guinee.org/" },
  { key: "ins" as const, href: "https://www.stat-guinee.org/" },
];

export default async function Footer() {
  const [locale, t] = await Promise.all([getLocale(), getMessages()]);
  const partners =
    locale === "en"
      ? [
          { label: "AfDB", href: "https://www.afdb.org/en/countries/west-africa/guinea" },
          { label: "UNDP", href: "http://www.gn.undp.org/" },
          { label: "World Bank", href: "https://www.worldbank.org/en/country/guinea" },
          { label: "IsDB", href: "https://www.isdb.org/" },
          { label: "BADEA", href: "https://badea.org/" },
        ]
      : [
          { label: "BAD", href: "https://www.afdb.org/fr/pays-afrique-de-louest/guinee" },
          { label: "PNUD", href: "http://www.gn.undp.org/" },
          { label: "BANQUE MONDIALE", href: "https://www.banquemondiale.org/fr/country/guinea" },
          { label: "BID", href: "https://www.isdb.org/fr" },
          { label: "BADEA", href: "https://badea.org/index_fr.htm" },
        ];

  return (
    <footer className="bg-paper text-navy border-t border-line">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1.1fr] gap-8 pt-[52px] pb-9 md:pb-11">
          <div>
            <h4 className="text-navy text-base tracking-wide mb-5 pb-3 border-b-2 border-yellow font-bold font-heading">
              {t.footer.usefulLinks}
            </h4>
            <ul className="list-none">
              {usefulHrefs.map((link) => (
                <li
                  key={link.href}
                  className="relative pl-4 mb-3.5 text-[14.5px] before:content-[''] before:absolute before:left-0 before:top-2 before:w-[5px] before:h-[5px] before:rounded-full before:bg-green"
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy opacity-75 hover:opacity-100 hover:text-green"
                  >
                    {t.footer[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-navy text-base tracking-wide mb-5 pb-3 border-b-2 border-yellow font-bold font-heading">
              {t.footer.partners}
            </h4>
            <ul className="list-none">
              {partners.map((link) => (
                <li
                  key={link.href}
                  className="relative pl-4 mb-3.5 text-[14.5px] before:content-[''] before:absolute before:left-0 before:top-2 before:w-[5px] before:h-[5px] before:rounded-full before:bg-green"
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy opacity-75 hover:opacity-100 hover:text-green"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-navy text-base tracking-wide mb-5 pb-3 border-b-2 border-yellow font-bold font-heading">
              {t.footer.contact}
            </h4>
            <p className="text-[14.5px] leading-loose mb-3.5 text-muted whitespace-pre-line">
              {t.footer.address}
              {"\n"}
              infos@dnpec.gov.gn
              {"\n"}
              +224 662 46 45 67
            </p>
            <div className="flex gap-2.5">
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#E9F0FF" }}>
                <FacebookIcon />
              </span>
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FFE9E9" }}>
                <YoutubeIcon />
              </span>
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#E8F5FE" }}>
                <TwitterIcon />
              </span>
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#E8F0FA" }}>
                <LinkedinIcon />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-line">
        <div className="wrap flex flex-col sm:flex-row gap-3 justify-between items-center py-4.5 text-[12.5px] text-navy font-semibold">
          <span>
            {t.footer.copyright} ·{" "}
            <Link href={localizeHref(locale, "/mentions-legales")} className="underline opacity-80 hover:opacity-100">
              {t.footer.legal}
            </Link>
          </span>
          <div className="flex gap-3">
            <span className="w-[30px] h-[30px] rounded-full bg-paper border border-line flex items-center justify-center">
              <FacebookIcon size={15} />
            </span>
            <span className="w-[30px] h-[30px] rounded-full bg-paper border border-line flex items-center justify-center">
              <YoutubeIcon size={16} />
            </span>
            <span className="w-[30px] h-[30px] rounded-full bg-paper border border-line flex items-center justify-center">
              <TwitterIcon size={14} />
            </span>
          </div>
        </div>
      </div>
      <div className="flag-strip" style={{ height: 6 }} />
    </footer>
  );
}
