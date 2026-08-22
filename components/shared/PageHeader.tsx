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
        <h1 className="text-3xl font-black md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl font-bold">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
