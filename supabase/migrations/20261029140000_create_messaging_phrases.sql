-- משפטים קצרים להודעות יומיומיות, לתרגול הכתבה (שמיעה והקלדה)

create table public.messaging_phrases (
  id bigint generated always as identity primary key,
  text_he text not null,
  text_fa text not null,
  category text not null check (category in ('greetings', 'questions', 'plans', 'replies', 'feelings', 'everyday')),
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index messaging_phrases_category_idx
  on public.messaging_phrases (category)
  where is_active;

alter table public.messaging_phrases enable row level security;

-- תוכן ציבורי - גם אורחים יכולים לתרגל
create policy "Anyone reads active phrases"
  on public.messaging_phrases for select to anon, authenticated
  using (is_active);

revoke insert, update, delete on public.messaging_phrases from anon, authenticated;

insert into public.messaging_phrases (text_he, text_fa, category, difficulty) values
  -- ברכות
  ('שלום', 'سلام', 'greetings', 'easy'),
  ('בוקר טוב', 'صبح بخیر', 'greetings', 'easy'),
  ('ערב טוב', 'عصر بخیر', 'greetings', 'easy'),
  ('לילה טוב', 'شب بخیر', 'greetings', 'easy'),
  ('מה נשמע?', 'چه خبر؟', 'greetings', 'easy'),
  ('מה שלומך?', 'حالت چطوره؟', 'greetings', 'easy'),
  ('שבת שלום', 'شبات شالوم (شنبه‌ات به خیر)', 'greetings', 'easy'),
  ('יום הולדת שמח!', 'تولدت مبارک!', 'greetings', 'easy'),
  ('מזל טוב!', 'مبارک باشه!', 'greetings', 'easy'),
  ('חג שמח', 'عید مبارک', 'greetings', 'easy'),
  ('שבוע טוב', 'هفته‌ی خوبی داشته باشی', 'greetings', 'easy'),
  ('להתראות, נדבר', 'خداحافظ، صحبت می‌کنیم', 'greetings', 'medium'),
  ('המון זמן לא דיברנו', 'خیلی وقته با هم حرف نزدیم', 'greetings', 'medium'),
  -- שאלות
  ('איפה אתה?', 'کجایی؟', 'questions', 'easy'),
  ('מתי אתה מגיע?', 'کی می‌رسی؟', 'questions', 'easy'),
  ('מה אתה עושה?', 'چیکار می‌کنی؟', 'questions', 'easy'),
  ('אתה בבית?', 'خونه‌ای؟', 'questions', 'easy'),
  ('יש לך זמן לדבר?', 'وقت داری حرف بزنیم؟', 'questions', 'medium'),
  ('מה התוכניות להיום?', 'برنامه‌ی امروز چیه؟', 'questions', 'medium'),
  ('ראית את ההודעה שלי?', 'پیامم رو دیدی؟', 'questions', 'medium'),
  ('אפשר להתקשר אליך?', 'می‌تونم بهت زنگ بزنم؟', 'questions', 'medium'),
  ('מה אתה רוצה לאכול?', 'چی می‌خوای بخوری؟', 'questions', 'medium'),
  ('באיזו שעה נפגשים?', 'ساعت چند همدیگه رو ببینیم؟', 'questions', 'medium'),
  ('איך היה בעבודה?', 'کار چطور بود؟', 'questions', 'medium'),
  ('צריך משהו מהסופר?', 'از سوپرمارکت چیزی لازم داری؟', 'questions', 'medium'),
  ('אתה יכול לשלוח לי את הכתובת?', 'می‌تونی آدرس رو برام بفرستی؟', 'questions', 'hard'),
  ('מישהו יודע מתי הפגישה מתחילה?', 'کسی می‌دونه جلسه کی شروع میشه؟', 'questions', 'hard'),
  -- תוכניות
  ('אני בדרך', 'دارم میام / تو راهم', 'plans', 'easy'),
  ('נדבר אחר כך', 'بعداً صحبت می‌کنیم', 'plans', 'easy'),
  ('אני כבר מגיע', 'الان می‌رسم', 'plans', 'easy'),
  ('נתראה מחר', 'فردا می‌بینمت', 'plans', 'easy'),
  ('אני מאחר בעשר דקות', 'ده دقیقه دیر می‌کنم', 'plans', 'medium'),
  ('בוא ניפגש בשש', 'بیا ساعت شش همدیگه رو ببینیم', 'plans', 'medium'),
  ('אני אתקשר אליך בערב', 'شب بهت زنگ می‌زنم', 'plans', 'medium'),
  ('אני יוצא מהבית עכשיו', 'الان دارم از خونه میام بیرون', 'plans', 'medium'),
  ('נפגש ליד הכניסה', 'دم ورودی همدیگه رو می‌بینیم', 'plans', 'medium'),
  ('אני בפקק, אגיע קצת יותר מאוחר', 'تو ترافیکم، یه کم دیرتر می‌رسم', 'plans', 'hard'),
  ('בוא נקבע לשבוע הבא', 'بیا برای هفته‌ی بعد قرار بذاریم', 'plans', 'hard'),
  ('אני לא יכול היום, אולי מחר?', 'امروز نمی‌تونم، شاید فردا؟', 'plans', 'hard'),
  ('אני אאסוף אותך מהתחנה', 'از ایستگاه میام دنبالت', 'plans', 'hard'),
  -- תשובות
  ('כן', 'آره / بله', 'replies', 'easy'),
  ('לא', 'نه', 'replies', 'easy'),
  ('בסדר', 'باشه', 'replies', 'easy'),
  ('תודה רבה!', 'خیلی ممنون!', 'replies', 'easy'),
  ('בכיף', 'با کمال میل', 'replies', 'easy'),
  ('אין בעיה', 'مشکلی نیست', 'replies', 'easy'),
  ('סבבה', 'اوکیه / حله', 'replies', 'easy'),
  ('אני לא יודע', 'نمی‌دونم', 'replies', 'easy'),
  ('מעולה, תודה', 'عالی، ممنون', 'replies', 'easy'),
  ('סליחה, לא ראיתי', 'ببخشید، ندیدم', 'replies', 'medium'),
  ('אין בעד מה', 'خواهش می‌کنم', 'replies', 'medium'),
  ('רגע, אני בודק', 'یه لحظه، دارم چک می‌کنم', 'replies', 'medium'),
  ('אני עסוק עכשיו, אחזור אליך', 'الان سرم شلوغه، بهت خبر میدم', 'replies', 'hard'),
  ('בטח, תגיד לי מתי שנוח לך', 'حتماً، هر وقت راحت بودی بهم بگو', 'replies', 'hard'),
  -- רגשות
  ('אני שמח', 'خوشحالم', 'feelings', 'easy'),
  ('אני עייף', 'خسته‌ام', 'feelings', 'easy'),
  ('מתגעגע אליך', 'دلم برات تنگ شده', 'feelings', 'easy'),
  ('אוהב אותך', 'دوستت دارم', 'feelings', 'easy'),
  ('איזה כיף!', 'چه خوب!', 'feelings', 'easy'),
  ('אני גאה בך', 'بهت افتخار می‌کنم', 'feelings', 'medium'),
  ('אני מצטער על מה שקרה', 'بابت اتفاقی که افتاد متأسفم', 'feelings', 'medium'),
  ('רפואה שלמה', 'ان‌شاءالله زودتر خوب بشی', 'feelings', 'medium'),
  ('בהצלחה במבחן!', 'تو امتحان موفق باشی!', 'feelings', 'medium'),
  ('איזה יום ארוך היה היום', 'امروز چه روز طولانی‌ای بود', 'feelings', 'hard'),
  ('תודה שאתה תמיד שם בשבילי', 'ممنون که همیشه کنارمی', 'feelings', 'hard'),
  -- יומיומי
  ('אני בעבודה', 'سر کارم', 'everyday', 'easy'),
  ('אני בבית', 'خونه‌ام', 'everyday', 'easy'),
  ('הגעתי', 'رسیدم', 'everyday', 'easy'),
  ('אני רעב', 'گرسنه‌ام', 'everyday', 'easy'),
  ('הסוללה נגמרת', 'شارژ گوشیم داره تموم میشه', 'everyday', 'medium'),
  ('תתקשר אליי כשתוכל', 'هر وقت تونستی بهم زنگ بزن', 'everyday', 'medium'),
  ('שלחתי לך תמונה', 'برات یه عکس فرستادم', 'everyday', 'medium'),
  ('אני בקניות, צריך משהו?', 'دارم خرید می‌کنم، چیزی لازم داری؟', 'everyday', 'medium'),
  ('האוטובוס איחר', 'اتوبوس دیر کرد', 'everyday', 'medium'),
  ('תעדכן אותי כשאתה מגיע', 'وقتی رسیدی خبرم کن', 'everyday', 'medium'),
  ('אני לא מרגיש טוב היום', 'امروز حالم خوب نیست', 'everyday', 'medium'),
  ('שכחתי את המפתחות בבית', 'کلیدها رو خونه جا گذاشتم', 'everyday', 'hard'),
  ('הרופא קבע לי תור ליום ראשון', 'دکتر برام برای یکشنبه نوبت گذاشت', 'everyday', 'hard'),
  ('אני צריך עזרה עם משהו קטן', 'یه کمک کوچیک لازم دارم', 'everyday', 'hard'),
  ('הילדים כבר ישנים', 'بچه‌ها خوابیدن', 'everyday', 'medium');
