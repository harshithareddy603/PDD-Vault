-- SQL for DigiLocker and Surepass integration
ALTER TABLE documents ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_number text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_hash text;

-- SQL for Aadhaar integration
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_last4 text;
