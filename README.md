# Prompt
this project will have 2 app
1. fetcher, 2. chart view

let start with fetcher app

basically, create a typescript that will deploy to lambda aws and it trigger
by schedule

this script will basically scrape this website
https://resale.eventpop.me/e/s2o-2026/

and extract following information

- ticket_level (regular, vip)
- ticket_type (All 3 days, day 1, day2, day3)
- offer price
- offer volume

use these information to insert into supabase db
with
- created at (fetch date time (with timezone)

table s2o_historical_price
