-- טבלת סשנים של כרטיסיות לימוד (Flashcards)
-- יש להריץ פעם אחת ב-Supabase SQL Editor

create table if not exists public.flashcard_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  deck_type text not null check (deck_type in ('words', 'signs')),
  total_cards integer not null default 0,
  known integer not null default 0,
  partial integer not null default 0,
  unknown integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists flashcard_sessions_user_created_idx
  on public.flashcard_sessions (user_id, created_at desc);

alter table public.flashcard_sessions enable row level security;

drop policy if exists "flashcard_sessions_select_own" on public.flashcard_sessions;
create policy "flashcard_sessions_select_own"
  on public.flashcard_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "flashcard_sessions_insert_own" on public.flashcard_sessions;
create policy "flashcard_sessions_insert_own"
  on public.flashcard_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "flashcard_sessions_delete_own" on public.flashcard_sessions;
create policy "flashcard_sessions_delete_own"
  on public.flashcard_sessions for delete
  using (auth.uid() = user_id);
