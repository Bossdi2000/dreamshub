-- SUPABASE RLS POLICIES FOR PRODUCT DELETION (Comprehensive Access Version)
-- Run this in your Supabase SQL Editor to allow product deletion

-- 1. Products Table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow delete for all users" ON products;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON products;
CREATE POLICY "Allow delete for all users"
ON products FOR DELETE USING (true);
CREATE POLICY "Allow select for all users"
ON products FOR SELECT USING (true);
CREATE POLICY "Allow update for all users"
ON products FOR UPDATE USING (true);
CREATE POLICY "Allow insert for all users"
ON products FOR INSERT WITH CHECK (true);

-- 2. Inventory Movements Table
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow delete movements for all users" ON inventory_movements;
DROP POLICY IF EXISTS "Allow delete movements for authenticated users" ON inventory_movements;
CREATE POLICY "Allow delete movements for all users"
ON inventory_movements FOR DELETE USING (true);
CREATE POLICY "Allow access movements for all users"
ON inventory_movements FOR ALL USING (true);

-- 3. Serial Numbers Table
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow delete serials for all users" ON serial_numbers;
DROP POLICY IF EXISTS "Allow delete serials for authenticated users" ON serial_numbers;
CREATE POLICY "Allow delete serials for all users"
ON serial_numbers FOR DELETE USING (true);
CREATE POLICY "Allow access serials for all users"
ON serial_numbers FOR ALL USING (true);

-- 4. Batches Table
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow delete batches for all users" ON batches;
DROP POLICY IF EXISTS "Allow delete batches for authenticated users" ON batches;
CREATE POLICY "Allow delete batches for all users"
ON batches FOR DELETE USING (true);
CREATE POLICY "Allow access batches for all users"
ON batches FOR ALL USING (true);

-- 5. Warehouses Table (Just in case)
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access warehouses for all users" ON warehouses;
CREATE POLICY "Allow access warehouses for all users"
ON warehouses FOR ALL USING (true);

-- 6. Categories Table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access categories for all users" ON categories;
CREATE POLICY "Allow access categories for all users"
ON categories FOR ALL USING (true);

-- To check existing policies, run:
-- SELECT * FROM pg_policies WHERE tablename IN ('products', 'inventory_movements', 'serial_numbers', 'batches');
