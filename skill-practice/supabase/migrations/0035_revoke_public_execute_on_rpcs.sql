-- L5 — Le RPC SECURITY DEFINER che mutano stato (piano/esame) ereditano da
-- Postgres il GRANT EXECUTE implicito a PUBLIC: il ruolo anon puo invocarle.
-- Oggi sono protette solo dal null-check `current_user_id IS NULL` nel corpo;
-- qui si rimuove la superficie rendendole eseguibili solo da authenticated.
--
-- Le firme corrispondono alle ultime ridefinizioni (0011/0018/0019/0028).

REVOKE EXECUTE ON FUNCTION public.activate_exam_mode(UUID, UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.activate_exam_mode(UUID, UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.switch_to_exam_mode() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.switch_to_exam_mode() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.switch_to_custom_mode() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.switch_to_custom_mode() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.save_custom_selection(UUID[], discipline) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.save_custom_selection(UUID[], discipline) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_plan_item_status(UUID, plan_status) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.update_plan_item_status(UUID, plan_status) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.hide_plan_item(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.hide_plan_item(UUID) TO authenticated;
