-- Fix categories and add Matrimoniale subcategories

-- 1. Ensure "Casă & Grădină" is at ID 6 (if it was 11)
UPDATE categories
SET id = 6
WHERE slug = 'casa-gradina' AND id = 11;

-- If ID 6 was already taken by something else, we might have a conflict, but standard init puts it at 6.
-- If 'casa-gradina' didn't exist at 11, this does nothing.

-- 2. Ensure "Matrimoniale" is at ID 11
INSERT INTO categories (id, name, slug, icon)
VALUES (11, 'Matrimoniale', 'matrimoniale', '💑')
ON CONFLICT (id) DO UPDATE
SET name = 'Matrimoniale', slug = 'matrimoniale', icon = '💑';

-- 3. Ensure "Cărți & Muzică" is at ID 14
INSERT INTO categories (id, name, slug, icon)
VALUES (14, 'Cărți & Muzică', 'carti-muzica', '📚')
ON CONFLICT (id) DO UPDATE
SET name = 'Cărți & Muzică', slug = 'carti-muzica', icon = '📚';

-- 4. Ensure "Cazare și Turism" is at ID 12
INSERT INTO categories (id, name, slug, icon)
VALUES (12, 'Cazare și Turism', 'cazare-turism', '✈️')
ON CONFLICT (id) DO UPDATE
SET name = 'Cazare și Turism', slug = 'cazare-turism', icon = '✈️';

-- 5. Ensure "Diverse" is at ID 13
INSERT INTO categories (id, name, slug, icon)
VALUES (13, 'Diverse', 'diverse', '📦')
ON CONFLICT (id) DO UPDATE
SET name = 'Diverse', slug = 'diverse', icon = '📦';


-- 6. Insert/Update Subcategories for Matrimoniale (ID 11)
-- Using specific IDs to avoid auto-increment collisions if possible, or just names
INSERT INTO subcategories (id, category_id, name, slug) VALUES
(40, 11, 'Femei caută bărbați', 'femei-cauta-barbati'),
(41, 11, 'Bărbați caută femei', 'barbati-cauta-femei'),
(42, 11, 'Prietenie', 'prietenie')
ON CONFLICT (id) DO UPDATE
SET category_id = 11, name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 7. Ensure subcategories for other shifted categories are linked correctly if needed
-- (Assuming subcategories table uses foreign key cascade or we need to update them manually if they were pointing to old IDs)
-- Since we kept ID 11 for Matrimoniale, if Casa & Gradina was there, its subcategories might now point to Matrimoniale!
-- We need to check if there are subcategories for ID 11 that ARE NOT Matrimoniale and move them to 6.

UPDATE subcategories
SET category_id = 6
WHERE category_id = 11
AND name NOT IN ('Femei caută bărbați', 'Bărbați caută femei', 'Prietenie');
