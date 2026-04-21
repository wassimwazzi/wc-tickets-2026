-- ============================================================
-- Offer flow improvements
-- ============================================================

-- 1. Enable realtime on offers table so usePendingOffersCount gets live updates
ALTER PUBLICATION supabase_realtime ADD TABLE offers;
-- Full replica identity lets RLS filter work on UPDATE/DELETE events
ALTER TABLE offers REPLICA IDENTITY FULL;

-- 2. Buyer specifies how many tickets they want in the offer
ALTER TABLE offers ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0);

-- 3. Seller can set minimum sell quantity (won't sell fewer than this)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_sell_quantity INTEGER NOT NULL DEFAULT 1 CHECK (min_sell_quantity >= 1);

-- 4. Prevent duplicate pending offers from same buyer on same listing
CREATE UNIQUE INDEX IF NOT EXISTS offers_unique_pending
  ON offers(listing_id, buyer_id)
  WHERE status = 'pending';

-- 5. Trigger: when an offer is accepted →
--    a) deduct quantity from listing
--    b) set listing status to 'sold' or 'pending'
--    c) decline other pending offers if listing is fully sold
CREATE OR REPLACE FUNCTION public.handle_offer_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _new_qty INTEGER;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN

    -- Calculate remaining quantity after this offer
    SELECT GREATEST(0, quantity - NEW.quantity)
    INTO _new_qty
    FROM listings
    WHERE id = NEW.listing_id;

    -- Update listing quantity and status
    UPDATE listings
    SET
      quantity   = _new_qty,
      status     = CASE WHEN _new_qty <= 0 THEN 'sold' ELSE 'pending' END,
      updated_at = NOW()
    WHERE id = NEW.listing_id;

    -- When fully sold, decline all remaining pending offers
    IF _new_qty <= 0 THEN
      UPDATE offers
      SET status = 'declined', updated_at = NOW()
      WHERE listing_id = NEW.listing_id
        AND id <> NEW.id
        AND status = 'pending';
    END IF;

  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_offer_accepted ON public.offers;
CREATE TRIGGER on_offer_accepted
  AFTER UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_offer_accepted();
