import type { ReactNode } from "react";

interface ProfilePanelProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ProfilePanel({ title, action, children }: Readonly<ProfilePanelProps>) {
  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-sm font-semibold font-headline text-on-surface">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
