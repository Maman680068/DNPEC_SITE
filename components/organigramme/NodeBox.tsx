type Tone = "navy" | "green" | "yellow";

type NodeBoxProps = {
  code: string;
  tone: Tone;
  provisional?: boolean;
  className?: string;
};

const TONE_CLASSES: Record<Tone, string> = {
  navy: "bg-navy text-white",
  green: "bg-green text-white",
  yellow: "bg-yellow text-navy-dark",
};

// Bordure pointillée dans une couleur qui reste visible sur le fond du bloc.
const PROVISIONAL_BORDER: Record<Tone, string> = {
  navy: "border-2 border-dashed border-yellow",
  green: "border-2 border-dashed border-yellow",
  yellow: "border-2 border-dashed border-navy",
};

export default function NodeBox({ code, tone, provisional, className = "" }: NodeBoxProps) {
  return (
    <div
      className={`min-w-0 flex items-center justify-center text-center font-bold rounded-md px-3 py-2.5 text-[13px] leading-tight ${TONE_CLASSES[tone]} ${provisional ? PROVISIONAL_BORDER[tone] : ""} ${className}`}
    >
      {code}
      {provisional && "*"}
    </div>
  );
}
