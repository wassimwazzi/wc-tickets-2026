-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trigger function: calls the notify-new-offer edge function on each new offer
CREATE OR REPLACE FUNCTION public.notify_new_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _url text;
  _service_role_key text;
BEGIN
  -- These are set via supabase secrets / app.settings
  _url := current_setting('app.supabase_url', true);
  _service_role_key := current_setting('app.service_role_key', true);

  IF _url IS NULL OR _service_role_key IS NULL THEN
    -- Gracefully skip if settings not configured (e.g. local dev without secrets)
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := _url || '/functions/v1/notify-new-offer',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || _service_role_key,
      'Content-Type', 'application/json'
    ),
    body    := jsonb_build_object('record', row_to_json(NEW))
  );

  RETURN NEW;
EXCEPTION
  -- Never block the insert if the notification fails
  WHEN others THEN
    RAISE WARNING 'notify_new_offer: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Attach trigger: fires after each new offer is inserted
DROP TRIGGER IF EXISTS on_offer_created ON public.offers;
CREATE TRIGGER on_offer_created
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_offer();
