-- Create a new bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for avatars bucket
-- Allow public access to read avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

-- Allow users to update their own avatar
CREATE POLICY "Anyone can update an avatar."
  ON storage.objects FOR UPDATE
  WITH CHECK ( bucket_id = 'avatars' );
