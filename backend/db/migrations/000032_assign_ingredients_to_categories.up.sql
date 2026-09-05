-- 000032_assign_ingredients_to_categories.up.sql

-- 1. Assign Fresh Produce items
UPDATE ingredients
SET category_id = (SELECT id FROM ingredient_categories WHERE code = 'PRODUCE' LIMIT 1)
WHERE id IN (
    '1b1cbd6b-6b12-44ee-b250-719dc7383b74', -- Fresh Lemongrass & Kaffir Lime Leaves
    '3c7d52b1-5199-4c9b-a324-4be5a532df71', -- Fresh Mint Leaves
    '447c67d0-e4b7-43c5-9219-c707b315b0aa'  -- Fresh Red Dragon Fruit
) AND category_id IS NULL;

-- 2. Assign Coconut Cream to Dairy or Sauces or Bar Bases
UPDATE ingredients
SET category_id = COALESCE(
    (SELECT id FROM ingredient_categories WHERE code = 'DAIRY' LIMIT 1),
    (SELECT id FROM ingredient_categories WHERE code = 'BAR_BASE' LIMIT 1)
)
WHERE id = 'd7998e80-f5ea-46c9-9a8b-c04f30a7c7a4' AND category_id IS NULL;

-- 3. Assign Bar & Beverage Bases (Spirits, Beers, Syrups, Soft Drinks, Juices, Ice)
-- Automatically matches category of existing 'Food Grade Crushed Ice', or 'BAR_BASE', or fallback ID '472a46bc-3c75-41fc-bbf4-83c7cecf6912'
DO $$
DECLARE
    target_bar_cat_id UUID;
BEGIN
    SELECT COALESCE(
        (SELECT category_id FROM ingredients WHERE id = '528b6cf4-6d79-4476-82fa-48639b96e342' AND category_id IS NOT NULL LIMIT 1),
        (SELECT id FROM ingredient_categories WHERE code = 'BAR_BASE' LIMIT 1),
        '472a46bc-3c75-41fc-bbf4-83c7cecf6912'::UUID
    ) INTO target_bar_cat_id;

    IF target_bar_cat_id IS NOT NULL THEN
        UPDATE ingredients
        SET category_id = target_bar_cat_id
        WHERE id IN (
            '0446512c-f829-4653-869b-b003433b87d4', -- Fresh Pineapple Juice (100% Pure)
            '06549263-b386-4268-b005-ee52626da1f4', -- Triple Sec Orange Liqueur
            '079b7d5f-4ec2-4f68-8b05-31187d5ca2c5', -- Schweppes Tonic Water 330ml Can
            '0cf01dce-458c-4344-bdc3-098cd40059ee', -- Gordon's London Dry Gin
            '38031125-739d-4342-84d2-a73b2913440e', -- Hanuman Premium Beer 330ml Can
            '46a14afa-5b78-48ce-8065-7050511e5c70', -- Aperol Italian Aperitif
            '515e8c42-8ded-4a0e-9516-1d885172d8d2', -- Monin Mojito Mint Syrup
            '528b6cf4-6d79-4476-82fa-48639b96e342', -- Food Grade Crushed Ice
            '53dd3cff-b084-4173-9e7b-c8dc4fbd6160', -- Schweppes Soda Water 330ml Can
            '5e28a82b-00ab-4b5b-9cbf-c732418a95fe', -- Pure Sugar Syrup (Simple Syrup)
            '632163c1-1095-457b-b0b8-40fbd46f12b4', -- Tequila Silver (100% Agave)
            '63476b80-a785-4b15-bcd5-8c0aa6cfed66', -- Monin Grenadine Syrup
            '78f52e4d-e96b-4cd2-8c27-c3c6593f899a', -- Corona Extra 330ml Bottle
            '80b723ea-94c5-4797-9387-4368cd30ac3f', -- Heineken 330ml Can
            '811e0c2c-562b-4685-a64b-96de988d7030', -- Tiger Beer 330ml Can
            '834c5c8f-bac9-41ef-8dee-dcbf2fd0285a', -- Angkor Beer 330ml Can
            '8cd6af82-c3db-4e56-9417-41bab98843de', -- Fresh Lime Juice
            '9a96868f-dd4a-4cc7-b587-b2a5d98cce72', -- Coca-Cola Light 330ml Can
            'aadd3de4-cc4d-4450-9252-8fadb29e0b91', -- Sprite 330ml Can
            'c0987460-feed-46af-86e8-bb6076512944', -- Schweppes Ginger Ale 330ml Can
            'c6f6b5a3-da1c-4eab-9803-a749acf3f32a', -- Coca-Cola Classic 330ml Can
            'c9e5982d-95dc-46c7-bc7b-c889ad6bece3', -- Bacardi White Superior Rum
            'ce21f363-d8ba-423b-b4ab-a19e988da1a0', -- Italian Sparkling Wine (Prosecco)
            'e0e54748-b27c-415d-b4b9-43e5253f9d21', -- Samai Premium Khmer Rum
            'e196e843-df97-4162-ad51-6558b7f01625', -- Kulen Mineral Water 500ml
            'e1c2e37e-a576-4d23-91ba-f3aaf86fbda3', -- Malibu Caribbean Coconut Liqueur
            'ed1c80a4-13af-4bd5-bf11-3577d94843f9'  -- Coca-Cola Zero 330ml Can
        ) AND (category_id IS NULL OR category_id != target_bar_cat_id);
    END IF;
END $$;
