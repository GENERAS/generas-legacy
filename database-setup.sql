-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL DEFAULT 'youtube',
  video_id TEXT NOT NULL,
  category TEXT DEFAULT 'trading',
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to videos
CREATE POLICY "Videos are viewable by everyone" ON videos
  FOR SELECT USING (true);

-- Allow only admin to insert videos
CREATE POLICY "Only admin can insert videos" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to update videos
CREATE POLICY "Only admin can update videos" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to delete videos
CREATE POLICY "Only admin can delete videos" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for videos
ALTER PUBLICATION supabase_realtime ADD TABLE videos;

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  album_id UUID,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on photos
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-premium photos
CREATE POLICY "Photos are viewable by everyone" ON photos
  FOR SELECT USING (true);

-- Allow only admin to insert photos
CREATE POLICY "Only admin can insert photos" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to update photos
CREATE POLICY "Only admin can update photos" ON photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to delete photos
CREATE POLICY "Only admin can delete photos" ON photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create photo_albums table
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on photo_albums
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

-- Allow public read access to albums
CREATE POLICY "Albums are viewable by everyone" ON photo_albums
  FOR SELECT USING (true);

-- Allow only admin to modify albums
CREATE POLICY "Only admin can modify albums" ON photo_albums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for photos and albums
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
ALTER PUBLICATION supabase_realtime ADD TABLE photo_albums;

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  credential_id TEXT,
  verification_url TEXT,
  category TEXT DEFAULT 'development',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Allow public to view certificates
CREATE POLICY "Certificates are viewable by everyone" ON certificates
  FOR SELECT USING (true);

-- Allow only admin to insert certificates
CREATE POLICY "Only admin can insert certificates" ON certificates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin to update certificates
CREATE POLICY "Only admin can update certificates" ON certificates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow public to update likes count on certificates (for anonymous liking)
CREATE POLICY "Public can update likes on certificates" ON certificates
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Allow only admin to delete certificates
CREATE POLICY "Only admin can delete certificates" ON certificates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for certificates
ALTER PUBLICATION supabase_realtime ADD TABLE certificates;

-- Create certificate_likes table for anonymous likes
CREATE TABLE IF NOT EXISTS certificate_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on certificate_likes
ALTER TABLE certificate_likes ENABLE ROW LEVEL SECURITY;

-- Allow public to insert/view likes
CREATE POLICY "Public can view likes" ON certificate_likes FOR SELECT USING (true);
CREATE POLICY "Public can insert likes" ON certificate_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete own likes" ON certificate_likes FOR DELETE USING (true);

-- Create photo_likes table for anonymous likes
CREATE TABLE IF NOT EXISTS photo_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on photo_likes
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

-- Allow public to insert/view/delete likes
CREATE POLICY "Public can view photo likes" ON photo_likes FOR SELECT USING (true);
CREATE POLICY "Public can insert photo likes" ON photo_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete photo likes" ON photo_likes FOR DELETE USING (true);

-- Enable real-time for likes tables
ALTER PUBLICATION supabase_realtime ADD TABLE certificate_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE photo_likes;

-- Create comments table for anonymous commenting
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visitor_id TEXT,
  visitor_name TEXT,
  visitor_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  admin_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow public to view approved comments
CREATE POLICY "Public can view approved comments" ON comments
  FOR SELECT USING (is_approved = true);

-- Allow public to insert comments
CREATE POLICY "Public can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Allow public to delete their own comments (by visitor_id)
CREATE POLICY "Public can delete own comments" ON comments
  FOR DELETE USING (visitor_id IS NOT NULL);

-- Enable real-time for comments
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.email = 'generaskagiraneza@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
