import { createClient } from "@supabase/supabase-js";
import { TicketOffer } from "./types";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }

  return createClient(url, key);
}

export async function insertOffers(offers: TicketOffer[]): Promise<void> {
  if (offers.length === 0) {
    console.log("No offers to insert.");
    return;
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const rows = offers.map((offer) => ({
    ...offer,
    created_at: now,
  }));

  const { error } = await supabase.from("s2o_historical_price").insert(rows);

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  console.log(`Inserted ${rows.length} records at ${now}`);
}
