-- Create screens table to store screen configurations
create table if not exists public.screens (
  id text primary key,
  background_type text not null check (background_type in ('color', 'image')),
  background_color text,
  background_image text,
  image_opacity integer default 100,
  media_url text not null,
  media_type text not null check (media_type in ('gif', 'video')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for security
alter table public.screens enable row level security;

-- Allow anyone to read screens (public sharing)
create policy "screens_select_all"
  on public.screens for select
  using (true);

-- Allow anyone to insert screens (no auth required for creating)
create policy "screens_insert_all"
  on public.screens for insert
  with check (true);
