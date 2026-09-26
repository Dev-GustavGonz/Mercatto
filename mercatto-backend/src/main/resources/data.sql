-- Mercatto Marketplace - Datos iniciales de prueba

-- 1. Categorías Principales
INSERT INTO categorias (id, nombre, slug, descripcion, icono, orden_visual, activo) VALUES
(1, 'Tecnología y Electrónica', 'tecnologia-electronica', 'Laptops, smartphones, audio y accesorios de última generación', 'Laptop', 1, true),
(2, 'Moda y Ropa', 'moda-ropa', 'Ropa para hombre, mujer, calzado y accesorios', 'Shirt', 2, true),
(3, 'Hogar y Muebles', 'hogar-muebles', 'Decoración, muebles, cocina e iluminación para tu casa', 'Home', 3, true),
(4, 'Deportes y Fitness', 'deportes-fitness', 'Equipamiento deportivo, ropa fitness y suplementación', 'Activity', 4, true),
(5, 'Belleza y Cuidado Personal', 'belleza-cuidado-personal', 'Cosméticos, cuidado de la piel y perfumería', 'Sparkles', 5, true),
(6, 'Herramientas e Industria', 'herramientas-industria', 'Herramientas eléctricas, manuales y suministros', 'Wrench', 6, true)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 2. Subcategorías
INSERT INTO categorias (id, nombre, slug, descripcion, icono, orden_visual, activo, padre_id) VALUES
(7, 'Smartphones y Celulares', 'smartphones-celulares', 'Los mejores teléfonos inteligentes', 'Smartphone', 1, true, 1),
(8, 'Computadores y Laptops', 'computadores-laptops', 'Portátiles gamers y de oficina', 'Laptop', 2, true, 1),
(9, 'Calzado Deportivo', 'calzado-deportivo', 'Tenis y zapatillas deportivas', 'Footprints', 1, true, 2),
(10, 'Cocina y Menaje', 'cocina-menaje', 'Utensilios, ollas y electrodomésticos de cocina', 'Utensils', 1, true, 3)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 3. Cupones de Descuento
INSERT INTO cupones (id, codigo, tipo, valor, monto_minimo, descuento_maximo, usos_maximos, usos_actuales, activo) VALUES
(1, 'MERCATTO10', 'PORCENTAJE', 10.0, 50000.0, 30000.0, 1000, 0, true),
(2, 'BIENVENIDO20', 'PORCENTAJE', 20.0, 80000.0, 50000.0, 500, 0, true),
(3, 'ENVIOGRATIS', 'MONTO_FIJO', 12000.0, 100000.0, 12000.0, 1000, 0, true)
ON DUPLICATE KEY UPDATE codigo=VALUES(codigo);
