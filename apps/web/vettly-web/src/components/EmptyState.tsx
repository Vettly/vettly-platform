export function EmptyState({
  icon,
  title,
  description,
}: Readonly<{
  icon: string;
  title: string;
  description?: string;
}>) {
  return (
    <div className="text-center py-10 space-y-2">
      <span
        className="material-symbols-outlined text-on-surface-variant"
        style={{ fontSize: "48px" }}
      >
        {icon}
      </span>
      <p className="font-headline font-bold text-on-surface">{title}</p>
      {description && (
        <p className="text-sm font-body text-on-surface-variant">{description}</p>
      )}
    </div>
  );
}
