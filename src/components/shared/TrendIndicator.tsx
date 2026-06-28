import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface Props {
  value: number; // percentage, signed
  suffix?: string;
  inverse?: boolean; // if true, down is good (e.g. risk)
  label?: string;
}

export default function TrendIndicator({ value, suffix = "%", inverse = false, label }: Props) {
  const positive = inverse ? value < 0 : value > 0;
  const negative = inverse ? value > 0 : value < 0;
  const tone = value === 0
    ? "text-muted-foreground border-border bg-muted/40"
    : positive
    ? "text-[hsl(var(--success))] border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.08)]"
    : "text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.08)]";
  const Icon = value === 0 ? Minus : value > 0 ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-semibold border rounded ${tone}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}{suffix}
      {label && <span className="font-normal opacity-75 ml-1">{label}</span>}
    </span>
  );
}