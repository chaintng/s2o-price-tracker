import axios from "axios";
import * as cheerio from "cheerio";
import { TicketLevel, TicketOffer, TicketType } from "./types";

const RESALE_URL = "https://resale.eventpop.me/e/s2o-2026/";

function parseSlug(slug: string): { level: TicketLevel; type: TicketType } | null {
  const lower = slug.toLowerCase();

  const level: TicketLevel = lower.startsWith("vip") ? "vip" : "regular";

  let type: TicketType;
  if (lower.includes("all-3-days") || lower.includes("all3days")) {
    type = "All 3 Days";
  } else if (lower.includes("day-1") || lower.includes("day1")) {
    type = "Day 1";
  } else if (lower.includes("day-2") || lower.includes("day2")) {
    type = "Day 2";
  } else if (lower.includes("day-3") || lower.includes("day3")) {
    type = "Day 3";
  } else {
    return null;
  }

  return { level, type };
}

function parsePrice(text: string): number | null {
  const match = text.match(/฿([\d,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function parseVolume(text: string): number | null {
  const match = text.match(/(\d+)\s+ticket/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

export async function scrapeTickets(): Promise<TicketOffer[]> {
  const response = await axios.get(RESALE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const offers: TicketOffer[] = [];

  $("a[href*='/e/s2o-2026/t/']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const slug = href.split("/t/")[1]?.split("?")[0];
    if (!slug) return;

    const parsed = parseSlug(slug);
    if (!parsed) return;

    const text = $(el).text();
    const price = parsePrice(text);
    const volume = parseVolume(text);

    if (price === null || volume === null) {
      console.warn(`Could not parse price or volume for slug: ${slug}, text: ${text}`);
      return;
    }

    offers.push({
      ticket_level: parsed.level,
      ticket_type: parsed.type,
      offer_price: price,
      offer_volume: volume,
    });
  });

  return offers;
}
