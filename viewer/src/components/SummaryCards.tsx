import { TicketKey, TicketLevel, TicketType, ticketKey } from "../types";

interface Summary {
  key: TicketKey;
  latestPrice: number | null;
  latestVolume: number | null;
  change24h: number | null;
}

interface Props {
  summaries: Summary[];
  selected: TicketKey;
  filterLevel: TicketLevel | "all";
  filterType: TicketType | "all";
  onSelect: (t: TicketKey) => void;
}

function levelLabel(level: TicketLevel) {
  return level === "vip" ? "VIP" : "REG";
}

function typeShort(type: TicketType) {
  const map: Record<TicketType, string> = {
    "All 3 Days": "3D",
    "Day 1": "D1",
    "Day 2": "D2",
    "Day 3": "D3",
  };
  return map[type];
}

export function SummaryCards({ summaries, selected, filterLevel, filterType, onSelect }: Props) {
  const visible = summaries.filter((s) => {
    if (filterLevel !== "all" && s.key.level !== filterLevel) return false;
    if (filterType !== "all" && s.key.type !== filterType) return false;
    return true;
  });

  return (
    <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
      {visible.map((s) => {
        const isSelected = ticketKey(s.key) === ticketKey(selected);
        const isUp = s.change24h !== null && s.change24h >= 0;
        const changeColor = s.change24h === null ? "text-muted" : isUp ? "text-bull" : "text-bear";

        return (
          <button
            key={ticketKey(s.key)}
            onClick={() => onSelect(s.key)}
            className={[
              "flex-shrink-0 flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200 min-w-[100px]",
              isSelected
                ? "bg-accent/20 border border-accent"
                : "bg-card border border-border hover:border-accent/40",
            ].join(" ")}
          >
            <div className="flex items-center gap-1">
              <span
                className={[
                  "text-[10px] font-bold rounded px-1 py-0.5",
                  s.key.level === "vip"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-accent/20 text-accent",
                ].join(" ")}
              >
                {levelLabel(s.key.level)}
              </span>
              <span className="text-[10px] text-muted font-medium">{typeShort(s.key.type)}</span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              {s.latestPrice !== null ? `฿${s.latestPrice.toLocaleString()}` : "—"}
            </p>
            <p className={`text-[10px] font-medium ${changeColor}`}>
              {s.change24h !== null
                ? `${s.change24h >= 0 ? "+" : ""}${s.change24h.toFixed(1)}%`
                : "No data"}
            </p>
            {s.latestVolume !== null && (
              <p className="text-[10px] text-muted">{s.latestVolume} avail</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
