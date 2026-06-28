import { ReactNode } from "react";
import TrendIndicator from "./TrendIndicator";

interface SubMetric {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}

interface Props {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  icon?: ReactNode;
  trend?: { value: number; suffix?: string; inverse?: boolean; label?: string };
  progress?: { current: number; target: number; label?: string };
  subMetrics?: SubMetric[];
}

const toneClass: Record<string, string> = {
  default: "text-foreground",
  success: "text-[hsl(var(--success))]",
  warning: "text-[hsl(var(--warning))]",
  danger: "text-[hsl(var(--destructive))]",
  info: "text-[hsl(var(--info))]",
};

export default function EnhancedKpiCard({ label, value, tone = "default", icon, trend, progress, subMetrics }: Props) {
  return (
    <div className="kpi-card flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2 mb-1">
        <div className={`text-2xl font-semibold leading-none ${toneClass[tone]}`}>{value}</div>
        {trend && <TrendIndicator {...trend} />}
      </div>
      {progress && (
        <div className="mt-2">
          <div className="h-1.5 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
            <span>{progress.label || "Progress"}</span>
            <span className="tabular-nums">{progress.current} / {progress.target}</span>
          </div>
        </div>
      )}
      {subMetrics && subMetrics.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border grid grid-cols-2 gap-x-3 gap-y-1">
          {subMetrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{m.label}</span>
              <span className={`font-semibold tabular-nums ${m.tone ? toneClass[m.tone] : ""}`}>{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}