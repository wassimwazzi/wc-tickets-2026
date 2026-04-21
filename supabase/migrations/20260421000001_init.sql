CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_number INTEGER UNIQUE NOT NULL,
  team1 TEXT,
  team2 TEXT,
  team1_code TEXT,
  team2_code TEXT,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('GROUP','R32','R16','QF','SF','3RD','FINAL')),
  group_name TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  contact_preference TEXT DEFAULT 'whatsapp' CHECK (contact_preference IN ('whatsapp','facebook','email','instagram')),
  contact_info TEXT,
  reputation_score DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id),
  section TEXT NOT NULL,
  row_label TEXT NOT NULL,
  seat_number TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  category INTEGER NOT NULL CHECK (category BETWEEN 1 AND 4),
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD','CAD','MXN')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available','pending','sold')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD','CAD','MXN')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn','completed')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated','buyer_confirmed','seller_confirmed','transfer_pending','completed','disputed','cancelled')),
  buyer_confirmed_at TIMESTAMPTZ,
  seller_confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES escrow_transactions(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transaction_id, reviewer_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_public_read" ON matches FOR SELECT USING (true);

CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "listings_public_read" ON listings FOR SELECT USING (true);
CREATE POLICY "listings_auth_insert" ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "listings_seller_update" ON listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "listings_seller_delete" ON listings FOR DELETE USING (auth.uid() = seller_id);

CREATE POLICY "offers_read" ON offers FOR SELECT USING (
  auth.uid() = buyer_id OR
  auth.uid() = (SELECT seller_id FROM listings WHERE id = listing_id)
);
CREATE POLICY "offers_buyer_insert" ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "offers_buyer_update" ON offers FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "offers_seller_update" ON offers FOR UPDATE USING (
  auth.uid() = (SELECT seller_id FROM listings WHERE id = listing_id)
);

CREATE POLICY "escrow_read" ON escrow_transactions FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);
CREATE POLICY "escrow_insert" ON escrow_transactions FOR INSERT WITH CHECK (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);
CREATE POLICY "escrow_update" ON escrow_transactions FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
