export type TicketLevel = "regular" | "vip";
export type TicketType = "All 3 Days" | "Day 1" | "Day 2" | "Day 3";
export type Interval = "2m" | "30m" | "1H" | "4H" | "1D";
export type TimeRange = "7D" | "14D" | "30D" | "All";

export interface RawRecord {
  ticket_level: TicketLevel;
  ticket_type: TicketType;
  offer_price: number;
  offer_volume: number;
  created_at: string;
}

export interface OHLCPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TicketKey {
  level: TicketLevel;
  type: TicketType;
}

export const ALL_TICKETS: TicketKey[] = [
  { level: "regular", type: "All 3 Days" },
  { level: "regular", type: "Day 1" },
  { level: "regular", type: "Day 2" },
  { level: "regular", type: "Day 3" },
  { level: "vip", type: "All 3 Days" },
  { level: "vip", type: "Day 1" },
  { level: "vip", type: "Day 2" },
  { level: "vip", type: "Day 3" },
];

export function ticketKey(t: TicketKey): string {
  return `${t.level}::${t.type}`;
}
