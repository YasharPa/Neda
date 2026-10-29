-- טבלאות תוצאות בחינה וסטטיסטיקות לפי נושא, עם הרשאות לכל משתמש בנפרד

-- תשובות בודדות בבחינת הנהיגה
create table public.user_quiz_results (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id uuid not null,
  question_id bigint not null references public.driving_questions (id) on delete cascade,
  selected_answer integer not null,
  is_correct boolean not null,
  response_time_ms integer,
  created_at timestamptz not null default now()
);

create index user_quiz_results_user_created_idx
  on public.user_quiz_results (user_id, created_at desc);

alter table public.user_quiz_results enable row level security;

create policy "Users read own quiz results"
  on public.user_quiz_results for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own quiz results"
  on public.user_quiz_results for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- סיכום תשובות לפי נושא לכל משתמש
create table public.user_category_stats (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null,
  total_questions integer not null default 0 check (total_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0 and correct_answers <= total_questions),
  last_updated timestamptz not null default now(),
  unique (user_id, category)
);

alter table public.user_category_stats enable row level security;

create policy "Users read own category stats"
  on public.user_category_stats for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own category stats"
  on public.user_category_stats for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own category stats"
  on public.user_category_stats for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- אורחים לא מקבלים גישה בכלל לטבלאות האישיות
revoke all on public.user_quiz_results from anon;
revoke all on public.user_category_stats from anon;

-- עדכון אטומי של סטטיסטיקה לנושא (נקרא מ-drivingAPI.updateCategoryStats)
create function public.update_category_stats(cat text, is_correct boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if cat is null then
    return;
  end if;

  insert into public.user_category_stats (user_id, category, total_questions, correct_answers)
  values (auth.uid(), cat, 1, case when is_correct then 1 else 0 end)
  on conflict (user_id, category) do update
    set total_questions = public.user_category_stats.total_questions + 1,
        correct_answers = public.user_category_stats.correct_answers + case when is_correct then 1 else 0 end,
        last_updated = now();
end;
$$;

revoke execute on function public.update_category_stats(text, boolean) from public, anon;
grant execute on function public.update_category_stats(text, boolean) to authenticated;
