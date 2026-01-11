-- Marshall Ethel Enterprise Ledger Schema

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('SuperAdmin', 'Admin', 'SalesStaff');

-- 2. Create Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    has_expiry BOOLEAN DEFAULT FALSE,
    has_serials BOOLEAN DEFAULT FALSE,
    has_variants BOOLEAN DEFAULT FALSE,
    has_batches BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    description TEXT,
    buying_price DECIMAL(12,2) DEFAULT 0,
    selling_price DECIMAL(12,2) DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Warehouses Table
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK (type IN ('Warehouse', 'Store Front', 'Backroom')) DEFAULT 'Warehouse',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Batches Table
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    expiry_date DATE,
    manufactured_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Inventory Movements Table
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    from_location_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    movement_type TEXT CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RESERVE', 'RETURN')),
    reason TEXT,
    user_id UUID, -- For future Supabase Auth integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Serial Numbers Table
CREATE TABLE serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    warranty_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, serial_number)
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;

-- 9. Create Public Access Policies (Temporary workaround for Mock Login)
CREATE POLICY "Public Read Access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON categories FOR UPDATE USING (true);

CREATE POLICY "Public Read Access" ON products FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON products FOR UPDATE USING (true);

CREATE POLICY "Public Read Access" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON warehouses FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access" ON batches FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON batches FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access" ON inventory_movements FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON inventory_movements FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access" ON serial_numbers FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON serial_numbers FOR INSERT WITH CHECK (true);