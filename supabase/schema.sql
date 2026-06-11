-- Run this in the Supabase SQL editor before using the app.

create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  creator_name text not null,
  creator_handle text,
  title text not null,
  caption text,
  video_url text not null,
  video_path text,
  product_name text not null,
  product_price numeric(12, 2),
  product_currency text not null default 'KZT',
  product_url text not null,
  product_image_url text,
  product_offer_id text,
  product_origin_country text,
  marketplace text,
  likes_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.videos
  add column if not exists product_image_url text,
  add column if not exists product_offer_id text,
  add column if not exists product_origin_country text;

alter table public.videos enable row level security;

drop policy if exists "Videos are readable by everyone" on public.videos;
drop policy if exists "Users can create own videos" on public.videos;
drop policy if exists "Users can update own videos" on public.videos;
drop policy if exists "Users can delete own videos" on public.videos;

create policy "Videos are readable by everyone"
on public.videos
for select
using (true);

create policy "Users can create own videos"
on public.videos
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own videos"
on public.videos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own videos"
on public.videos
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.increment_video_counter(
  video_id uuid,
  counter_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if counter_name = 'likes' then
    update public.videos
    set likes_count = likes_count + 1
    where id = video_id;
  elsif counter_name = 'views' then
    update public.videos
    set views_count = views_count + 1
    where id = video_id;
  end if;
end;
$$;

grant execute on function public.increment_video_counter(uuid, text)
to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ad-videos',
  'ad-videos',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Video files are public" on storage.objects;
drop policy if exists "Authenticated users can upload own videos" on storage.objects;
drop policy if exists "Users can update own video files" on storage.objects;
drop policy if exists "Users can delete own video files" on storage.objects;

create policy "Video files are public"
on storage.objects
for select
using (bucket_id = 'ad-videos');

create policy "Authenticated users can upload own videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ad-videos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update own video files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'ad-videos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'ad-videos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own video files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'ad-videos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
