-- Existing schema. Add new tables/policies in a new migration file, don't edit this one.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  display_name text
);
