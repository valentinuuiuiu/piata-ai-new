-- A2A Products Table
CREATE TABLE IF NOT EXISTS a2a_products (
  id BIGSERIAL PRIMARY KEY,
  external_id VARCHAR(100), -- ID from external system
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2),
  currency VARCHAR(3) DEFAULT 'EUR',
  image_url TEXT,
  product_url TEXT,
  source VARCHAR(100), -- marketplace, store, etc.
  category_slug VARCHAR(255), -- The column we need to add
  subcategory VARCHAR(255),
  brand VARCHAR(255),
  specifications JSONB DEFAULT '{}'::jsonb,
  condition VARCHAR(20) DEFAULT 'new', -- new, used, refurbished
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, sold
  agent_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_a2a_products_category_slug ON a2a_products(category_slug);
CREATE INDEX IF NOT EXISTS idx_a2a_products_status ON a2a_products(status);
CREATE INDEX IF NOT EXISTS idx_a2a_products_source ON a2a_products(source);
CREATE INDEX IF NOT EXISTS idx_a2a_products_external_id ON a2a_products(external_id);

-- Grant permissions
GRANT ALL ON a2a_products TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE a2a_products_id_seq TO authenticated, service_role;

-- Success
SELECT 'A2A Products table created successfully!' as message;