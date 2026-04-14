-- ============================================================
-- HoistMarket — Complete Production Database Schema v2
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- profiles --
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT, company TEXT, phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','vendor','user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_self_read"   ON profiles FOR SELECT USING (auth.uid()=id);
CREATE POLICY "p_self_update" ON profiles FOR UPDATE USING (auth.uid()=id);
CREATE POLICY "p_admin"       ON profiles FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles(id,email,full_name,company,role)
  VALUES(NEW.id,NEW.email,NEW.raw_user_meta_data->>'full_name',NEW.raw_user_meta_data->>'company',COALESCE(NEW.raw_user_meta_data->>'role','user'))
  ON CONFLICT(id) DO NOTHING;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION upd_ts() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END;$$;

-- vendors --
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
  description TEXT, country TEXT NOT NULL, city TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('india','gcc','africa','asia','europe','americas')),
  equipment_categories TEXT[] NOT NULL DEFAULT '{}',
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','standard','featured','enterprise')),
  verified BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT, website TEXT, email TEXT NOT NULL, phone TEXT, whatsapp TEXT,
  specializations TEXT[] DEFAULT '{}', certifications TEXT[] DEFAULT '{}',
  year_established INT, employee_count TEXT, annual_revenue TEXT,
  membership_expires_at TIMESTAMPTZ,
  views_count INT NOT NULL DEFAULT 0, rfq_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true, admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v_pub_read"   ON vendors FOR SELECT USING (is_active=true);
CREATE POLICY "v_owner_upd"  ON vendors FOR UPDATE USING (profile_id=auth.uid());
CREATE POLICY "v_admin"      ON vendors FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "v_ins_auth"   ON vendors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER v_upd BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION upd_ts();

-- rfqs --
CREATE SEQUENCE IF NOT EXISTS rfq_seq START 1000;
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_number TEXT UNIQUE NOT NULL DEFAULT ('RFQ-'||LPAD(nextval('rfq_seq')::TEXT,4,'0')),
  requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL, requester_email TEXT NOT NULL,
  requester_company TEXT, requester_phone TEXT,
  equipment_category TEXT NOT NULL, equipment_subcategory TEXT,
  required_capacity TEXT, capacity_unit TEXT DEFAULT 'tonnes',
  span_required TEXT, lift_height TEXT, duty_class TEXT,
  site_region TEXT NOT NULL, site_country TEXT, site_details TEXT,
  rental_duration TEXT, rental_start_date DATE,
  project_description TEXT, budget_range TEXT, special_requirements TEXT,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','matched','dispatched','in_progress','closed','cancelled')),
  admin_notes TEXT, matched_vendor_ids UUID[] DEFAULT '{}',
  dispatched_to UUID[] DEFAULT '{}', dispatched_at TIMESTAMPTZ, dispatch_message TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 3.0, expected_commission NUMERIC(12,2),
  commission_currency TEXT DEFAULT 'INR',
  commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending','expected','invoiced','received','cancelled')),
  commission_received_at TIMESTAMPTZ, actual_deal_value NUMERIC(14,2),
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "r_ins_any"  ON rfqs FOR INSERT WITH CHECK (true);
CREATE POLICY "r_own_read" ON rfqs FOR SELECT USING (requester_id=auth.uid());
CREATE POLICY "r_admin"    ON rfqs FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE TRIGGER r_upd BEFORE UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION upd_ts();

-- rfq_responses --
CREATE TABLE IF NOT EXISTS rfq_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','quoted','accepted','declined','expired')),
  quote_amount NUMERIC(14,2), quote_currency TEXT DEFAULT 'INR', message TEXT,
  responded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rfq_id,vendor_id)
);
ALTER TABLE rfq_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rr_vendor"      ON rfq_responses FOR ALL USING (EXISTS(SELECT 1 FROM vendors WHERE id=vendor_id AND profile_id=auth.uid()));
CREATE POLICY "rr_admin"       ON rfq_responses FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "rr_owner_read"  ON rfq_responses FOR SELECT USING (EXISTS(SELECT 1 FROM rfqs WHERE id=rfq_id AND requester_id=auth.uid()));

-- articles --
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, excerpt TEXT, content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL, subcategory TEXT, tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'HoistMarket Editorial',
  featured_image TEXT, seo_title TEXT, seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}', schema_type TEXT DEFAULT 'TechnicalArticle',
  reading_time INT NOT NULL DEFAULT 5, views_count INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false, is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "a_pub_read" ON articles FOR SELECT USING (is_published=true);
CREATE POLICY "a_admin"    ON articles FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE TRIGGER a_upd BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION upd_ts();

-- memberships --
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('standard','featured','enterprise')),
  price_inr NUMERIC(10,2) NOT NULL, price_usd NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly','annual')),
  razorpay_order_id TEXT, razorpay_payment_id TEXT, razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','cancelled','expired')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "m_vendor_own" ON memberships FOR SELECT USING (EXISTS(SELECT 1 FROM vendors WHERE id=vendor_id AND profile_id=auth.uid()));
CREATE POLICY "m_admin"      ON memberships FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

-- ad_placements --
CREATE TABLE IF NOT EXISTS ad_placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  title TEXT NOT NULL, description TEXT, cta_text TEXT NOT NULL DEFAULT 'Learn More',
  cta_url TEXT NOT NULL,
  placement TEXT NOT NULL CHECK (placement IN ('homepage_banner','kb_sidebar','directory_featured','article_inline')),
  image_url TEXT, price_per_month NUMERIC(10,2) NOT NULL, currency TEXT NOT NULL DEFAULT 'INR',
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true, impressions INT NOT NULL DEFAULT 0, clicks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ad_pub_read" ON ad_placements FOR SELECT USING (is_active=true AND now() BETWEEN starts_at AND ends_at);
CREATE POLICY "ad_admin"    ON ad_placements FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

-- notifications --
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
  data JSONB DEFAULT '{}', read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "n_own"   ON notifications FOR ALL USING (user_id=auth.uid());
CREATE POLICY "n_admin" ON notifications FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

-- vendor_events (analytics) --
CREATE TABLE IF NOT EXISTS vendor_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view','rfq_received','rfq_dispatched','quote_sent')),
  metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE vendor_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ve_vendor"  ON vendor_events FOR SELECT USING (EXISTS(SELECT 1 FROM vendors WHERE id=vendor_id AND profile_id=auth.uid()));
CREATE POLICY "ve_admin"   ON vendor_events FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "ve_ins_any" ON vendor_events FOR INSERT WITH CHECK (true);

-- indexes --
CREATE INDEX IF NOT EXISTS idx_vendors_region   ON vendors(region);
CREATE INDEX IF NOT EXISTS idx_vendors_tier     ON vendors(tier);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(verified);
CREATE INDEX IF NOT EXISTS idx_vendors_cats     ON vendors USING gin(equipment_categories);
CREATE INDEX IF NOT EXISTS idx_rfqs_status      ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created     ON rfqs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfqs_requester   ON rfqs(requester_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug    ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_pub     ON articles(is_published,published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifs_user      ON notifications(user_id,read,created_at DESC);

-- helpers --
CREATE OR REPLACE FUNCTION increment_vendor_views(p_id UUID) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN UPDATE vendors SET views_count=views_count+1 WHERE id=p_id;
INSERT INTO vendor_events(vendor_id,event_type) VALUES(p_id,'view'); END;$$;

CREATE OR REPLACE FUNCTION increment_vendor_rfq_count(p_id UUID) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN UPDATE vendors SET rfq_count=rfq_count+1 WHERE id=p_id; END;$$;

CREATE OR REPLACE FUNCTION get_admin_stats() RETURNS TABLE(
  total_rfqs BIGINT,new_rfqs BIGINT,dispatched_rfqs BIGINT,
  total_vendors BIGINT,verified_vendors BIGINT,pending_vendors BIGINT,
  total_articles BIGINT,published_articles BIGINT,
  mrr_inr NUMERIC,active_memberships BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN QUERY SELECT
  (SELECT COUNT(*) FROM rfqs)::BIGINT,(SELECT COUNT(*) FROM rfqs WHERE status='new')::BIGINT,
  (SELECT COUNT(*) FROM rfqs WHERE status IN ('dispatched','in_progress'))::BIGINT,
  (SELECT COUNT(*) FROM vendors WHERE is_active)::BIGINT,
  (SELECT COUNT(*) FROM vendors WHERE verified AND is_active)::BIGINT,
  (SELECT COUNT(*) FROM vendors WHERE NOT verified AND is_active)::BIGINT,
  (SELECT COUNT(*) FROM articles)::BIGINT,(SELECT COUNT(*) FROM articles WHERE is_published)::BIGINT,
  (SELECT COALESCE(SUM(price_inr),0) FROM memberships WHERE status='active'),
  (SELECT COUNT(*) FROM memberships WHERE status='active')::BIGINT; END;$$;

-- seed vendors --
INSERT INTO vendors(company_name,slug,description,country,city,region,equipment_categories,tier,verified,featured,email,phone,certifications,specializations,year_established,is_active) VALUES
('Hindustan Crane & Hoist Pvt Ltd','hindustan-crane-hoist','India''s leading EOT crane and hoist manufacturer. 40+ years. Steel, cement, power sectors.','India','Mumbai','india',ARRAY['EOT Crane','Wire Rope Hoist','Electric Chain Hoist','Jib Crane'],'featured',true,true,'sales@hcrane.in','+91 22 6611 0000',ARRAY['LEEA','BIS','ISO 9001'],ARRAY['Steel Plant','Power Station','Process Industry'],1982,true),
('Gulf Crane Solutions LLC','gulf-crane-solutions','Premium crane rental across UAE, Saudi Arabia, Qatar for oil & gas and infrastructure EPC.','UAE','Dubai','gcc',ARRAY['Mobile Crane','All-Terrain Crane','Crawler Crane','Tower Crane'],'standard',true,false,'info@gulfcrane.ae','+971 4 551 0000',ARRAY['LEEA','NEBOSH'],ARRAY['Oil & Gas','Infrastructure','Heavy Lift'],2008,true),
('WestLift Africa Ltd','westlift-africa','West Africa heavy lift contractor. Nigeria, Ghana, Liberia, Ivory Coast.','Nigeria','Lagos','africa',ARRAY['Mobile Crane','Rigging','Material Handling'],'standard',true,false,'ops@westlift.ng','+234 1 700 0000',ARRAY['LEEA','ISO 9001'],ARRAY['Port Equipment','Oil & Gas'],2015,true),
('Konecranes India Pvt Ltd','konecranes-india','Global OEM. Full-service India operations. EOT, port cranes, service contracts.','India','Chennai','india',ARRAY['EOT Crane','Process Cranes','Port Cranes','Hoists'],'featured',true,true,'india.sales@konecranes.com','+91 44 4300 0000',ARRAY['ISO 9001','CE','LEEA'],ARRAY['Steel Plant','Port Equipment','Nuclear'],1994,true),
('Al-Masood Heavy Machinery','al-masood-heavy-machinery','Saudi crane rental. 80+ fleet from 10t–500t. GCC construction and oil & gas.','Saudi Arabia','Riyadh','gcc',ARRAY['Tower Crane','Mobile Crane','Crawler Crane'],'free',false,false,'info@almasood.sa','+966 11 400 0000',ARRAY[]::TEXT[],ARRAY['Construction'],2010,true),
('Rigging House International','rigging-house-international','LEEA-trained rigging gear specialist. Pan-India delivery. ASME-rated equipment.','India','Delhi','india',ARRAY['Rigging','Wire Rope Slings','Shackles','Below-Hook Devices'],'standard',true,false,'rhi@rigginghouse.in','+91 11 4000 0000',ARRAY['LEEA','ASME'],ARRAY['Rigging Inspection','Offshore Rigging'],2005,true)
ON CONFLICT(slug) DO NOTHING;

-- seed articles --
INSERT INTO articles(slug,title,excerpt,content,category,tags,author_name,seo_keywords,schema_type,reading_time,is_published,is_featured,published_at) VALUES
('asme-b30-vs-iso-vs-fem-lifting-standards','International Lifting Standards: Comparing ASME B30 vs ISO vs FEM for Global Projects','A definitive comparison for EPC managers across GCC, India, and international projects.','## Why Standards Matter on Global Projects\n\nASME B30, FEM 1.001, and ISO standards each govern lifting equipment in different jurisdictions. For EPC managers working across borders, reconciliation is essential.\n\n## ASME B30 Series\n- B30.2: Overhead cranes\n- B30.5: Mobile cranes\n- B30.9: Slings\n\n## FEM 1.001\nUsed by European OEMs. Groups A1–A8 for cranes, M1–M8 for mechanisms.\n\n## ISO Standards\nHarmonised with FEM for EU applications. ISO 4306 provides universal terminology.\n\n## Key Differences\n| Parameter | ASME B30 | FEM 1.001 | ISO/EN |\n|---|---|---|---|\n| Wire rope SF | 3.5:1 | Design-calc | ISO 2408 |\n| Classification | Duty cycle | A1–A8 | Aligned FEM |\n| Inspection | Per volume | Mfr spec | EN 13155 |','Standards',ARRAY['ASME B30','FEM','ISO','crane safety'],'HoistMarket Editorial',ARRAY['crane safety standards','ASME B30.2','FEM crane classification'],'TechnicalArticle',14,true,true,now()-interval '7 days'),
('eot-crane-total-cost-ownership-tco-guide','Total Cost of Ownership in EOT Cranes: Why Initial Price is 40% of the Story','Maintenance, spare parts, downtime, and 15-year lifecycle ROI analysis for plant engineers.','## The Price Trap\n\nInitial purchase price = 35-45% of 15-year TCO.\n\n## TCO Breakdown\n| Category | % of 15-yr TCO |\n|---|---|\n| Capital Cost | 38-44% |\n| Planned Maintenance | 12-18% |\n| Unplanned Downtime | 8-15% |\n| Spare Parts | 9-14% |\n| Energy | 5-9% |\n\n## 15-Year Comparison\n| Item | Lowest Bid | TCO-Evaluated |\n|---|---|---|\n| Purchase | ₹38L | ₹47L |\n| Maintenance | ₹24L | ₹19L |\n| Downtime | ₹18L | ₹6L |\n| **Total** | **₹1.05Cr** | **₹93L** |\n\nTCO-evaluated saves ₹12.6L despite ₹9L higher purchase price.','Procurement',ARRAY['TCO','EOT crane','procurement'],'HoistMarket Editorial',ARRAY['EOT crane maintenance cost','overhead crane TCO'],'TechnicalArticle',12,true,true,now()-interval '3 days'),
('india-west-africa-lifting-market-2026','The State of Heavy Lifting 2026: Why India and West Africa Are Decoupling from Global Downturns','PM Gati Shakti and West African port expansion drive counter-cyclical demand.','## Counter-Cyclical Growth\n\nEurope and North America show 12-18% order book declines. India and West Africa are growing.\n\n## India: PM Gati Shakti\n\nRs.100 lakh crore National Master Plan creating crane demand across:\n- Railways (DFCs): EOT cranes, mobile cranes for viaducts\n- Ports (Sagarmala III): STS, RTG, stacker-reclaimers\n- Manufacturing (PLI): Industrial EOT cranes\n- Energy: Tower cranes for wind; EOTs for plants\n\nLead times for 50t+ EOT cranes stretched to 28-36 weeks.\n\n## West Africa: Port Expansion\n\n- Tema Port, Ghana: 6 post-Panamax STS units\n- Lekki Port, Nigeria: Phase 2 RTGs\n- Port of Monrovia, Liberia: USAID berth rehab\n- Abidjan Port: Container terminal doubling','Market Intelligence',ARRAY['India','West Africa','2026'],'HoistMarket Editorial',ARRAY['India infrastructure growth 2026','West Africa port expansion'],'TechnicalArticle',11,true,false,now()-interval '1 day')
ON CONFLICT(slug) DO NOTHING;
