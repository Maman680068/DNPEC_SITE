import Link from "next/link";
import { getAdminSession } from "@/lib/admin/session";
import { canModerate, canPublishDirectly } from "@/lib/admin/constants";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const SECTIONS = [
  { href: "/espace-contributeurs/actualites", title: "Actualités", description: "Créer ou modifier un article." },
  { href: "/espace-contributeurs/publications", title: "Publications", description: "Documents et rapports du site." },
  { href: "/espace-contributeurs/partenaires", title: "Partenaires", description: "Logos et liens partenaires." },
  {
    href: "/espace-contributeurs/revue-scientifique",
    title: "Revue scientifique",
    description: "Relire, publier ou rejeter les articles soumis (RPAE).",
  },
  {
    href: "/espace-contributeurs/journal",
    title: "Journal des validations",
    description: "Historique de qui a validé ou rejeté quoi.",
    moderatorsOnly: true,
  },
];

export default async function EspaceContributeursAccueil() {
  const session = await getAdminSession();
  const peutPublierDirectement = session ? canPublishDirectly(session.roles) : false;
  const sections = SECTIONS.filter((section) => !section.moderatorsOnly || (session && canModerate(session.roles)));

  return (
    <div>
      <AdminPageHeader
        title={`Bonjour${session ? ` ${session.name}` : ""}`}
        subtitle={
          peutPublierDirectement
            ? "Votre compte publie directement le contenu — sauf la revue scientifique, toujours validée manuellement."
            : "Votre contenu est enregistré en brouillon et sera publié après validation par un administrateur."
        }
      />

      <p className="text-[13.5px] text-muted mb-5">
        Les indicateurs clés et la page Données sont mis à jour à partir du classeur de cadrage.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-white rounded-[10px] p-5 border border-line shadow-[0_8px_24px_rgba(13,32,71,0.06)] hover:shadow-[0_8px_24px_rgba(13,32,71,0.14)] transition-shadow block"
          >
            <div className="w-8 h-1 bg-yellow rounded-full mb-3" />
            <h2 className="text-navy font-semibold text-[15px] mb-1.5">{section.title}</h2>
            <p className="text-muted text-[13px] leading-relaxed">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
