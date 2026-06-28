import { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import TrendIndicator from "./TrendIndicator";

interface Props {
  title: string;
  description: string;
  severity?: "High" | "Medium" | "Low";
  trend?: { value: number; suffix?: string; inverse?: boolean };
  icon?: ReactNode;
}

const stripe = (s?: string) =>
  s === "High"
    ? "hsl(var(--destructive))"
    : s === "Medium"
    ? "hsl(var(--warning))"
    : s === "Low"
    ? "hsl(var(--success))"
    : "hsl(var(--primary))";

export default function InsightCard({ title, description, severity, trend, icon }: Props) {
  return (
    <div className="border border-border rounded-md p-3 bg-card hover:bg-muted/40 transition-colors border-l-4" style={{ borderLeftColor: stripe(severity) }}>
      <div className="flex items-start gap-2 mb-1">
        <span className="text-primary mt-0.5">{icon || <Sparkles className="h-3.5 w-3.5" />}</span>
        <div className="flex-1 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold leading-tight">{title}</span>
          {trend && <TrendIndicator {...trend} />}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-5">{description}</p>
    </div>
  );
}