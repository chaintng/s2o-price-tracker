-- Run this in your Supabase SQL editor to create the table

CREATE TABLE IF NOT EXISTS s2o_historical_price (
  id          BIGSERIAL PRIMARY KEY,
  ticket_level VARCHAR(50)  NOT NULL, -- 'regular' | 'vip'
  ticket_type  VARCHAR(100) NOT NULL, -- 'All 3 Days' | 'Day 1' | 'Day 2' | 'Day 3'
  offer_price  INTEGER      NOT NULL, -- lowest listing price in THB
  offer_volume INTEGER      NOT NULL, -- number of tickets available
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_s2o_created_at ON s2o_historical_price (created_at DESC);

-- Index for filtering by ticket type
CREATE INDEX IF NOT EXISTS idx_s2o_ticket ON s2o_historical_price (ticket_level, ticket_type);
