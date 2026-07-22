-- =========================================================
-- Zerra Docs — initial schema
-- COPY/PASTE THIS INTO YOUR SUPABASE SQL EDITOR AND RUN
-- =========================================================

-- USERS (profile mirror of auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- FAMILY MEMBERS
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relation text not null,
  age int,
  created_at timestamptz not null default now()
);

alter table public.family_members enable row level security;
create policy "Owner can read family"   on public.family_members for select using (auth.uid() = user_id);
create policy "Owner can insert family" on public.family_members for insert with check (auth.uid() = user_id);
create policy "Owner can update family" on public.family_members for update using (auth.uid() = user_id);
create policy "Owner can delete family" on public.family_members for delete using (auth.uid() = user_id);

-- DOCUMENTS
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  name text not null,
  category text not null,
  expiry_date date,
  upload_date timestamptz not null default now(),
  priority boolean not null default false,
  status text not null default 'safe' check (status in ('expired','soon','safe')),
  file_url text,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
create policy "Owner can read documents"   on public.documents for select using (auth.uid() = user_id);
create policy "Owner can insert documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "Owner can update documents" on public.documents for update using (auth.uid() = user_id);
create policy "Owner can delete documents" on public.documents for delete using (auth.uid() = user_id);

-- STORAGE BUCKET for document files (private)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users read own document files"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users upload own document files"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own document files"
  on storage.objects for update
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own document files"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- RPC to check if email exists (for specific login error messages)
create or replace function public.check_email_exists(email_to_check text)
returns boolean as $$
begin
  return exists (
    select 1 from public.users 
    where lower(email) = lower(email_to_check)
  );
end;
$$ language plpgsql security definer;
