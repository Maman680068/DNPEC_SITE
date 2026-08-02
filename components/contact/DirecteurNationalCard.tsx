type DirecteurNationalCardProps = {
  photo: string;
  name: string;
  title: string;
};

export default function DirecteurNationalCard({ photo, name, title }: DirecteurNationalCardProps) {
  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      <div className="relative aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={name} className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white font-bold text-lg font-heading">{name}</div>
      </div>
      <div className="bg-white px-4 py-3 text-center text-sm text-navy font-semibold border border-line border-t-0">
        {title}
      </div>
    </div>
  );
}
