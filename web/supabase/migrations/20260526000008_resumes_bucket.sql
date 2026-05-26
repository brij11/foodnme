-- foodnme — resumes storage bucket (TECHNICAL-REQUIREMENTS.md §9.2, story-jobs-05)
-- Uploaded via POST /api/upload (kind=resume) by authenticated seekers; the public URL is stored
-- on applications.resume_url. Writes happen only through the service-role route (path pinned to
-- the seeker's {user_id}/ namespace); no anon write policy.
--
-- NOTE (production hardening): resumes are PII. This sprint uses a public bucket for parity with
-- the existing upload route + because nothing surfaces resume links publicly yet. Before
-- self-serve employer resume viewing ships, switch to a private bucket + signed URLs (and the
-- PII retention job in §9.5 / Appendix OQ#4).
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Down: delete from storage.buckets where id = 'resumes';
