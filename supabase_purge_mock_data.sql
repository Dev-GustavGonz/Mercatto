-- ============================================================================
-- PURGA SEGURA DE DATOS MOCK DE LA FERIA - MERCATTO
-- Borra ÚNICAMENTE los registros generados con tag SEED_FERIA / MOCK_DATA_2026
-- TUS TIENDAS Y PRODUCTOS MANUALES QUEDAN 100% INTACTOS
-- ============================================================================

BEGIN;

-- 1. Eliminar pagos de prueba
DELETE FROM pagos WHERE pedido_id IN (SELECT id FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%');

-- 2. Eliminar pedido_items de prueba
DELETE FROM pedido_items WHERE pedido_id IN (SELECT id FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%');

-- 3. Eliminar pedidos de prueba
DELETE FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%';

-- 4. Eliminar productos generados por seed (sus variantes e imágenes caen en cascada)
DELETE FROM productos WHERE sku LIKE 'SEED-%' OR vendedor_id IN (SELECT v.id FROM vendedores v JOIN usuarios u ON v.usuario_id = u.id WHERE u.proveedor = 'SEED_FERIA' OR u.google_id = 'MOCK_DATA_2026');

-- 5. Eliminar tiendas de prueba
DELETE FROM vendedores WHERE usuario_id IN (SELECT id FROM usuarios WHERE proveedor = 'SEED_FERIA' OR google_id = 'MOCK_DATA_2026');

-- 6. Eliminar direcciones de compradores de prueba
DELETE FROM direcciones WHERE usuario_id IN (SELECT id FROM usuarios WHERE proveedor = 'SEED_FERIA' OR google_id = 'MOCK_DATA_2026');

-- 7. Eliminar usuarios de prueba (compradores y vendedores)
DELETE FROM usuarios WHERE proveedor = 'SEED_FERIA' OR google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co';

-- 8. Sincronizar secuencias con los datos reales restantes
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1));
SELECT setval(pg_get_serial_sequence('direcciones', 'id'), COALESCE((SELECT MAX(id) FROM direcciones), 1));
SELECT setval(pg_get_serial_sequence('vendedores', 'id'), COALESCE((SELECT MAX(id) FROM vendedores), 1));
SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1));
SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1));

COMMIT;
