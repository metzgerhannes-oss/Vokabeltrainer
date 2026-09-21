-- Supabase migration 20260921092520: index_vokabeltrainer_invites_family
create index if not exists vt_invites_family_idx
  on private.vt_invites(family_id);
