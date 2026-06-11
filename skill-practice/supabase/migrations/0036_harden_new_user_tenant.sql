-- M2 — handle_new_user prendeva lo school_id da raw_user_meta_data, che nel
-- self-signup e controllato dal client: in multi-scuola un utente potrebbe
-- assegnarsi a una scuola arbitraria fornendo il suo UUID.
--
-- Hardening: in single-tenant (esattamente una scuola) i metadata NON vengono
-- mai usati per il tenant; si assegna sempre la scuola unica. Il path multi-scuola
-- resta gated da metadata "invito" MA va completato con una validazione contro una
-- allowlist/tabella inviti per email prima della seconda federazione (vedi TODO).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_school_id UUID;
  meta_school TEXT;
  school_count INT;
BEGIN
  SELECT count(*) INTO school_count FROM public.schools;

  IF school_count = 1 THEN
    -- Single-tenant: ignora del tutto i metadata (client-controllati nel self-signup).
    SELECT id INTO target_school_id FROM public.schools LIMIT 1;
  ELSE
    -- Multi-scuola: lo school_id deve arrivare da un invito server-side.
    -- TODO (pre-seconda-federazione): validare meta_school contro una tabella
    -- inviti/allowlist keyed su NEW.email, NON fidarsi del raw metadata da solo.
    meta_school := NEW.raw_user_meta_data->>'school_id';
    IF meta_school IS NULL OR meta_school = '' THEN
      RAISE EXCEPTION 'handle_new_user: school_id obbligatorio nei metadata invito con piu'' scuole';
    END IF;
    SELECT id INTO target_school_id FROM public.schools WHERE id = meta_school::uuid;
    IF target_school_id IS NULL THEN
      RAISE EXCEPTION 'handle_new_user: school_id % dai metadata invito non esiste', meta_school;
    END IF;
  END IF;

  INSERT INTO public.user_profiles
    (id, school_id, display_name, assigned_level_shaolin, assigned_level_taichi)
  VALUES (
    NEW.id,
    target_school_id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    8,
    0
  );

  RETURN NEW;
END;
$$;
