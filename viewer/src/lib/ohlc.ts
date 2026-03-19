import { Interval, OHLCPoint, RawRecord, TimeRange } from "../types";

function getBucketKey(dateStr: string, interval: Interval): string {
  const d = new Date(dateStr);
  switch (interval) {
    case "2m":
      d.setSeconds(0, 0);
      d.setMinutes(Math.floor(d.getMinutes() / 2) * 2);
      break;
    case "30m":
      d.setSeconds(0, 0);
      d.setMinutes(Math.floor(d.getMinutes() / 30) * 30);
      break;
    case "1H":
      d.setMinutes(0, 0, 0);
      break;
    case "4H":
      d.setHours(Math.floor(d.getHours() / 4) * 4, 0, 0, 0);
      break;
    case "1D":
      d.setHours(0, 0, 0, 0);
      break;
  }
  return d.toISOString();
}

export function toOHLC(records: RawRecord[], interval: Interval): OHLCPoint[] {
  if (records.length === 0) return [];

  const sorted = [...records].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const buckets = new Map<string, { prices: number[]; volumes: number[] }>();
  for (const r of sorted) {
    const key = getBucketKey(r.created_at, interval);
    if (!buckets.has(key)) buckets.set(key, { prices: [], volumes: [] });
    buckets.get(key)!.prices.push(r.offer_price);
    buckets.get(key)!.volumes.push(r.offer_volume);
  }

  const result: OHLCPoint[] = [];
  for (const [time, { prices, volumes }] of buckets.entries()) {
    result.push({
      time,
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
      volume: Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length),
    });
  }

  return result.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export function cutoffDate(range: TimeRange): string | null {
  if (range === "All") return null;
  const days = { "7D": 7, "14D": 14, "30D": 30 }[range];
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function formatAxisTime(isoStr: string, interval: Interval): string {
  const d = new Date(isoStr);
  if (interval === "1D") {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}
