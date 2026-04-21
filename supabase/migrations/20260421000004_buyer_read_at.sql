-- Track whether buyer has seen an accepted/declined offer response
ALTER TABLE offers ADD COLUMN IF NOT EXISTS buyer_read_at timestamptz;

-- Allow buyers to update buyer_read_at on their own offers
CREATE POLICY offers_buyer_mark_read ON offers
  FOR UPDATE
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);
