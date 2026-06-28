import { AlertTriangle, ArrowRight, Building2, Calendar } from "lucide-react";
import { RiskBadge } from "@/components/shared/Badges";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  regulationId: string;
  risk: "High" | "Medium" | "Low";
  modifiedClauses: number;
  departments: string[];
  recommendation: string;
  deadline: string;
  ctaLabel?: string;
  ctaTo?: string;
}

export default function FocusTodayCard({
  title,
  regulationId,
  risk,
  modifiedClauses,
  departments,
  recommendation,
  deadline,
  ctaLabel = "View Analysis",
  ctaTo = "/change-detection",
}: Props) {
  const nav = useNavigate();
  return (
    <div className="section-container overflow-hidden">
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-0">
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Today's Compliance Priority
          </div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-mono text-xs text-muted-foreground mb-1">{regulationId}</div>
              <h2 className="text-xl font-semibold leading-tight">{title}</h2>
            </div>
            <RiskBadge risk={risk} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Modified Clauses</div>
              <div className="text-2xl font-semibold">{modifiedClauses}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Risk Score</div>
              <div className="text-2xl font-semibold text-[hsl(var(--destructive))]">{risk}</div>
            </div>
          </div>
        </div>
        <div className="p-5 bg-muted/30 flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Building2 className="h-3 w-3" /> Affected Departments
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {departments.map((d) => (
              <span key={d} className="text-xs px-2 py-0.5 border border-border rounded bg-card">
                {d}
              </span>
            ))}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Recommended Action</div>
          <p className="text-sm leading-snug mb-3">{recommendation}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3" /> Deadline: <span className="font-medium text-foreground">{deadline}</span>
          </div>
          <button
            onClick={() => nav(ctaTo)}
            className="mt-auto inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 text-sm font-medium rounded hover:opacity-90 transition-opacity"
          >
            {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}