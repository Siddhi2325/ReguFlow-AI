import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { useDateFilter } from "@/state/DateFilterContext";

export default function DateRangeFilter() {
  const { dateRange, setPreset, setCustomRange } = useDateFilter();
  const [open, setOpen] = useState(false);
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  // Sync state with global dateRange
  useEffect(() => {
    setFromVal(dateRange.from ? dateRange.from.toISOString().split("T")[0] : "");
    setToVal(dateRange.to ? dateRange.to.toISOString().split("T")[0] : "");
  }, [dateRange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleApply = () => {
    if (!fromVal || !toVal) return;
    const from = new Date(fromVal);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toVal);
    to.setHours(23, 59, 59, 999);
    setCustomRange(from, to);
    setOpen(false);
  };

  const handleReset = () => {
    setPreset("all");
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-border bg-card hover:bg-muted transition-colors text-foreground h-9 animate-fade-in"
      >
        <Calendar className="h-3.5 w-3.5 text-primary" />
        <span className="text-primary">{dateRange.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-xl p-4 w-72 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-bold text-foreground">Select Calendar Range</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-1">From Date</label>
              <input
                type="date"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-1">To Date</label>
              <input
                type="date"
                value={toVal}
                onChange={(e) => setToVal(e.target.value)}
                className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              onClick={handleReset}
              className="flex-1 border border-border hover:bg-muted text-foreground text-xs font-bold py-2 rounded-lg transition-colors uppercase tracking-wider text-center"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              disabled={!fromVal || !toVal}
              className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity uppercase tracking-wider text-center"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
