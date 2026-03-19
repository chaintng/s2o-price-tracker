import { useState } from "react";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { PriceChart } from "./components/PriceChart";
import { SummaryCards } from "./components/SummaryCards";
import { useTicketData } from "./hooks/useTicketData";
import { Interval, TicketKey, TicketLevel, TicketType, TimeRange } from "./types";

const DEFAULT_SELECTED: TicketKey = { level: "vip", type: "All 3 Days" };

export default function App() {
  const [selected, setSelected] = useState<TicketKey>(DEFAULT_SELECTED);
  const [filterLevel, setFilterLevel] = useState<TicketLevel | "all">("all");
  const [filterType, setFilterType] = useState<TicketType | "all">("all");
  const [interval, setInterval] = useState<Interval>("1H");
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");

  const { summaries, ohlc, loading, error, lastUpdated } = useTicketData(
    selected,
    interval,
    timeRange
  );

  return (
    <div className="flex flex-col h-dvh h-screen overflow-hidden bg-surface">
      <Header lastUpdated={lastUpdated} />

      {error && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-bear/10 border border-bear/30 text-xs text-bear">
          Failed to load data: {error}
        </div>
      )}

      <SummaryCards
        summaries={summaries}
        selected={selected}
        filterLevel={filterLevel}
        filterType={filterType}
        onSelect={setSelected}
      />

      <FilterBar
        filterLevel={filterLevel}
        filterType={filterType}
        interval={interval}
        timeRange={timeRange}
        onLevelChange={setFilterLevel}
        onTypeChange={setFilterType}
        onIntervalChange={setInterval}
        onTimeRangeChange={setTimeRange}
      />

      <PriceChart data={ohlc} selected={selected} interval={interval} loading={loading} />
    </div>
  );
}
