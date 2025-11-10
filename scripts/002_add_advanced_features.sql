-- Add new columns for advanced features
alter table public.screens 
  add column if not exists image_scale integer default 100,
  add column if not exists audio_url text,
  add column if not exists audio_volume integer default 50,
  add column if not exists video_scale integer default 100,
  add column if not exists video_audio_url text,
  add column if not exists video_audio_volume integer default 50,
  add column if not exists expires_at timestamp with time zone;

-- Create index for expiry cleanup
create index if not exists screens_expires_at_idx on public.screens (expires_at);

-- Policy to prevent access to expired screens
drop policy if exists "screens_select_all" on public.screens;
create policy "screens_select_not_expired"
  on public.screens for select
  using (expires_at is null or expires_at > now());
