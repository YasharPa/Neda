-- פונקציות סטטיסטיקה: הסכומים מחושבים במסד הנתונים ולא בדפדפן
-- יש להריץ אחרי flashcard_sessions.sql ו-sentence_completion.sql
-- security invoker: ה-RLS של הטבלאות ממשיך לסנן לשורות של המשתמש בלבד

create or replace function public.get_flashcard_stats()
returns table (sessions bigint, cards_reviewed bigint, known bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select count(*), coalesce(sum(total_cards), 0), coalesce(sum(known), 0)
  from public.flashcard_sessions
  where user_id = auth.uid();
$$;

create or replace function public.get_sentence_stats()
returns table (sessions bigint, answered bigint, correct bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select count(*), coalesce(sum(total), 0), coalesce(sum(correct), 0)
  from public.sentence_sessions
  where user_id = auth.uid();
$$;

grant execute on function public.get_flashcard_stats() to authenticated;
grant execute on function public.get_sentence_stats() to authenticated;
