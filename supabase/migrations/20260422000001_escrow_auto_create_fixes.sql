-- ============================================================
-- 1. Escrow auto-create on offer acceptance
--    Update handle_offer_accepted to INSERT escrow_transaction
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_offer_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _new_qty INTEGER;
  _seller_id UUID;
  _amount DECIMAL(10,2);
  _currency TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN

    -- Get listing info
    SELECT GREATEST(0, quantity - NEW.quantity), seller_id, price, currency
    INTO _new_qty, _seller_id, _amount, _currency
    FROM listings
    WHERE id = NEW.listing_id;

    -- Use offer amount if listing price is null
    _amount := COALESCE(_amount, NEW.amount);
    _currency := COALESCE(_currency, NEW.currency);

    -- Update listing quantity and status
    UPDATE listings
    SET
      quantity   = _new_qty,
      status     = CASE WHEN _new_qty <= 0 THEN 'sold' ELSE 'available' END,
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

    -- Auto-create escrow transaction (ignore if already exists)
    INSERT INTO escrow_transactions (offer_id, listing_id, buyer_id, seller_id, amount, currency, status)
    VALUES (NEW.id, NEW.listing_id, NEW.buyer_id, _seller_id, _amount, _currency, 'initiated')
    ON CONFLICT DO NOTHING;

  END IF;
  RETURN NEW;
END;
$$;

-- Ensure trigger still exists (recreate in case function was replaced)
DROP TRIGGER IF EXISTS on_offer_accepted ON public.offers;
CREATE TRIGGER on_offer_accepted
  AFTER UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_offer_accepted();

-- ============================================================
-- 2. Add 'cancelled' status to listings (prevent orphaned rows)
-- ============================================================
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('available','pending','sold','cancelled'));

-- ============================================================
-- 3. Add unique constraint on escrow_transactions(offer_id)
--    so ON CONFLICT DO NOTHING works above
-- ============================================================
ALTER TABLE escrow_transactions
  ADD CONSTRAINT escrow_transactions_offer_id_unique UNIQUE (offer_id);
