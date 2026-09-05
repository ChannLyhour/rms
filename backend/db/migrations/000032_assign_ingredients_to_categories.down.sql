-- 000032_assign_ingredients_to_categories.down.sql

UPDATE ingredients
SET category_id = NULL
WHERE id IN (
    '0446512c-f829-4653-869b-b003433b87d4',
    '06549263-b386-4268-b005-ee52626da1f4',
    '079b7d5f-4ec2-4f68-8b05-31187d5ca2c5',
    '0cf01dce-458c-4344-bdc3-098cd40059ee',
    '1b1cbd6b-6b12-44ee-b250-719dc7383b74',
    '38031125-739d-4342-84d2-a73b2913440e',
    '3c7d52b1-5199-4c9b-a324-4be5a532df71',
    '447c67d0-e4b7-43c5-9219-c707b315b0aa',
    '46a14afa-5b78-48ce-8065-7050511e5c70',
    '515e8c42-8ded-4a0e-9516-1d885172d8d2',
    '53dd3cff-b084-4173-9e7b-c8dc4fbd6160',
    '5e28a82b-00ab-4b5b-9cbf-c732418a95fe',
    '632163c1-1095-457b-b0b8-40fbd46f12b4',
    '63476b80-a785-4b15-bcd5-8c0aa6cfed66',
    '78f52e4d-e96b-4cd2-8c27-c3c6593f899a',
    '80b723ea-94c5-4797-9387-4368cd30ac3f',
    '811e0c2c-562b-4685-a64b-96de988d7030',
    '834c5c8f-bac9-41ef-8dee-dcbf2fd0285a',
    '8cd6af82-c3db-4e56-9417-41bab98843de',
    '9a96868f-dd4a-4cc7-b587-b2a5d98cce72',
    'aadd3de4-cc4d-4450-9252-8fadb29e0b91',
    'c0987460-feed-46af-86e8-bb6076512944',
    'c6f6b5a3-da1c-4eab-9803-a749acf3f32a',
    'c9e5982d-95dc-46c7-bc7b-c889ad6bece3',
    'ce21f363-d8ba-423b-b4ab-a19e988da1a0',
    'd7998e80-f5ea-46c9-9a8b-c04f30a7c7a4',
    'e0e54748-b27c-415d-b4b9-43e5253f9d21',
    'e196e843-df97-4162-ad51-6558b7f01625',
    'e1c2e37e-a576-4d23-91ba-f3aaf86fbda3',
    'ed1c80a4-13af-4bd5-bf11-3577d94843f9'
);
