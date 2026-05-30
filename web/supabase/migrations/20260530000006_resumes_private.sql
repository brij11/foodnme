-- foodnme — make the resumes bucket private (story-jobs-14, §9.2/§9.5)
-- Employer resume viewing now ships, so resumes (PII) move off the public bucket: they are read
-- only via short-lived service-role signed URLs from the employer dashboard (the migration note
-- in 20260526000008_resumes_bucket.sql flagged this exact switch). Uploads still flow through the
-- service-role /api/upload route (path pinned to the seeker's {user_id}/ namespace).

update storage.buckets set public = false where id = 'resumes';

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   update storage.buckets set public = true where id = 'resumes';
