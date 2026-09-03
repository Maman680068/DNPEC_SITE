import type { Locale } from "@/lib/i18n/config";

type DemoReply = {
  keys: string[];
  /** Priorité : plus haut = préféré en cas d’égalité / politesse. */
  weight?: number;
  /** Si true, ne matche que si le message est court (salutation seule). */
  greetingOnly?: boolean;
  fr: string;
  en: string;
};

const ABOUT = {
  fr: `La **DNPEC** est la **Direction Nationale des Prévisions Économiques et de la Conjoncture** de la République de Guinée.

Placée sous l’autorité du Ministre de l’Économie et des Finances, elle conçoit, élabore et suit la **politique économique à court terme** du Gouvernement.

Elle publie notamment des bulletins économiques (TBMEG, notes de conjoncture), développe des outils de prévision et produit des études pour éclairer la décision publique.

→ En savoir plus : [Mission de la DNPEC](/la-dnpec/mission)`,
  en: `**DNPEC** is the **National Directorate of Economic Forecasting and the Business Cycle** of the Republic of Guinea.

Under the Minister of Economy and Finance, it designs, develops and monitors the Government’s **short-term economic policy**.

It publishes economic bulletins (TBMEG, outlook notes), builds forecasting tools and produces studies to inform public decision-making.

→ Learn more: [DNPEC Mission](/la-dnpec/mission)`,
};

const REPLIES: DemoReply[] = [
  {
    weight: 10,
    keys: [
      "dnpec",
      "c'est quoi",
      "c est quoi",
      "quest-ce",
      "qu'est-ce",
      "qu est ce",
      "what is",
      "what's",
      "whats",
      "who is",
      "presenter",
      "présentation",
      "presentation",
      "definition",
      "définition",
      "mission",
      "rôle",
      "role",
      "mandat",
      "attribution",
    ],
    fr: ABOUT.fr,
    en: ABOUT.en,
  },
  {
    weight: 8,
    keys: ["directeur", "director", "mot du", "diallo", "abdoulaye"],
    fr: `Le **Mot du Directeur National** présente la vision de la DNPEC : anticiper aujourd’hui pour mieux construire l’avenir, notamment via des outils modernes de prévision (modèle **SYLI**, modèles trimestriels).

→ Lire le message : [Mot du Directeur National](/la-dnpec/mot-du-directeur)

Vous pouvez aussi lui écrire directement : [Écrire au Directeur National](/ecrire-au-directeur-national)`,
    en: `The **Message from the National Director** sets out DNPEC’s vision: anticipate today to better build tomorrow, including through modern forecasting tools (the **SYLI** model and quarterly models).

→ Read the message: [Message from the National Director](/la-dnpec/mot-du-directeur)

You can also write to him directly: [Write to the National Director](/ecrire-au-directeur-national)`,
  },
  {
    weight: 8,
    keys: ["publication", "document", "rapport", "tbmeg", "tofe", "tbfp", "bulletin"],
    fr: `La DNPEC publie plusieurs familles de documents :

- **Documents prévisionnels** — transition fiscale, perspectives économiques et financières
- **Documents budgétaires** — TBFP, TOFE
- **Documents conjoncturels** — TBMEG, notes hebdomadaires et de conjoncture
- **Analyses & études** — REF, CPIA, notes trimestrielles

→ Parcourir le catalogue : [Publications](/publications)`,
    en: `DNPEC publishes several document families:

- **Forecasting documents** — tax transition, economic and financial outlook
- **Budget documents** — TBFP, TOFE
- **Business-cycle documents** — TBMEG, weekly and outlook notes
- **Analyses & studies** — REF, CPIA, quarterly notes

→ Browse the catalogue: [Publications](/publications)`,
  },
  {
    weight: 8,
    keys: ["rpae", "revue", "scientifique", "soumettre", "journal"],
    fr: `La **Revue de Prévision et d’Analyse Économique (RPAE)** est la revue scientifique de la DNPEC. Elle accueille des contributions en français et en anglais.

→ [Revue scientifique RPAE](/revue-scientifique)  
→ [Soumettre un article](/revue-scientifique/soumettre)`,
    en: `The **Journal of Economic Forecasting and Analysis (RPAE)** is DNPEC’s scientific journal. It welcomes contributions in French and English.

→ [RPAE scientific journal](/revue-scientifique)  
→ [Submit an article](/revue-scientifique/soumettre)`,
  },
  {
    weight: 7,
    keys: ["actualité", "actualite", "événement", "evenement"],
    fr: `Retrouvez les dernières **actualités économiques et de conjoncture** publiées par la DNPEC.

→ [Toutes les actualités](/actualites)`,
    en: `Browse the latest **economic and business-cycle news** published by DNPEC.

→ [All news](/actualites)`,
  },
  {
    weight: 7,
    keys: ["chiffre", "indicateur", "données", "donnees", "statistique"],
    fr: `La page **Quelques chiffres** présente les indicateurs clés suivis par la DNPEC.

→ [Quelques chiffres](/quelques-chiffres)  
→ [Données](/donnees)`,
    en: `The **Key figures** page presents the main indicators monitored by DNPEC.

→ [Key figures](/quelques-chiffres)  
→ [Data](/donnees)`,
  },
  {
    weight: 7,
    keys: ["contact", "adresse", "téléphone", "telephone", "email", "ecrire au"],
    fr: `Pour joindre la DNPEC :

- Formulaire général : [Contact](/contact)
- Message au Directeur National : [Écrire au Directeur National](/ecrire-au-directeur-national)`,
    en: `To reach DNPEC:

- General form: [Contact](/contact)
- Message to the National Director: [Write to the National Director](/ecrire-au-directeur-national)`,
  },
  {
    weight: 7,
    keys: ["organigramme", "organisation", "structure", "cabinet", "équipe dirigeante", "equipe dirigeante", "équipe", "equipe"],
    fr: `La DNPEC dispose d’un **organigramme** et d’une page **Équipe dirigeante**.

→ [Organigramme](/organigramme)  
→ [Équipe dirigeante](/la-dnpec/cabinet)`,
    en: `DNPEC provides an **organisation chart** and a **Leadership team** page.

→ [Organisation chart](/organigramme)  
→ [Leadership team](/la-dnpec/cabinet)`,
  },
  {
    weight: 7,
    keys: ["historique", "histoire", "création", "creation"],
    fr: `L’**historique** de la DNPEC retrace son évolution institutionnelle.

→ [Historique](/la-dnpec/historique)`,
    en: `DNPEC’s **history** traces its institutional development.

→ [History](/la-dnpec/historique)`,
  },
  {
    weight: 6,
    keys: ["claude", "anthropic", "chatgpt", "intelligence artificielle"],
    fr: `Je suis l’assistant officiel du site DNPEC. En production, je m’appuie sur **Claude** (Anthropic).

Pour l’instant, je fonctionne en **mode démonstration** avec une base de connaissances institutionnelle.

Posez-moi une question concrète : mission, publications, RPAE…`,
    en: `I am the official DNPEC website assistant. In production I run on **Claude** (Anthropic).

Right now I am in **demo mode** with an institutional knowledge base.

Ask me something concrete: mission, publications, RPAE…`,
  },
  {
    weight: 1,
    greetingOnly: true,
    keys: ["bonjour", "bonsoir", "salut", "hello", "hey", "good morning", "good evening"],
    fr: `Bonjour — je suis l’**Assistant DNPEC**.

Je peux vous guider sur la mission de la Direction, les publications, la revue RPAE, les actualités ou les contacts.

Que souhaitez-vous explorer ?`,
    en: `Hello — I am the **DNPEC Assistant**.

I can guide you on the Directorate’s mission, publications, the RPAE journal, news or contacts.

What would you like to explore?`,
  },
  {
    weight: 1,
    greetingOnly: true,
    keys: ["merci", "thanks", "thank you", "parfait", "super"],
    fr: `Avec plaisir. N’hésitez pas si vous avez une autre question sur la DNPEC ou le site.`,
    en: `You’re welcome. Feel free to ask another question about DNPEC or the website.`,
  },
];

const FALLBACK = {
  fr: `Je n’ai pas une réponse précise sur ce point dans ma base de démonstration.

Voici ce que je peux vous aider à explorer :
- la [mission](/la-dnpec/mission) de la DNPEC ;
- les [publications](/publications) économiques ;
- la [revue RPAE](/revue-scientifique) ;
- le [contact](/contact).

Reformulez votre question, ou choisissez une suggestion.`,
  en: `I don’t have a precise answer on that in my demo knowledge base.

I can help you explore:
- DNPEC’s [mission](/la-dnpec/mission);
- economic [publications](/publications);
- the [RPAE journal](/revue-scientifique);
- [contact](/contact).

Please rephrase your question, or pick a suggestion.`,
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’]/g, "'");
}

function hasQuestionIntent(normalized: string): boolean {
  return (
    /\?/.test(normalized) ||
    /\b(quoi|comment|pourquoi|quand|ou|quel|quelle|quels|quelles|c'est quoi|quest|who|what|how|why|where|which)\b/.test(
      normalized,
    ) ||
    /\bdnpec\b/.test(normalized)
  );
}

function keyMatches(normalized: string, key: string): boolean {
  const k = normalize(key);
  if (k.length <= 3) {
    // Évite que "ok" / "hi" capturent toute une phrase.
    return new RegExp(`(?:^|[^\\p{L}])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^\\p{L}])`, "u").test(
      normalized,
    );
  }
  return normalized.includes(k);
}

export function demoChatReply(userText: string, locale: Locale): string {
  const normalized = normalize(userText);
  const question = hasQuestionIntent(normalized);
  const shortMessage = normalized.replace(/\s+/g, " ").trim().length < 28;

  let best: DemoReply | null = null;
  let bestScore = 0;

  for (const reply of REPLIES) {
    if (reply.greetingOnly && (question || !shortMessage)) continue;

    let hit = 0;
    for (const key of reply.keys) {
      if (keyMatches(normalized, key)) hit += Math.max(key.length, 4);
    }
    if (hit === 0) continue;

    const score = hit * (reply.weight ?? 5);
    if (score > bestScore) {
      bestScore = score;
      best = reply;
    }
  }

  if (!best) {
    // « c’est quoi la dnpec » sans autre mot-clé → toujours ABOUT
    if (/\bdnpec\b/.test(normalized) || /c'est quoi|qu'est|what is/.test(normalized)) {
      return locale === "en" ? ABOUT.en : ABOUT.fr;
    }
    return locale === "en" ? FALLBACK.en : FALLBACK.fr;
  }
  return locale === "en" ? best.en : best.fr;
}
