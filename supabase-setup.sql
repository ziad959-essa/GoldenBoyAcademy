-- Run this script in Supabase Dashboard > SQL Editor.
-- The browser must use the project's URL and anon/publishable key only.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_academy_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_admin = true
  );
$$;

revoke all on function public.is_academy_admin() from public;
grant execute on function public.is_academy_admin() to anon, authenticated;

create table if not exists public.applications (
  id uuid primary key,
  parent_name text not null check (char_length(parent_name) between 2 and 80),
  child_name text not null check (char_length(child_name) between 2 and 80),
  phone text not null check (phone ~ '^01[0125][0-9]{8}$'),
  national_id text not null check (national_id ~ '^[0-9]{14}$'),
  age smallint not null check (age between 1 and 99),
  birth_date date not null,
  previous_experience boolean not null,
  sport text not null check (sport in ('kungfu', 'kickboxing', 'muaythai', 'mma', 'boxing', 'gymnastics', 'taekwondo', 'karate', 'fitness')),
  branch text not null check (branch in ('popular1', 'popular2', 'popular3', 'mashma1', 'mashma2', 'sevenGirls', 'club23')),
  training_group text,
  proposed_session text,
  athlete_photo_path text not null,
  certificate_path text not null,
  payment_method text check (payment_method in ('instapay', 'vodafone_cash')),
  payment_reference text,
  payment_receipt_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  check (split_part(athlete_photo_path, '/', 1) = id::text),
  check (split_part(certificate_path, '/', 1) = id::text),
  check (payment_receipt_path is null or split_part(payment_receipt_path, '/', 1) = id::text),
  check ((training_group is not null) or (proposed_session is not null))
);

create table if not exists public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  review_month date not null,
  rating smallint not null check (rating between 1 and 5),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique (application_id, review_month)
);

alter table public.admin_users enable row level security;
alter table public.applications enable row level security;
alter table public.monthly_reviews enable row level security;

drop policy if exists "Admins can read admin roster" on public.admin_users;
create policy "Admins can read admin roster"
  on public.admin_users for select to authenticated
  using (public.is_academy_admin());

drop policy if exists "Public can submit pending applications" on public.applications;
create policy "Public can submit pending applications"
  on public.applications for insert to anon, authenticated
  with check (
    status = 'pending'
    and split_part(athlete_photo_path, '/', 1) = id::text
    and split_part(certificate_path, '/', 1) = id::text
    and (payment_receipt_path is null or split_part(payment_receipt_path, '/', 1) = id::text)
  );

drop policy if exists "Admins can read applications" on public.applications;
create policy "Admins can read applications"
  on public.applications for select to authenticated
  using (public.is_academy_admin());

drop policy if exists "Admins can update applications" on public.applications;
create policy "Admins can update applications"
  on public.applications for update to authenticated
  using (public.is_academy_admin())
  with check (public.is_academy_admin());

drop policy if exists "Admins can manage monthly reviews" on public.monthly_reviews;
create policy "Admins can manage monthly reviews"
  on public.monthly_reviews for all to authenticated
  using (public.is_academy_admin())
  with check (public.is_academy_admin());

grant insert on public.applications to anon, authenticated;
grant select, update on public.applications to authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.monthly_reviews to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'player-private',
  'player-private',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload application files" on storage.objects;
create policy "Public can upload application files"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'player-private'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );

drop policy if exists "Admins can view private application files" on storage.objects;
create policy "Admins can view private application files"
  on storage.objects for select to authenticated
  using (bucket_id = 'player-private' and public.is_academy_admin());

drop policy if exists "Admins can delete private application files" on storage.objects;
create policy "Admins can delete private application files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'player-private' and public.is_academy_admin());

-- Create an account through the site's admin registration form first.
-- Run this as project owner after creating and confirming the admin account:
insert into public.admin_users (user_id, is_admin)
select id, true
from auth.users
where email = 'saifahmed313131@gmail.com'
  and email_confirmed_at is not null
on conflict (user_id) do update set is_admin = true;
