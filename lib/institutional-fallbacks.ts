import type { InstitutionalPage } from "./types";

/** Contenu de secours si WordPress est indisponible — Mot du Directeur National (FR). */
export const MOT_DU_DIRECTEUR_FALLBACK: InstitutionalPage = {
  title: "Mot du Directeur National",
  content: `
<h2>Anticiper aujourd'hui pour mieux construire l'avenir</h2>
<p>Dans un environnement économique mondial en profonde mutation, la capacité à anticiper les évolutions économiques est devenue une exigence stratégique pour toute politique publique. Pour la Guinée, dont l'économie traverse des transformations majeures, cette exigence est plus essentielle encore.</p>
<p>C'est au cœur de cette ambition que se situe la mission de la <em>Direction Nationale des Prévisions Économiques et de la Conjoncture (DNPEC)</em> : apporter à la décision publique une lecture rigoureuse et prospective de l'économie.</p>
<p><em>Prévoir ne consiste pas simplement à annoncer ce que sera demain. Prévoir, c'est se donner les moyens de mieux comprendre demain pour pouvoir agir dès aujourd'hui.</em></p>
<p>Cette dynamique connaît une avancée majeure avec le développement du <em>modèle SYLI</em>, Modèle d'Équilibre Général Calculable intégrant les spécificités de l'économie guinéenne, ainsi que du <strong>Modèle de Prévision Trimestrielle de type Programmation Financière.</strong> SYLI traduit une ambition claire : renforcer la souveraineté analytique de la Guinée.</p>
<p>Je salue le professionnalisme de l'ensemble des cadres et agents de la DNPEC, et je lance un appel à la <em>communauté scientifique et académique</em> : la construction d'une expertise nationale forte est une œuvre collective. <em>La porte est ouverte à toutes les compétences, à toutes les idées et à toutes les initiatives</em> au service de la Nation.</p>
<p><em>Anticiper pour mieux décider. Analyser pour mieux comprendre. Modéliser pour mieux éclairer. Prévoir pour mieux transformer.</em></p>
<p><em>ABDOULAYE IBRAHIMA DIALLO</em></p>
`,
};

export function institutionalPageFallback(slug: string): InstitutionalPage | null {
  if (slug === "mot-du-directeur-national") return MOT_DU_DIRECTEUR_FALLBACK;
  return null;
}
