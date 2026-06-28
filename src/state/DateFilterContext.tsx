import React, { createContext, useContext, useState, useCallback } from "react";

export type DatePreset = "today" | "7d" | "30d" | "90d" | "1y" | "all" | "custom";

export interface DateRange {
  from: Date | null;
  to: Date | null;
  preset: DatePreset;
  label: string;
}

interface DateFilterContextValue {
  dateRange: DateRange;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (from: Date, to: Date) => void;
  isWithinRange: (dateStr: string | Date | null | undefined) => boolean;
}

const PRESETS: Record<DatePreset, { label: string; getDates: () => { from: Date | null; to: Date | null } }> = {
  today: {
    label: "Today",
    getDates: () => {
      const now = new Date();
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    },
  },
  "7d": {
    label: "Last 7 Days",
    getDates: () => {
      const to = new Date(); to.setHours(23, 59, 59, 999);
      const from = new Date(); from.setDate(from.getDate() - 6); from.setHours(0, 0, 0, 0);
      return { from, to };
    },
  },
  "30d": {
    label: "Last 30 Days",
    getDates: () => {
      const to = new Date(); to.setHours(23, 59, 59, 999);
      const from = new Date(); from.setDate(from.getDate() - 29); from.setHours(0, 0, 0, 0);
      return { from, to };
    },
  },
  "90d": {
    label: "Last 3 Months",
    getDates: () => {
      const to = new Date(); to.setHours(23, 59, 59, 999);
      const from = new Date(); from.setDate(from.getDate() - 89); from.setHours(0, 0, 0, 0);
      return { from, to };
    },
  },
  "1y": {
    label: "Last 1 Year",
    getDates: () => {
      const to = new Date(); to.setHours(23, 59, 59, 999);
      const from = new Date(); from.setFullYear(from.getFullYear() - 1); from.setHours(0, 0, 0, 0);
      return { from, to };
    },
  },
  all: {
    label: "All Time",
    getDates: () => ({ from: null, to: null }),
  },
  custom: {
    label: "Custom Range",
    getDates: () => ({ from: null, to: null }),
  },
};

const defaultRange: DateRange = {
  ...PRESETS["all"].getDates(),
  preset: "all",
  label: PRESETS["all"].label,
};

const DateFilterContext = createContext<DateFilterContextValue>({
  dateRange: defaultRange,
  setPreset: () => {},
  setCustomRange: () => {},
  isWithinRange: () => true,
});

export function DateFilterProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);

  const setPreset = useCallback((preset: DatePreset) => {
    if (preset === "custom") return; // custom is set via setCustomRange
    const { from, to } = PRESETS[preset].getDates();
    setDateRange({ from, to, preset, label: PRESETS[preset].label });
  }, []);

  const setCustomRange = useCallback((from: Date, to: Date) => {
    setDateRange({
      from,
      to,
      preset: "custom",
      label: `${from.toLocaleDateString()} – ${to.toLocaleDateString()}`,
    });
  }, []);

  const isWithinRange = useCallback((dateStr: string | Date | null | undefined): boolean => {
    if (!dateStr) return true;
    if (!dateRange.from && !dateRange.to) return true;
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return true;
    if (dateRange.from && d < dateRange.from) return false;
    if (dateRange.to && d > dateRange.to) return false;
    return true;
  }, [dateRange]);

  return (
    <DateFilterContext.Provider value={{ dateRange, setPreset, setCustomRange, isWithinRange }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  return useContext(DateFilterContext);
}

export { PRESETS };
