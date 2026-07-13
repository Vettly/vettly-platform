export function VettlyLogo({
  size = 34,
  textClassName = "text-xl text-on-surface",
  className = "",
}: {
  size?: number;
  textClassName?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/Vettly_Logo.png"
        alt="Vettly"
        className="rounded-[9px] object-cover shrink-0"
        style={{ width: size, height: size }}
      />
      <span className={`font-headline font-bold tracking-tight ${textClassName}`}>
        Vettly
      </span>
    </div>
  );
}
