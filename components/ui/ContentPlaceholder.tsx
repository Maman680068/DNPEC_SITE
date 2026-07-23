type ContentPlaceholderProps = {
  children: React.ReactNode;
};

/**
 * Emplacement de contenu géré depuis le back-office WordPress (cellule
 * éditoriale). Affiché tant que le WordPress headless n'est pas connecté.
 */
export default function ContentPlaceholder({ children }: ContentPlaceholderProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-white text-muted text-sm p-6 leading-relaxed">
      {children}
    </div>
  );
}
