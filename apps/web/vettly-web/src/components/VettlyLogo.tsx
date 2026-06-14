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
      <div
        className="flex items-center justify-center rounded-[9px] bg-secondary-fixed-dim shrink-0"
        style={{ width: size, height: size }}
      >
        <span
          className="material-symbols-outlined text-on-secondary-fixed"
          style={{ fontSize: size * 0.62 }}
        >
          bolt
        </span>
      </div>
      <span className={`font-headline font-bold tracking-tight ${textClassName}`}>
        Vettly
      </span>
    </div>
  );
}
