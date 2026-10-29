-- השלמת משפטים פתוחה גם לאורחים (כמו driving_questions ו-road_signs)
-- יש להריץ אחרי sentence_completion.sql. התוצאות נשמרות רק למשתמשים מחוברים.

drop policy if exists "sentencecompletion_read_authenticated" on public.sentencecompletion;
drop policy if exists "sentencecompletion_read_all" on public.sentencecompletion;
create policy "sentencecompletion_read_all"
  on public.sentencecompletion for select
  to anon, authenticated
  using (true);
