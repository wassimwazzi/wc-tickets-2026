-- Add counteroffer fields to offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS counteroffer_amount numeric(10,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS counteroffer_message text;

-- Extend status to include 'countered'
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check
  CHECK (status IN ('pending','accepted','declined','withdrawn','completed','countered'));
