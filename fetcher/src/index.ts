import { ScheduledHandler } from "aws-lambda";
import { scrapeTickets } from "./scraper";
import { insertOffers } from "./db";

export const handler: ScheduledHandler = async (event) => {
  console.log("S2O price fetcher started", { event });

  try {
    const offers = await scrapeTickets();
    console.log(`Scraped ${offers.length} ticket offers`, { offers });

    await insertOffers(offers);

    console.log("S2O price fetcher completed successfully");
  } catch (err) {
    console.error("S2O price fetcher failed", err);
    throw err;
  }
};

// Allow local execution
if (require.main === module) {
  handler({} as any, {} as any, () => {});
}
