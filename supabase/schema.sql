-- ============================================
-- 신혼부부 부동산 기록 앱 - Database Schema
-- IMPORTANT: Replace spouse emails below with actual Gmail addresses
-- ============================================

-- 1. Properties (매물)
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  price_type TEXT CHECK (price_type IN ('매매', '전세', '월세')) NOT NULL,
  price BIGINT,
  monthly_rent BIGINT,
  deposit BIGINT,
  size_pyeong REAL,
  floor INTEGER,
  rooms INTEGER,
  bathrooms INTEGER,
  parking BOOLEAN DEFAULT false,
  maintenance_fee INTEGER,
  direction TEXT,
  move_in_date DATE,
  rating REAL CHECK (rating >= 0 AND rating <= 5) DEFAULT 0,
  memo TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Photos (사진)
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Reviews (한줄평)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, user_id)
);

-- Indexes
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_photos_property_id ON photos(property_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS Policies (Email-Scoped to Couple)
-- REPLACE 'spouse1@gmail.com' and 'spouse2@gmail.com' with actual emails
-- ============================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Properties
CREATE POLICY "Couple can read properties"
  ON properties FOR SELECT TO authenticated
  USING (auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com'));

CREATE POLICY "Couple can insert properties"
  ON properties FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com')
  );

CREATE POLICY "Couple can update properties"
  ON properties FOR UPDATE TO authenticated
  USING (auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com'));

CREATE POLICY "Couple can delete properties"
  ON properties FOR DELETE TO authenticated
  USING (auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com'));

-- Photos
CREATE POLICY "Couple can read photos"
  ON photos FOR SELECT TO authenticated
  USING (auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com'));

CREATE POLICY "Couple can insert photos"
  ON photos FOR INSERT TO authenticated
  WITH CHECK (auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com'));

CREATE POLICY "Couple can delete photos"
  ON photos FOR DELETE TO authenticated
  USING (auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com'));

-- Reviews
CREATE POLICY "Couple can read reviews"
  ON reviews FOR SELECT TO authenticated
  USING (auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com'));

CREATE POLICY "Couple can insert own review"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com')
  );

CREATE POLICY "Couple can update own review"
  ON reviews FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com')
  );

CREATE POLICY "Couple can delete own review"
  ON reviews FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    AND auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com')
  );

-- ============================================
-- Storage Policies (apply in Supabase Dashboard → Storage → Policies)
-- Bucket: 'property-photos', public: false
-- ============================================

CREATE POLICY "Couple can upload photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-photos'
    AND auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com')
  );

CREATE POLICY "Couple can view photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-photos'
    AND auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com')
  );

CREATE POLICY "Couple can delete photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'property-photos'
    AND auth.jwt()->>'email' IN ('dss122247@gmail.com', 'anglekhl0303@gmail.com')
  );
