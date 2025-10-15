-- Migration: add case-insensitive unique index on users.email

-- Note: if the users table already contains duplicate emails that only differ by case
-- this CREATE UNIQUE INDEX will fail. Resolve duplicates before applying in that case.

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_ci ON users (LOWER(email));
