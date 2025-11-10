-- Add nickname column
alter table public.screens 
  add column if not exists nickname text;
