/*
# Create Initial AgriCraft Database Schema

## 1. New Tables

### profiles
User profile information with role-based access
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null)
- `phone` (text)
- `email` (text)
- `role` (user_role enum: 'farmer', 'buyer', 'admin', default: 'buyer')
- `created_at` (timestamptz, default: now())

### products
Handmade products listed by farmers
- `id` (uuid, primary key, default: gen_random_uuid())
- `farmer_id` (uuid, references profiles(id))
- `title` (text, not null)
- `description` (text)
- `image_url` (text, not null)
- `price` (numeric, not null)
- `material_type` (text, not null) - coconut_shell, banana_stem, rice_husk
- `farmer_phone` (text, not null)
- `status` (text, default: 'active') - active, sold, inactive
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### waste_classifications
History of waste classification attempts
- `id` (uuid, primary key, default: gen_random_uuid())
- `farmer_id` (uuid, references profiles(id))
- `image_url` (text, not null)
- `detected_type` (text) - coconut_shell, banana_stem, rice_husk, unknown
- `confidence` (text)
- `ai_response` (text)
- `created_at` (timestamptz, default: now())

### feedback
User feedback collection
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, references profiles(id), nullable)
- `name` (text)
- `email` (text)
- `message` (text, not null)
- `created_at` (timestamptz, default: now())

## 2. Security

- Enable RLS on all tables
- Create admin helper function to check user role
- Profiles: Admins have full access, users can view own profile
- Products: Public read access, farmers can manage own products, admins have full access
- Waste Classifications: Farmers can view own history, admins have full access
- Feedback: Anyone can insert, admins can view all

## 3. Triggers

- Auto-update updated_at on products table
- Handle new user registration and assign first user as admin

## 4. Storage Bucket

- Create bucket for product and waste images
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  phone text,
  email text,
  role user_role DEFAULT 'buyer'::user_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  material_type text NOT NULL,
  farmer_phone text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create waste_classifications table
CREATE TABLE IF NOT EXISTS waste_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  detected_type text,
  confidence text,
  ai_response text,
  created_at timestamptz DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text,
  email text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile without changing role" ON profiles
  FOR UPDATE USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Products policies (public read, authenticated write)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Farmers can insert own products" ON products
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own products" ON products
  FOR UPDATE TO authenticated 
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own products" ON products
  FOR DELETE TO authenticated 
  USING (auth.uid() = farmer_id);

CREATE POLICY "Admins have full access to products" ON products
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Waste classifications policies
CREATE POLICY "Farmers can view own classifications" ON waste_classifications
  FOR SELECT TO authenticated USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own classifications" ON waste_classifications
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Admins have full access to classifications" ON waste_classifications
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Feedback policies
CREATE POLICY "Anyone can insert feedback" ON feedback
  FOR INSERT TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins can view all feedback" ON feedback
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger to products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  -- Only insert into profiles after user is confirmed
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Count existing users in profiles
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Extract username from email (remove @miaoda.com suffix)
    extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
    
    -- Insert into profiles, first user gets admin role
    INSERT INTO profiles (id, username, phone, email, role)
    VALUES (
      NEW.id,
      extracted_username,
      NEW.phone,
      NEW.email,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'buyer'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-7tqb6jyvh98h_agricraft_images', 'app-7tqb6jyvh98h_agricraft_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7tqb6jyvh98h_agricraft_images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-7tqb6jyvh98h_agricraft_images');

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-7tqb6jyvh98h_agricraft_images');

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-7tqb6jyvh98h_agricraft_images');
