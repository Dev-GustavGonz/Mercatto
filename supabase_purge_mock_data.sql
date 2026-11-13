-- ============================================================================
-- PURGA SEGURA DE DATOS MOCK DE LA FERIA - MERCATTO
-- Borra ÚNICAMENTE los registros generados con tag MOCK_DATA_2026
-- TUS TIENDAS Y PRODUCTOS MANUALES QUEDAN 100% INTACTOS
-- ============================================================================

BEGIN;

-- 1. Eliminar pagos de prueba
DELETE FROM pagos WHERE pedido_id IN (SELECT id FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%');

-- 2. Eliminar pedido_items de prueba
DELETE FROM pedido_items WHERE pedido_id IN (SELECT id FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%');

-- 3. Eliminar pedidos de prueba
DELETE FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR id >= 9001;

-- 4. Eliminar atributos de variantes de prueba
DELETE FROM variante_atributos WHERE variante_id >= 8001 OR variante_id IN (SELECT id FROM producto_variantes WHERE sku LIKE 'SEED-%' OR producto_id >= 7001);

-- 5. Eliminar variantes de productos de prueba
DELETE FROM producto_variantes WHERE id >= 8001 OR sku LIKE 'SEED-%' OR producto_id >= 7001;

-- 6. Eliminar imágenes de productos de prueba
DELETE FROM producto_imagenes WHERE id >= 7001 OR producto_id >= 7001;

-- 7. Eliminar productos generados por seed
DELETE FROM productos WHERE id >= 7001 OR sku LIKE 'SEED-%' OR vendedor_id >= 6001;

-- 8. Eliminar tiendas de prueba
DELETE FROM vendedores WHERE id >= 6001 OR usuario_id IN (SELECT id FROM usuarios WHERE google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co');

-- 9. Eliminar direcciones de compradores de prueba
DELETE FROM direcciones WHERE id >= 5001 OR usuario_id >= 5001 OR usuario_id IN (SELECT id FROM usuarios WHERE google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co');

-- 10. Eliminar usuarios de prueba (compradores y vendedores)
DELETE FROM usuarios WHERE id >= 5001 OR google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co';

-- 11. Sincronizar secuencias con los datos reales restantes
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1));
SELECT setval(pg_get_serial_sequence('direcciones', 'id'), COALESCE((SELECT MAX(id) FROM direcciones), 1));
SELECT setval(pg_get_serial_sequence('vendedores', 'id'), COALESCE((SELECT MAX(id) FROM vendedores), 1));
SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1));
SELECT setval(pg_get_serial_sequence('producto_imagenes', 'id'), COALESCE((SELECT MAX(id) FROM producto_imagenes), 1));
SELECT setval(pg_get_serial_sequence('producto_variantes', 'id'), COALESCE((SELECT MAX(id) FROM producto_variantes), 1));
SELECT setval(pg_get_serial_sequence('variante_atributos', 'id'), COALESCE((SELECT MAX(id) FROM variante_atributos), 1));
SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1));
SELECT setval(pg_get_serial_sequence('pedido_items', 'id'), COALESCE((SELECT MAX(id) FROM pedido_items), 1));
SELECT setval(pg_get_serial_sequence('pagos', 'id'), COALESCE((SELECT MAX(id) FROM pagos), 1));

COMMIT;
