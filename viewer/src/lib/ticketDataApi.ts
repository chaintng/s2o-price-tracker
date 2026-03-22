import { BucketedRecord, Interval } from "../types";
import { supabase } from "./supabase";

export async function fetchTicketBuckets(interval: Interval): Promise<BucketedRecord[]> {
  const { data, error } = await supabase.schema("temp").rpc("s2o_price_buckets", {
    p_interval: interval,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`Missing bucketed data for interval ${interval}`);
  }

  return (data as BucketedRecord[]).sort(
    (left, right) => new Date(left.bucket_at).getTime() - new Date(right.bucket_at).getTime()
  );
}
