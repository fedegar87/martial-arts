-- C.10 — Wrap auth.uid() in (SELECT auth.uid()) nelle policy RLS.
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#performance
--
-- Il wrap permette al planner di valutare auth.uid() come InitPlan (una sola volta per query)
-- invece che come funzione per-row. Effetto trascurabile single-user, ma è la pattern raccomandata
-- prima del multi-tenant.
--
-- La migration è idempotente: ogni ALTER POLICY è avvolto in IF EXISTS perché alcune policy
-- potrebbero essere già state riscritte da esecuzioni precedenti o non esistere su questo
-- ambiente (es. weekly_reflections se 0006 non è stata ancora applicata).
--
-- Le occorrenze di auth.uid() dentro funzioni PL/pgSQL (variabili locali, trigger) sono lasciate
-- intatte: lì viene già chiamato una volta sola.

-- ============================================================
-- 0001_schema.sql — tabelle base
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'user_profiles_owner_select'
             AND polrelid = 'public.user_profiles'::regclass) THEN
    EXECUTE 'ALTER POLICY "user_profiles_owner_select" ON public.user_profiles
      USING (id = (SELECT auth.uid()))';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'user_profiles_owner_update'
             AND polrelid = 'public.user_profiles'::regclass) THEN
    EXECUTE 'ALTER POLICY "user_profiles_owner_update" ON public.user_profiles
      USING (id = (SELECT auth.uid()))
      WITH CHECK (id = (SELECT auth.uid()))';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'user_plan_items_owner'
             AND polrelid = 'public.user_plan_items'::regclass) THEN
    EXECUTE 'ALTER POLICY "user_plan_items_owner" ON public.user_plan_items
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()))';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'practice_logs_owner'
             AND polrelid = 'public.practice_logs'::regclass) THEN
    EXECUTE 'ALTER POLICY "practice_logs_owner" ON public.practice_logs
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()))';
  END IF;
END $$;

-- ============================================================
-- 0006_news_reflections.sql — news_items admin policies + weekly_reflections
-- Le policy admin usano EXISTS con subquery: wrappiamo l'auth.uid() interno.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'news_items_admin_insert'
             AND polrelid = 'public.news_items'::regclass) THEN
    EXECUTE 'ALTER POLICY "news_items_admin_insert" ON public.news_items
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles profile
          WHERE profile.id = (SELECT auth.uid())
            AND profile.school_id = news_items.school_id
            AND profile.role IN (''admin'', ''instructor'')
        )
      )';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'news_items_admin_update'
             AND polrelid = 'public.news_items'::regclass) THEN
    EXECUTE 'ALTER POLICY "news_items_admin_update" ON public.news_items
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles profile
          WHERE profile.id = (SELECT auth.uid())
            AND profile.school_id = news_items.school_id
            AND profile.role IN (''admin'', ''instructor'')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles profile
          WHERE profile.id = (SELECT auth.uid())
            AND profile.school_id = news_items.school_id
            AND profile.role IN (''admin'', ''instructor'')
        )
      )';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'news_items_admin_delete'
             AND polrelid = 'public.news_items'::regclass) THEN
    EXECUTE 'ALTER POLICY "news_items_admin_delete" ON public.news_items
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles profile
          WHERE profile.id = (SELECT auth.uid())
            AND profile.school_id = news_items.school_id
            AND profile.role IN (''admin'', ''instructor'')
        )
      )';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'weekly_reflections_owner'
             AND polrelid = 'public.weekly_reflections'::regclass) THEN
    EXECUTE 'ALTER POLICY "weekly_reflections_owner" ON public.weekly_reflections
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()))';
  END IF;
END $$;

-- ============================================================
-- 0012_training_schedule.sql — policy effettiva si chiama "ts_owner"
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ts_owner'
             AND polrelid = 'public.training_schedule'::regclass) THEN
    EXECUTE 'ALTER POLICY "ts_owner" ON public.training_schedule
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()))';
  END IF;
END $$;

-- ============================================================
-- 0016_profile_account_privacy.sql — account_deletion_requests
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'account_deletion_requests_owner_select'
             AND polrelid = 'public.account_deletion_requests'::regclass) THEN
    EXECUTE 'ALTER POLICY "account_deletion_requests_owner_select"
      ON public.account_deletion_requests
      USING (user_id = (SELECT auth.uid()))';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'account_deletion_requests_owner_insert'
             AND polrelid = 'public.account_deletion_requests'::regclass) THEN
    EXECUTE 'ALTER POLICY "account_deletion_requests_owner_insert"
      ON public.account_deletion_requests
      WITH CHECK (user_id = (SELECT auth.uid()) AND status = ''pending'')';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'account_deletion_requests_admin_select'
             AND polrelid = 'public.account_deletion_requests'::regclass) THEN
    EXECUTE 'ALTER POLICY "account_deletion_requests_admin_select"
      ON public.account_deletion_requests
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles profile
          WHERE profile.id = (SELECT auth.uid())
            AND profile.role = ''admin''
        )
      )';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'account_deletion_requests_admin_update'
             AND polrelid = 'public.account_deletion_requests'::regclass) THEN
    EXECUTE 'ALTER POLICY "account_deletion_requests_admin_update"
      ON public.account_deletion_requests
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles profile
          WHERE profile.id = (SELECT auth.uid())
            AND profile.role = ''admin''
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles profile
          WHERE profile.id = (SELECT auth.uid())
            AND profile.role = ''admin''
        )
      )';
  END IF;
END $$;

-- ============================================================
-- Diagnostica: elenco policy ancora non wrappate.
-- Dopo questa migration la lista deve essere vuota (o contenere solo
-- policy intenzionalmente lasciate fuori).
-- ============================================================

DO $$
DECLARE
  pol RECORD;
  remaining INTEGER := 0;
BEGIN
  FOR pol IN
    SELECT n.nspname AS schema_name, c.relname AS table_name, p.polname AS policy_name
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND (
        (pg_get_expr(p.polqual, p.polrelid) LIKE '%auth.uid()%'
          AND pg_get_expr(p.polqual, p.polrelid) NOT LIKE '%SELECT auth.uid()%')
        OR
        (pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%auth.uid()%'
          AND pg_get_expr(p.polwithcheck, p.polrelid) NOT LIKE '%SELECT auth.uid()%')
      )
  LOOP
    remaining := remaining + 1;
    RAISE NOTICE 'Policy ancora non wrappata: %.%.%',
      pol.schema_name, pol.table_name, pol.policy_name;
  END LOOP;

  IF remaining = 0 THEN
    RAISE NOTICE 'OK: tutte le policy con auth.uid() sono wrappate.';
  END IF;
END $$;
