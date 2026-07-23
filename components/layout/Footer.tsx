import Link from "next/link";
import { FacebookIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from "./SocialIcons";

const sitemapColumns = [
  {
    title: "Présentation",
    links: [
      { label: "Mot du Directeur National", href: "/la-dnpec/mot-du-directeur" },
      { label: "Historique", href: "/la-dnpec/historique" },
      { label: "Mission", href: "/la-dnpec/mission" },
      { label: "Cabinet", href: "/la-dnpec/cabinet" },
      { label: "Organigramme", href: "/la-dnpec/organigramme" },
    ],
  },
  {
    title: "Publications",
    links: [
      { label: "Documents budgétaires", href: "/publications?type=budgetaires" },
      { label: "Documents conjoncturels", href: "/publications?type=conjoncturels" },
      {
        label: "Documents de suivi de l'intégration économique régionale",
        href: "/publications?type=integration-regionale",
      },
      { label: "Rapports", href: "/publications?type=rapports" },
      { label: "Documents de politique économique", href: "/publications?type=politique-economique" },
      { label: "Documents de travail", href: "/publications?type=travail" },
      { label: "Documents statistiques", href: "/publications?type=statistiques" },
      { label: "Autres études", href: "/publications?type=autres" },
    ],
  },
  {
    title: "Données",
    links: [
      { label: "Secteur réel", href: "/donnees#secteur-reel" },
      { label: "Finances publiques (TOFE)", href: "/donnees#tofe" },
      { label: "Balance des paiements", href: "/donnees#balance-paiements" },
      { label: "Situation monétaire intégrée (SMI)", href: "/donnees#smi" },
    ],
  },
  {
    title: "Conférences & séminaires",
    links: [
      { label: "Journées scientifiques", href: "/conferences-seminaires#journees-scientifiques" },
      { label: "Conférences périodiques", href: "/conferences-seminaires#conferences-periodiques" },
      { label: "Séminaires de recherche", href: "/conferences-seminaires#seminaires-recherche" },
    ],
  },
  {
    title: "Revue scientifique",
    links: [
      { label: "Revue scientifique de la DNPEC", href: "/revue-scientifique" },
      { label: "Soumission d'articles", href: "/revue-scientifique#soumission" },
    ],
  },
];

const usefulLinks = [
  { label: "Présidence République", href: "http://www.presidence.gov.gn/" },
  { label: "Primature", href: "https://primature.gov.gn/" },
  { label: "Portail Gouvernement", href: "http://www.gouvernement.gov.gn/" },
  { label: "Ministère de l'Economie et des Finances", href: "https://www.mefb.gov.gn/" },
  { label: "Ministère du Budget", href: "https://mbudget.gov.gn/" },
  { label: "Ministère du Plan et de la Coopération Internationale", href: "https://mpci.gov.gn/" },
  { label: "Secrétariat Général du Gouvernement", href: "https://sgg.gov.gn/" },
  { label: "Ministère des Mines et de la Géologie", href: "https://mines.gov.gn/" },
  { label: "Banque Centrale de la République de Guinée", href: "https://www.bcrg-guinee.org/" },
  { label: "L'Institut National de la Statistique (INS)", href: "https://www.stat-guinee.org/" },
];

const partnerLinks = [
  { label: "BAD", href: "https://www.afdb.org/fr/pays-afrique-de-louest/guinee" },
  { label: "PNUD", href: "http://www.gn.undp.org/" },
  { label: "BANQUE MONDIALE", href: "https://www.banquemondiale.org/fr/country/guinea" },
  { label: "BID", href: "https://www.isdb.org/fr" },
  { label: "BADEA", href: "https://badea.org/index_fr.htm" },
];

export default function Footer() {
  return (
    <footer className="bg-paper text-navy border-t border-line">
      <div className="wrap">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-[52px]">
          {sitemapColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-navy text-base font-bold mb-5 pb-3 border-b-2 border-yellow font-heading">
                {column.title}
              </h4>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-navy opacity-75 hover:opacity-100 hover:text-green hover:underline mb-3.5 leading-snug"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1.1fr] gap-8 py-9 md:py-11">
          <div>
            <h4 className="text-navy text-base tracking-wide mb-5 pb-3 border-b-2 border-yellow font-bold font-heading">
              Liens utiles
            </h4>
            <ul className="list-none">
              {usefulLinks.map((link) => (
                <li key={link.href} className="relative pl-4 mb-3.5 text-[14.5px] before:content-[''] before:absolute before:left-0 before:top-2 before:w-[5px] before:h-[5px] before:rounded-full before:bg-green">
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
              Nos partenaires
            </h4>
            <ul className="list-none">
              {partnerLinks.map((link) => (
                <li key={link.href} className="relative pl-4 mb-3.5 text-[14.5px] before:content-[''] before:absolute before:left-0 before:top-2 before:w-[5px] before:h-[5px] before:rounded-full before:bg-green">
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
              Contact
            </h4>
            <p className="text-[14.5px] leading-loose mb-3.5 text-muted">
              Direction Nationale des Prévisions Économiques et
              <br />
              de la Conjoncture
              <br />
              Kaloum, Conakry – République de Guinée
              <br />
              infos@dnpec.gov.gn
              <br />
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
            COPYRIGHT © 2026 DNPEC — TOUS DROITS RÉSERVÉS ·{" "}
            <Link href="/mentions-legales" className="underline opacity-80 hover:opacity-100">
              Mentions légales
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
