import type { LucideIcon } from "@/components/Icons";

interface FormSectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function FormSection({ id, icon: Icon, title, hint, action, children }: FormSectionProps) {
  return (
    <section id={id} className="card p-6 sm:p-8 scroll-mt-6">
      <header className="flex items-start gap-4 mb-7">
        <span className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-primary-50 text-primary">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-ink leading-tight">{title}</h2>
          {hint && <p className="text-sm text-ink-400 mt-1">{hint}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">{children}</div>;
}
