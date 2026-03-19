import { Interval, LinePoint, OHLCPoint, RawRecord, SeasonBounds } from "../types";

function getIntervalMs(interval: Interval): number {
  switch (interval) {
    case "10m":
      return 10 * 60 * 1000;
    case "1H":
      return 60 * 60 * 1000;
    case "6H":
      return 6 * 60 * 60 * 1000;
    case "1D":
      return 24 * 60 * 60 * 1000;
  }
}

function getBucketDate(dateStr: string, interval: Interval): Date {
  const d = new Date(dateStr);
  switch (interval) {
    case "10m":
      d.setSeconds(0, 0);
      d.setMinutes(Math.floor(d.getMinutes() / 10) * 10);
      break;
    case "1H":
      d.setMinutes(0, 0, 0);
      break;
    case "6H":
      d.setHours(Math.floor(d.getHours() / 6) * 6, 0, 0, 0);
      break;
    case "1D":
      d.setHours(0, 0, 0, 0);
      break;
  }

  return d;
}

function getBucketKey(dateStr: string, interval: Interval): string {
  return getBucketDate(dateStr, interval).toISOString();
}

function buildBucketTimeline(startIso: string, endIso: string, interval: Interval): string[] {
  const bucketKeys: string[] = [];
  const stepMs = getIntervalMs(interval);
  let cursorMs = getBucketDate(startIso, interval).getTime();
  const endMs = getBucketDate(endIso, interval).getTime();

  while (cursorMs <= endMs) {
    bucketKeys.push(new Date(cursorMs).toISOString());
    cursorMs += stepMs;
  }

  return bucketKeys;
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

  const timeline = buildBucketTimeline(sorted[0].created_at, sorted[sorted.length - 1].created_at, interval);
  const result: OHLCPoint[] = [];
  let previousClose: number | null = null;

  for (const time of timeline) {
    const bucket = buckets.get(time);
    if (bucket) {
      const point = {
        time,
        open: bucket.prices[0],
        high: Math.max(...bucket.prices),
        low: Math.min(...bucket.prices),
        close: bucket.prices[bucket.prices.length - 1],
        volume: Math.round(
          bucket.volumes.reduce((total, value) => total + value, 0) / bucket.volumes.length
        ),
      };
      result.push(point);
      previousClose = point.close;
      continue;
    }

    if (previousClose === null) {
      continue;
    }

    result.push({
      time,
      open: previousClose,
      high: previousClose,
      low: previousClose,
      close: previousClose,
      volume: 0,
    });
  }

  return result;
}

export function toLineSeries(records: RawRecord[], interval: Interval): LinePoint[] {
  if (records.length === 0) return [];

  const sorted = [...records].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const buckets = new Map<string, RawRecord[]>();
  for (const record of sorted) {
    const key = getBucketKey(record.created_at, interval);
    const list = buckets.get(key);
    if (list) {
      list.push(record);
    } else {
      buckets.set(key, [record]);
    }
  }

  const timeline = buildBucketTimeline(sorted[0].created_at, sorted[sorted.length - 1].created_at, interval);
  const result: LinePoint[] = [];
  let previousPrice: number | null = null;

  for (const time of timeline) {
    const bucket = buckets.get(time);
    if (bucket) {
      const latest = bucket[bucket.length - 1];
      const averageVolume =
        bucket.reduce((total, point) => total + point.offer_volume, 0) / bucket.length;

      result.push({
        time,
        price: latest.offer_price,
        volume: Math.round(averageVolume),
      });
      previousPrice = latest.offer_price;
      continue;
    }

    if (previousPrice === null) {
      continue;
    }

    result.push({
      time,
      price: previousPrice,
      volume: 0,
    });
  }

  return result;
}

export function getSeasonBounds(records: RawRecord[]): SeasonBounds {
  if (records.length === 0) {
    return { start: null, end: null };
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return {
    start: sorted[0].created_at,
    end: sorted[sorted.length - 1].created_at,
  };
}

export function formatAxisTime(isoStr: string, interval: Interval): string {
  const d = new Date(isoStr);
  if (interval === "1D") {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }
  if (interval === "10m" || interval === "1H") {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  if (interval === "6H") {
    return (
      d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
      " " +
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  }
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

export function formatDateTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
