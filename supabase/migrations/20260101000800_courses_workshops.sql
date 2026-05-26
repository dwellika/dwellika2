-- ============================================================
-- 20260101000800_courses_workshops
-- courses, lessons, enrollments, workshops, registrations.
-- ============================================================

create type public.course_level as enum ('beginner', 'intermediate', 'advanced');

create table public.courses (
  id              uuid primary key default gen_random_uuid(),
  instructor_id   uuid not null references public.profiles(id) on delete cascade,
  slug            text not null unique,
  title           text not null,
  description     text,
  cover_url       text,
  level           public.course_level not null default 'beginner',
  price           numeric(12, 2) not null default 0,
  currency        text not null default 'INR',
  is_free         boolean not null default false,
  duration_min    integer,
  status          public.content_status not null default 'draft',
  rating_avg      numeric(3, 2),
  rating_count    integer not null default 0,
  enrollment_count integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index courses_instructor_idx on public.courses (instructor_id);
create index courses_status_idx on public.courses (status);

create trigger trg_courses_updated
  before update on public.courses
  for each row execute function public.set_updated_at();

create table public.course_lessons (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  position      integer not null,
  title         text not null,
  description   text,
  video_url     text,
  duration_sec  integer,
  is_preview    boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (course_id, position)
);

create table public.course_enrollments (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  progress      numeric(5, 2) not null default 0,
  completed_at  timestamptz,
  enrolled_at   timestamptz not null default now(),
  unique (course_id, user_id)
);

create index course_enrollments_user_idx on public.course_enrollments (user_id);

-- ---------- workshops --------------------------------------------

create table public.workshops (
  id              uuid primary key default gen_random_uuid(),
  host_id         uuid not null references public.profiles(id) on delete cascade,
  slug            text not null unique,
  title           text not null,
  description     text,
  cover_url       text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  is_live         boolean not null default true,
  meeting_url     text,
  recording_url   text,
  price           numeric(12, 2) not null default 0,
  currency        text not null default 'INR',
  capacity        integer,
  status          public.content_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index workshops_starts_idx on public.workshops (starts_at);
create index workshops_status_idx on public.workshops (status);

create trigger trg_workshops_updated
  before update on public.workshops
  for each row execute function public.set_updated_at();

create table public.workshop_registrations (
  id              uuid primary key default gen_random_uuid(),
  workshop_id     uuid not null references public.workshops(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  registered_at   timestamptz not null default now(),
  attended        boolean not null default false,
  unique (workshop_id, user_id)
);

-- ---------- RLS ---------------------------------------------------

alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_registrations enable row level security;

create policy "courses_read" on public.courses
  for select using (status = 'approved' or instructor_id = auth.uid() or public.is_admin());
create policy "courses_instructor_write" on public.courses
  for insert with check (instructor_id = auth.uid());
create policy "courses_instructor_update" on public.courses
  for update using (instructor_id = auth.uid() or public.is_admin())
  with check (instructor_id = auth.uid() or public.is_admin());
create policy "courses_instructor_delete" on public.courses
  for delete using (instructor_id = auth.uid() or public.is_admin());

create policy "course_lessons_read" on public.course_lessons
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and (c.status = 'approved' or c.instructor_id = auth.uid() or public.is_admin())
    )
  );
create policy "course_lessons_instructor_write" on public.course_lessons
  for all using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and (c.instructor_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.courses c
      where c.id = course_id and (c.instructor_id = auth.uid() or public.is_admin())
    )
  );

create policy "course_enrollments_self_read" on public.course_enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy "course_enrollments_self_insert" on public.course_enrollments
  for insert with check (user_id = auth.uid());
create policy "course_enrollments_self_update" on public.course_enrollments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "workshops_read" on public.workshops
  for select using (status = 'approved' or host_id = auth.uid() or public.is_admin());
create policy "workshops_host_write" on public.workshops
  for insert with check (host_id = auth.uid());
create policy "workshops_host_update" on public.workshops
  for update using (host_id = auth.uid() or public.is_admin())
  with check (host_id = auth.uid() or public.is_admin());
create policy "workshops_host_delete" on public.workshops
  for delete using (host_id = auth.uid() or public.is_admin());

create policy "workshop_registrations_self_read" on public.workshop_registrations
  for select using (user_id = auth.uid() or public.is_admin());
create policy "workshop_registrations_self_insert" on public.workshop_registrations
  for insert with check (user_id = auth.uid());
create policy "workshop_registrations_self_delete" on public.workshop_registrations
  for delete using (user_id = auth.uid());
