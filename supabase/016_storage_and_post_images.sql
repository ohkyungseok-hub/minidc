-- ============================================================
-- Migration 016: Supabase Storage buckets + posts.images
-- ============================================================

-- ── Storage buckets ──────────────────────────────────────────
-- 'avatars'     : profile photos,  max 5 MB  per file
-- 'post-images' : post attachments, max 10 MB per file
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',     'avatars',     true, 5242880,  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('post-images', 'post-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── avatars bucket policies ──────────────────────────────────
drop policy if exists "avatars: public read"  on storage.objects;
create policy "avatars: public read"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "avatars: owner insert" on storage.objects;
create policy "avatars: owner insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "avatars: owner update" on storage.objects;
create policy "avatars: owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "avatars: owner delete" on storage.objects;
create policy "avatars: owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- ── post-images bucket policies ───────────────────────────────
drop policy if exists "post-images: public read"  on storage.objects;
create policy "post-images: public read"
on storage.objects for select
using (bucket_id = 'post-images');

drop policy if exists "post-images: owner insert" on storage.objects;
create policy "post-images: owner insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "post-images: owner delete" on storage.objects;
create policy "post-images: owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- ── posts.images column ───────────────────────────────────────
-- Array of Supabase Storage public URLs attached to the post
alter table public.posts
  add column if not exists images text[] not null default '{}';
