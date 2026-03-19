export type TicketLevel = "regular" | "vip";

export type TicketType = "All 3 Days" | "Day 1" | "Day 2" | "Day 3";

export interface TicketOffer {
  ticket_level: TicketLevel;
  ticket_type: TicketType;
  offer_price: number;
  offer_volume: number;
}
