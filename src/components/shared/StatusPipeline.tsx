interface Step {
  label: string;
  count: number;
  tone?: "default" | "info" | "warning" | "success" | "danger";
}

const toneBg: Record<string, string> = {
  default: "bg-muted text-foreground",
  info: "bg-[hsl(var(--info)/0.12)] text-[hsl(var(--info))]",
  warning: "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]",
  success: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
  danger: "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
};

export default function StatusPipeline({ steps, title }: { steps: Step[]; title?: string }) {
  const total = steps.reduce((a, s) => a + s.count, 0) || 1;
  return (
    <div className="section-container p-4">
      {title && <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</div>}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        {steps.map((s) => (
          <div key={s.label} className={`rounded p-2 ${toneBg[s.tone || "default"]}`}>
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{s.label}</div>
            <div className="text-xl font-semibold leading-tight">{s.count}</div>
          </div>
        ))}
      </div>
      <div className="flex h-2 rounded overflow-hidden border border-border">
        {steps.map((s) => (
          <div
            key={s.label}
            title={`${s.label}: ${s.count}`}
            style={{
              width: `${(s.count / total) * 100}%`,
              background:
                s.tone === "success" ? "hsl(var(--success))"
                : s.tone === "warning" ? "hsl(var(--warning))"
                : s.tone === "danger" ? "hsl(var(--destructive))"
                : s.tone === "info" ? "hsl(var(--info))"
                : "hsl(var(--muted-foreground))",
            }}
          />
        ))}
      </div>
    </div>
  );
}