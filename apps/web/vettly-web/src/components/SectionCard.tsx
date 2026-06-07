interface SectionCardProps {
  title: string;
  icon: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, icon, action, children }: SectionCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: "20px" }}>
            {icon}
          </span>
          <h2 className="font-headline font-bold text-on-surface">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
