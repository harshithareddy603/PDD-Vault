-- Run this in your Supabase SQL Editor to fix the source column error
ALTER TABLE documents ADD COLUMN IF NOT EXISTS source text;
