export function StatCard({
  icon,
  label,
  value,
  sub,
}: Readonly<{
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
}>) {
  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "22px" }}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-extrabold font-headline text-on-surface leading-none">
          {value}
        </p>
        <p className="text-sm font-body text-on-surface-variant mt-0.5">{label}</p>
        {sub && <p className="text-xs font-label text-on-surface-variant mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
