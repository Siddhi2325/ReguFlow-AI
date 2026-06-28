import { ReactNode } from "react";
import { ChevronRight, Check } from "lucide-react";

export interface JourneyStep {
  label: string;
  count?: number | string;
  progress?: number; // 0-100
  status: "complete" | "active" | "pending";
  icon?: ReactNode;
}

interface Props {
  steps: JourneyStep[];
  variant?: "dashboard" | "compact";
  title?: string;
}

const dot = (s: JourneyStep["status"]) =>
  s === "complete"
    ? "bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]"
    : s === "active"
    ? "bg-primary text-primary-foreground border-primary"
    : "bg-muted text-muted-foreground border-border";

export default function JourneyTracker({ steps, variant = "dashboard", title = "Regulation → Action → Proof" }: Props) {
  if (variant === "compact") {
    return (
      <ol className="relative border-l-2 border-border pl-5 space-y-3 ml-2">
        {steps.map((s, i) => (
          <li key={i} className="relative">
            <span
              className={`absolute -left-[26px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${dot(s.status)}`}
            >
              {s.status === "complete" ? <Check className="h-2.5 w-2.5" /> : i + 1}
            </span>
            <div className="text-sm font-medium">{s.label}</div>
            {s.count !== undefined && (
              <div className="text-xs text-muted-foreground">{s.count}</div>
            )}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="section-container p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground">ReguFlow operating loop</div>
      </div>
      <div className="flex items-stretch gap-1 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={i} className="flex items-stretch flex-1 min-w-[140px]">
            <div className="flex-1 border border-border rounded-md p-3 bg-card transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${dot(s.status)}`}
                >
                  {s.status === "complete" ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide">{s.label}</span>
              </div>
              {s.count !== undefined && (
                <div className="text-lg font-semibold leading-tight">{s.count}</div>
              )}
              {s.progress !== undefined && (
                <div className="h-1 bg-muted rounded mt-2 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${s.progress}%`,
                      background:
                        s.status === "complete"
                          ? "hsl(var(--success))"
                          : s.status === "active"
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground))",
                    }}
                  />
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center px-1 text-muted-foreground/60">
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}