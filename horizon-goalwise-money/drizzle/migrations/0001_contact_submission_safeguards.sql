ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS form_started_at bigint, ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT '';
CREATE OR REPLACE FUNCTION public.guard_contact_submission() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.email, 0));
  IF EXISTS (SELECT 1 FROM public.contact_submissions WHERE client_id = NEW.client_id) THEN RETURN NULL; END IF;
  IF NEW.website <> '' THEN RAISE EXCEPTION 'Spam submission rejected' USING ERRCODE = '22023'; END IF;
  IF NEW.form_started_at IS NOT NULL AND extract(epoch from clock_timestamp()) * 1000 - NEW.form_started_at < 3000 THEN RAISE EXCEPTION 'Submission too quick' USING ERRCODE = '22023'; END IF;
  IF char_length(trim(NEW.name)) < 2 OR char_length(NEW.name) > 120 OR char_length(trim(NEW.message)) < 20 OR char_length(NEW.message) > 4000 OR char_length(NEW.email) > 255 OR NEW.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR NEW.topic NOT IN ('pilot','partnership','press','feedback','other') THEN RAISE EXCEPTION 'Invalid contact submission' USING ERRCODE = '22023'; END IF;
  IF (SELECT count(*) FROM public.contact_submissions WHERE lower(email) = NEW.email AND created_at > clock_timestamp() - interval '1 hour') >= 5 THEN RAISE EXCEPTION 'Contact rate limit reached' USING ERRCODE = 'P0001'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_contact_submission() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER contact_submission_guard BEFORE INSERT ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.guard_contact_submission();