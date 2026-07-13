-- EgyField Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor before deploying to Vercel

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" TEXT UNIQUE NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT DEFAULT 'admin',
  "permissions" JSONB DEFAULT '["products", "articles", "inquiries", "settings"]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" JSONB NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "icon" TEXT DEFAULT '',
  "color" TEXT DEFAULT '#7BB445',
  "image" JSONB DEFAULT '{"url": "", "publicId": ""}'::jsonb,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" JSONB NOT NULL,
  "description" JSONB NOT NULL,
  "category" UUID REFERENCES categories(id) ON DELETE RESTRICT,
  "images" JSONB DEFAULT '[]'::jsonb,
  "origin" TEXT DEFAULT 'Egypt',
  "packaging" TEXT DEFAULT '',
  "season" TEXT DEFAULT 'Year-round',
  "certifications" JSONB DEFAULT '[]'::jsonb,
  "specifications" JSONB DEFAULT '[]'::jsonb,
  "featured" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS about_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "storyText1" JSONB DEFAULT '{}'::jsonb,
  "storyText2" JSONB DEFAULT '{}'::jsonb,
  "storyImage" TEXT DEFAULT '',
  "storyBadge" JSONB DEFAULT '{}'::jsonb,
  "missionText" JSONB DEFAULT '{}'::jsonb,
  "visionText" JSONB DEFAULT '{}'::jsonb,
  "timeline" JSONB DEFAULT '[]'::jsonb,
  "certifications" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" JSONB DEFAULT '{}'::jsonb,
  "content" JSONB DEFAULT '{}'::jsonb,
  "summary" JSONB DEFAULT '{}'::jsonb,
  "image" JSONB DEFAULT '{}'::jsonb,
  "slug" TEXT UNIQUE NOT NULL,
  "views" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "company" TEXT DEFAULT '',
  "country" TEXT DEFAULT '',
  "productInterest" TEXT DEFAULT '',
  "message" TEXT NOT NULL,
  "status" TEXT DEFAULT 'new',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" JSONB NOT NULL,
  "logo" JSONB NOT NULL,
  "website" TEXT DEFAULT '',
  "isActive" BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyName" JSONB DEFAULT '{"en": "EgyField", "ar": "الإيجي فيلد"}'::jsonb,
  "tagline" JSONB DEFAULT '{"en": "Premium Egyptian Agricultural Exports", "ar": "صادرات زراعية مصرية فاخرة"}'::jsonb,
  "foundedYear" INTEGER DEFAULT 2015,
  "email" TEXT DEFAULT 'info@egyfield.com',
  "phone" TEXT DEFAULT '+20 123 456 7890',
  "whatsapp" TEXT DEFAULT '+20 123 456 7890',
  "address" JSONB DEFAULT '{"en": "Cairo, Egypt", "ar": "القاهرة، مصر"}'::jsonb,
  "social" JSONB DEFAULT '{"facebook": "", "instagram": "", "linkedin": "", "youtube": ""}'::jsonb,
  "seo" JSONB DEFAULT '{"metaTitle": "EgyField — Premium Egyptian Agricultural Exports", "metaDescription": "EgyField specializes in premium Egyptian agricultural exports worldwide.", "keywords": []}'::jsonb,
  "heroImage" JSONB DEFAULT '{"url": "", "publicId": ""}'::jsonb,
  "heroImages" JSONB DEFAULT '[]'::jsonb,
  "heroTitleColor" TEXT DEFAULT '#ffffff',
  "heroSubtitleColor" TEXT DEFAULT '#ffffff',
  "heroTitle" JSONB DEFAULT '{"en": "Egypt''s Finest Agricultural Exports", "ar": "أجود الحاصلات الزراعية المصرية"}'::jsonb,
  "heroSubtitle" JSONB DEFAULT '{"en": "Premium quality pickles, fresh produce, frozen goods & grains — delivered worldwide", "ar": "مخللات ومنتجات طازجة ومجمدة وحبوب بأعلى معايير الجودة — شحن عالمي"}'::jsonb,
  "pageCovers" JSONB DEFAULT '{}'::jsonb,
  "isPartnersActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION update_updatedAt_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admins_updatedat ON admins;
CREATE TRIGGER update_admins_updatedAt BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
DROP TRIGGER IF EXISTS update_categories_updatedat ON categories;
CREATE TRIGGER update_categories_updatedAt BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
DROP TRIGGER IF EXISTS update_products_updatedat ON products;
CREATE TRIGGER update_products_updatedAt BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
DROP TRIGGER IF EXISTS update_about_contents_updatedat ON about_contents;
CREATE TRIGGER update_about_contents_updatedAt BEFORE UPDATE ON about_contents FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
DROP TRIGGER IF EXISTS update_articles_updatedat ON articles;
CREATE TRIGGER update_articles_updatedAt BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
DROP TRIGGER IF EXISTS update_inquiries_updatedat ON inquiries;
CREATE TRIGGER update_inquiries_updatedAt BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
DROP TRIGGER IF EXISTS update_partners_updatedat ON partners;
CREATE TRIGGER update_partners_updatedAt BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();
DROP TRIGGER IF EXISTS update_settings_updatedat ON settings;
CREATE TRIGGER update_settings_updatedAt BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updatedAt_column();

-- Note: The default admin (admin@egyfield.com / EgyField@2024) is seeded
-- automatically by the app on first connection.
