export default function ComingSoon({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-lg border border-line border-dashed p-10 text-center">
      <p className="text-navy font-semibold">{label}</p>
      <p className="text-muted text-sm mt-2">
        Cette section arrive dans une prochaine étape de la mise en place de l&apos;espace contributeurs.
      </p>
    </div>
  );
}
