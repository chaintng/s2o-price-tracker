import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { cutoffDate, toOHLC } from "../lib/ohlc";
import {
  Interval,
  OHLCPoint,
  RawRecord,
  TicketKey,
  TicketLevel,
  TicketType,
  TimeRange,
  ticketKey,
} from "../types";

interface TicketSummary {
  key: TicketKey;
  latestPrice: number | null;
  latestVolume: number | null;
  change24h: number | null; // percentage
}

interface UseTicketDataReturn {
  summaries: TicketSummary[];
  ohlc: OHLCPoint[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Shared cache by timeRange so switching selected ticket doesn't re-fetch
const cache: Record<string, { data: RawRecord[]; fetchedAt: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useTicketData(
  selected: TicketKey,
  interval: Interval,
  timeRange: TimeRange
): UseTicketDataReturn {
  const [allRecords, setAllRecords] = useState<RawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cacheKey = timeRange;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setAllRecords(cached.data);
      setLoading(false);
      setLastUpdated(new Date(cached.fetchedAt));
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    (async () => {
      try {
        let query = supabase
          .schema('temp')
          .from("s2o_historical_price")
          .select("ticket_level, ticket_type, offer_price, offer_volume, created_at")
          .order("created_at", { ascending: true });

        const cutoff = cutoffDate(timeRange);
        if (cutoff) query = query.gte("created_at", cutoff);

        const { data, error: dbError } = await query;
        if (dbError) throw new Error(dbError.message);

        const records = (data ?? []) as RawRecord[];
        cache[cacheKey] = { data: records, fetchedAt: Date.now() };
        setAllRecords(records);
        setLastUpdated(new Date());
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [timeRange]);

  const summaries = useMemo<TicketSummary[]>(() => {
    const byTicket = new Map<string, RawRecord[]>();
    for (const r of allRecords) {
      const k = ticketKey({ level: r.ticket_level, type: r.ticket_type });
      if (!byTicket.has(k)) byTicket.set(k, []);
      byTicket.get(k)!.push(r);
    }

    const now = Date.now();
    const ms24h = 24 * 60 * 60 * 1000;

    return [
      { level: "regular" as TicketLevel, type: "All 3 Days" as TicketType },
      { level: "regular" as TicketLevel, type: "Day 1" as TicketType },
      { level: "regular" as TicketLevel, type: "Day 2" as TicketType },
      { level: "regular" as TicketLevel, type: "Day 3" as TicketType },
      { level: "vip" as TicketLevel, type: "All 3 Days" as TicketType },
      { level: "vip" as TicketLevel, type: "Day 1" as TicketType },
      { level: "vip" as TicketLevel, type: "Day 2" as TicketType },
      { level: "vip" as TicketLevel, type: "Day 3" as TicketType },
    ].map((key) => {
      const recs = byTicket.get(ticketKey(key)) ?? [];
      if (recs.length === 0) {
        return { key, latestPrice: null, latestVolume: null, change24h: null };
      }

      const sorted = [...recs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latest = sorted[0];

      const yesterday = sorted.find(
        (r) => now - new Date(r.created_at).getTime() >= ms24h
      );
      const change24h = yesterday
        ? ((latest.offer_price - yesterday.offer_price) / yesterday.offer_price) * 100
        : null;

      return {
        key,
        latestPrice: latest.offer_price,
        latestVolume: latest.offer_volume,
        change24h,
      };
    });
  }, [allRecords]);

  const ohlc = useMemo<OHLCPoint[]>(() => {
    const filtered = allRecords.filter(
      (r) => r.ticket_level === selected.level && r.ticket_type === selected.type
    );
    return toOHLC(filtered, interval);
  }, [allRecords, selected, interval]);

  return { summaries, ohlc, loading, error, lastUpdated };
}
