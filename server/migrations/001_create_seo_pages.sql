-- Create SEO pages table for per-page/product/article SEO metadata
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(255),
  title TEXT,
  description TEXT,
  keywords JSONB DEFAULT '[]',
  ogTitle TEXT,
  ogDescription TEXT,
  ogImage TEXT,
  twitterTitle TEXT,
  twitterDescription TEXT,
  twitterImage TEXT,
  robots VARCHAR(50) DEFAULT 'index',
  follow VARCHAR(50) DEFAULT 'follow',
  canonicalUrl TEXT,
  schemaType VARCHAR(100),
  breadcrumbTitle TEXT,
  referenceType VARCHAR(50),
  referenceId VARCHAR(255),
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_seo_pages_page ON seo_pages(page);
CREATE INDEX IF NOT EXISTS idx_seo_pages_reference ON seo_pages(referenceType, referenceId);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_pages_unique ON seo_pages(
  COALESCE(page, ''),
  COALESCE(referenceType, ''),
  COALESCE(referenceId, '')
);

-- Add SEO fields to existing settings if not present
-- (settings table already has a 'seo' JSONB column from existing code)

-- Enable RLS (optional - safe default)
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
