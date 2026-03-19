import { Interval, TicketLevel, TicketType, TimeRange } from "../types";

interface Props {
  filterLevel: TicketLevel | "all";
  filterType: TicketType | "all";
  interval: Interval;
  timeRange: TimeRange;
  onLevelChange: (v: TicketLevel | "all") => void;
  onTypeChange: (v: TicketType | "all") => void;
  onIntervalChange: (v: Interval) => void;
  onTimeRangeChange: (v: TimeRange) => void;
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`pill-btn ${value === o.value ? "pill-btn-active" : "pill-btn-inactive"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const LEVELS: { label: string; value: TicketLevel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Regular", value: "regular" },
  { label: "VIP", value: "vip" },
];

const TYPES: { label: string; value: TicketType | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "3 Days", value: "All 3 Days" },
  { label: "Day 1", value: "Day 1" },
  { label: "Day 2", value: "Day 2" },
  { label: "Day 3", value: "Day 3" },
];

const INTERVALS: { label: string; value: Interval }[] = [
  { label: "2m", value: "2m" },
  { label: "30m", value: "30m" },
  { label: "1H", value: "1H" },
  { label: "4H", value: "4H" },
  { label: "1D", value: "1D" },
];

const RANGES: { label: string; value: TimeRange }[] = [
  { label: "7D", value: "7D" },
  { label: "14D", value: "14D" },
  { label: "30D", value: "30D" },
  { label: "All", value: "All" },
];

export function FilterBar({
  filterLevel,
  filterType,
  interval,
  timeRange,
  onLevelChange,
  onTypeChange,
  onIntervalChange,
  onTimeRangeChange,
}: Props) {
  return (
    <div className="px-4 pb-2 space-y-2 border-b border-border">
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted uppercase tracking-wider w-10 flex-shrink-0">Level</span>
        <PillGroup options={LEVELS} value={filterLevel} onChange={onLevelChange} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted uppercase tracking-wider w-10 flex-shrink-0">Type</span>
        <PillGroup options={TYPES} value={filterType} onChange={onTypeChange} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted uppercase tracking-wider w-10 flex-shrink-0">Bar</span>
        <PillGroup options={INTERVALS} value={interval} onChange={onIntervalChange} />
        <div className="flex gap-1.5 ml-auto overflow-x-auto pb-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => onTimeRangeChange(r.value)}
              className={`pill-btn ${timeRange === r.value ? "pill-btn-active" : "pill-btn-inactive"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
