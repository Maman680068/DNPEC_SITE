/**
 * Met à jour le contenu EN des pages clés déjà seedées (traduction éditoriale).
 * Usage : node scripts/update-wp-en-content.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const file = path.join(__dirname, "..", ".env.local");
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const PAGES = {
  "mot-du-directeur-national-en": {
    title: "Message from the National Director",
    content: `
<h2>Anticipate today to better build tomorrow</h2>
<p>In a global economy undergoing profound change, the ability to anticipate economic developments has become a strategic requirement for any public policy. For Guinea, whose economy is going through major transformations, this requirement is even more essential.</p>
<p>It is at the heart of this ambition that the mission of the <em>National Directorate of Economic Forecasting and the Business Cycle (DNPEC)</em> lies: to provide public decision-making with a rigorous and forward-looking reading of the economy.</p>
<p><em>Forecasting is not simply announcing what tomorrow will be. Forecasting means giving ourselves the means to better understand tomorrow so that we can act today.</em></p>
<p>This dynamic is taking a major step forward with the development of the <em>SYLI model</em>, a Computable General Equilibrium model that integrates the specific features of the Guinean economy, as well as the <strong>Quarterly Forecasting Model based on Financial Programming</strong>. <em>SYLI</em> embodies a clear ambition: to strengthen Guinea’s analytical sovereignty.</p>
<p>I commend the professionalism of all DNPEC staff, and I call on the <em>scientific and academic community</em>: building strong national expertise is a collective endeavour. <em>The door is open to all skills and all ideas</em>.</p>
`,
  },
  "rpae-presentation-en": {
    title: "RPAE — About the journal",
    content: `
<p><em>Proposal pending validation by the National Director.</em></p>
<h2>Journal of Economic Forecasting and Analysis (RPAE)</h2>
<p>The Journal of Economic Forecasting and Analysis (RPAE) is a scientific journal of the National Directorate of Economic Forecasting and the Business Cycle (DNPEC). It publishes original contributions in French and English by specialists in applied economics relating to Guinea.</p>
<p>It welcomes a wide range of contributors: students, researchers, doctors, lecturer-researchers, experts and professionals in public administration. Its ambition is to create a space for exchange between academia and economic administration, highlighting analyses that can inform public decision-making.</p>
<p>Each submitted article is reviewed by a committee of experts within DNPEC before publication. Accepted contributions are classified by author profile (student, expert, doctor, professor) and by topic.</p>
`,
  },
  "rpae-equipe-editoriale-en": {
    title: "RPAE — Editorial team",
    content: `
<p>The RPAE editorial team brings together DNPEC experts responsible for reviewing submissions, classifying contributions and preparing issues of the journal.</p>
<p>Detailed roles and membership of the editorial board will be published here once validated by the National Director.</p>
`,
  },
  "rpae-instructions-auteurs-en": {
    title: "RPAE — Notes for authors",
    content: `
<p>Authors wishing to submit an article to the RPAE are invited to use the online form on this website (Word or Excel file).</p>
<p>Submissions must include the author profile, topic, abstract and the article file. After internal review by the DNPEC scientific committee, only approved publications may appear in the public catalogue of the journal.</p>
`,
  },
  "mission-en": {
    title: "Mission",
    content: `
<p>The National Directorate of Economic Forecasting and the Business Cycle is placed under the authority of the Minister of Economy and Finance. Its main mission is to design, develop and monitor the implementation of the Government’s short-term economic policy.</p>
<p>In this capacity, it is particularly responsible for:</p>
<ul>
<li>setting up forecasting tools and methods for monitoring the national economy;</li>
<li>analysing the data collected and proposing any corrective measures required;</li>
<li>preparing and publishing economic bulletins, including the Monthly Dashboard of the Guinean Economy;</li>
<li>coordinating the activities of the National Committee for the coordination of macroeconomic and monetary policies;</li>
<li>contributing to the preparation of the macroeconomic framework and budget forecasts;</li>
<li>monitoring the performance of the main sectors of the national economy;</li>
<li>producing economic studies and analyses to inform public decision-making.</li>
</ul>
`,
  },
};

async function main() {
  const env = loadEnvLocal();
  const base = env.WORDPRESS_API_URL?.replace(/\/$/, "");
  const user = env.WORDPRESS_APP_USER;
  const pass = env.WORDPRESS_APP_PASSWORD;
  if (!base || !user || !pass) {
    console.error("Missing WordPress env vars");
    process.exit(1);
  }
  const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
  };

  for (const [slug, data] of Object.entries(PAGES)) {
    const list = await fetch(`${base}/pages?slug=${encodeURIComponent(slug)}`, { headers }).then((r) =>
      r.json(),
    );
    if (!list?.[0]?.id) {
      console.log(`skip ${slug} (not found)`);
      continue;
    }
    const id = list[0].id;
    const res = await fetch(`${base}/pages/${id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: data.title, content: data.content, status: "publish" }),
    });
    if (!res.ok) {
      console.error(`fail ${slug}: ${res.status} ${await res.text()}`);
      continue;
    }
    console.log(`updated ${slug} (#${id})`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
