type Tone = "navy" | "green" | "yellow";

type NodeBoxProps = {
  code: string;
  tone: Tone;
  provisional?: boolean;
  className?: string;
};

const TONE_CLASSES: Record<Tone, string> = {
  navy: "bg-navy text-white shadow-[0_4px_12px_rgba(19,43,94,0.22)]",
  green: "bg-green text-white shadow-[0_4px_12px_rgba(15,107,60,0.22)]",
  yellow: "bg-yellow text-navy-dark shadow-[0_3px_10px_rgba(244,194,39,0.35)]",
};

const PROVISIONAL_BORDER: Record<Tone, string> = {
  navy: "border-2 border-dashed border-yellow",
  green: "border-2 border-dashed border-yellow",
  yellow: "border-2 border-dashed border-navy",
};

export default function NodeBox({ code, tone, provisional, className = "" }: NodeBoxProps) {
  return (
    <div
      className={`min-w-0 flex items-center justify-center text-center font-bold rounded-lg px-3.5 py-3 text-[14px] leading-tight ${TONE_CLASSES[tone]} ${provisional ? PROVISIONAL_BORDER[tone] : ""} ${className}`}
    >
      {code}
      {provisional && "*"}
    </div>
  );
}
