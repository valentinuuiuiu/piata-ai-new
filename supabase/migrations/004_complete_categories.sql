-- Add missing categories and subcategories
INSERT INTO categories (id, name, slug, icon) VALUES
(11, 'Matrimoniale', 'matrimoniale', '💑'),
(12, 'Mama și Copilul', 'mama-si-copilul', '👶'),
(13, 'Cazare și Turism', 'cazare-turism', '✈️️'),
(14, 'Diverse', 'diverse', '📦')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    icon = EXCLUDED.icon;

-- Add missing subcategories for all categories
INSERT INTO subcategories (category_id, name, slug) VALUES
-- Matrimoniale (11)
(11, 1, 'Căsătorie', 'casatorie'),
(11, 2, 'Relații serioase', 'relatii-serioase'),
(11, 3, 'Prietenie', 'prietenie'),
(11, 4, 'Intâlniri', 'intalniri'),

-- Mama și Copilul (12)
(12, 1, 'Haine copii', 'haine-copii'),
(12, 2, 'Jucării', 'jucarii'),
(12, 3, 'Carucioare', 'carucioare'),
(12, 4, 'Îngrijire copil', 'ingrijire-copil'),
(12, 5, 'Mobilitate bebeluși', 'mobilitate-bebelusi'),
(12, 6, 'Alăptare', 'alaptare'),
(12, 7, 'Siguranță copil', 'siguranta-copil'),
(12, 8, 'Camere copii', 'camere-copii'),

-- Cazare și Turism (13)
(13, 1, 'Garsoniere de închiriat', 'garsoniere-inchiriat'),
(13, 2, 'Apartamente de închiriat', 'apartamente-inchiriat'),
(13, 3, 'Case de vacanță', 'case-vacanta'),
(13, 4, 'Camere de oaspeți', 'camere-oaspeti'),
(13, 5, 'Pensiuni', 'pensuni'),
(13, 6, 'Hoteluri', 'hoteluri'),
(13, 7, 'Agenții turism', 'agentii-turism'),

-- Diverse (14)
(14, 1, 'Electrocasnice', 'electrocasnice'),
(14, 2, 'Mobiliere', 'mobiliere'),
(14, 3, 'Unelte', 'unelte'),
(14, 4, 'Sport', 'sport'),
(14, 5, 'Cărți', 'carti'),
(14, 6, 'Muzică', 'muzica'),
(14, 7, 'Artă și obiecte de colecție', 'arta-obiecte-colectie'),
(14, 8, 'Bilete și evenimente', 'bilete-evenimente')

ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Update existing categories with missing subcategories
-- Imobiliare (1) - should have 8
INSERT INTO subcategories (category_id, name, slug) VALUES
(1, 9, 'Terenuri', 'terenuri'),
(1, 10, 'Spații comerciale', 'spatii-comerciale'),
(1, 11, 'Inchiriere pe termen scurt', 'inchiriere-termen-scurt'),
(1, 12, 'Schimburi imobiliare', 'schimburi-imobiliare')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Electronice (3) - should have 10
INSERT INTO subcategories (category_id, name, slug) VALUES
(3, 11, 'Componente PC', 'componente-pc'),
(3, 12, 'Software', 'software')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Casă și Grădină (6) - should have 8
INSERT INTO subcategories (category_id, name, slug) VALUES
(6, 9, 'Unelte grădină', 'unelte-gradina'),
(6, 10, 'Piscină', 'piscina'),
(6, 11, 'Mobilieră grădină', 'mobilierie-gradina'),
(6, 12, 'Decorațiuni', 'decoratiuni')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Auto Moto (2) - should have 10
INSERT INTO subcategories (category_id, name, slug) VALUES
(2, 11, 'Motociclete', 'motociclete'),
(2, 12, 'Vehicule comerciale', 'vehicule-comerciale')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Modă și Accesorii (4) - should have 8
INSERT INTO subcategories (category_id, name, slug) VALUES
(4, 9, 'Genți', 'genti'),
(4, 10, 'Ceasuri', 'ceasuri'),
(4, 11, 'Bijuterii', 'bijuterii'),
(4, 12, 'Accesorii modă', 'accesorii-moda')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Sport & Hobby (7) - should have 7
INSERT INTO subcategories (category_id, name, slug) VALUES
(7, 8, 'Echipament sport', 'echipament-sport'),
(7, 9, 'Biciclete', 'biciclete'),
(7, 10, 'Camping', 'camping'),
(7, 11, 'Pescuit', 'pescuit'),
(7, 12, 'Arte marțiale', 'arte-martiale')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Locuri de Muncă (9) - should have 10
INSERT INTO subcategories (category_id, name, slug) VALUES
(9, 11, 'Marketing', 'marketing'),
(9, 12, 'IT și Telecomunicații', 'it-telecomunicatii')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Servicii (5) - should have 9
INSERT INTO subcategories (category_id, name, slug) VALUES
(5, 10, 'Consultanță', 'consultanta'),
(5, 11, 'Formare', 'formare'),
(5, 12, 'Reparații', 'reparatii')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Animale (8) - should have 7
INSERT INTO subcategories (category_id, name, slug) VALUES
(8, 8, 'Accesorii animale', 'accesorii-animale'),
(8, 9, 'Servicii animale', 'servicii-animale'),
(8, 10, 'Hrană animale', 'hrana-animale')
ON CONFLICT (category_id, name) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Update category counts to match target
UPDATE categories SET 
    name = CASE id
        WHEN 1 THEN 'Imobiliare (12 subcategorii)'
        WHEN 2 THEN 'Auto Moto (12 subcategorii)'
        WHEN 3 THEN 'Electronice (12 subcategorii)'
        WHEN 4 THEN 'Modă și Accesorii (12 subcategorii)'
        WHEN 5 THEN 'Servicii (12 subcategorii)'
        WHEN 6 THEN 'Casă și Grădină (12 subcategorii)'
        WHEN 7 THEN 'Sport & Hobby (11 subcategorii)'
        WHEN 8 THEN 'Animale (10 subcategorii)'
        WHEN 9 THEN 'Locuri de Muncă (12 subcategorii)'
        WHEN 10 THEN 'Mama și Copilul (8 subcategorii)'
        WHEN 11 THEN 'Matrimoniale (4 subcategorii)'
        WHEN 12 THEN 'Mama și Copilul (8 subcategorii)'
        WHEN 13 THEN 'Cazare și Turism (7 subcategorii)'
        WHEN 14 THEN 'Diverse (8 subcategorii)'
        ELSE name
    END
WHERE id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14);