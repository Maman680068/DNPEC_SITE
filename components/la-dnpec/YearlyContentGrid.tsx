/**
 * Découpe un contenu WordPress "classé par année" (une suite de <h3>Année</h3>
 * suivis chacun d'une liste) en blocs indépendants, affichés dans une grille à
 * 2 colonnes (1 sur mobile). WordPress fournit les années en ordre
 * décroissant, donc un simple flux de grille reproduit le pairage voulu
 * (année la plus récente à gauche, la suivante à droite) sans tri manuel.
 */
function splitByHeading(html: string): { intro: string; blocks: string[] } {
  const parts = html.split(/(?=<h3[\s>])/i);
  if (parts.length <= 1) {
    return { intro: html, blocks: [] };
  }
  const [first, ...rest] = parts;
  return { intro: first.trim().length > 0 ? first : "", blocks: rest };
}

export default function YearlyContentGrid({ html }: { html: string }) {
  const { intro, blocks } = splitByHeading(html);

  if (blocks.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <>
      {intro && <div dangerouslySetInnerHTML={{ __html: intro }} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
        {blocks.map((block, index) => (
          <div key={index} className="min-w-0" dangerouslySetInnerHTML={{ __html: block }} />
        ))}
      </div>
    </>
  );
}
