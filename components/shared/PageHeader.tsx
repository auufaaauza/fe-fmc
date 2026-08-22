import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
