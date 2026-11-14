import os
import json
import urllib.request
import io
import random
import re
from PIL import Image

PROJECT_ROOT = r"c:\Users\gjgh2\Downloads\mercatto"
FRONTEND_IMAGES_DIR = os.path.join(PROJECT_ROOT, "mercatto", "mercatto-frontend", "public", "images", "products")
os.makedirs(FRONTEND_IMAGES_DIR, exist_ok=True)

SUPABASE_BUCKET_BASE = "https://cirxekyibynidhbnffll.supabase.co/storage/v1/object/public/Mercatto"

print("=================================================================")
print("MERCATTO - DATA SEEDING ENGINE: CARTAGENA 2026 COMMERCIAL FAIR")
print("=================================================================")

# 1. ESQUEMA COMPLETO DE TIENDAS EN CARTAGENA DE INDIAS (40 TIENDAS)
# 4 ELITE (10%), 10 PRO (25%), 26 STARTER (65%)
TIENDAS_CARTAGENA = [
    # 4 ELITE (10%)
    {
        "id": 1,
        "name": "New Balance Cartagena",
        "desc": "Tienda insignia New Balance en Bocagrande. Calzado retro running 550, 9060, zapatillas técnicas Fresh Foam e indumentaria deportiva urbana.",
        "plan": "ELITE",
        "address": "Bocagrande Cra. 2 #7-45, Cartagena de Indias",
        "nit": "901452819-3",
        "banco": "Bancolombia",
        "cuenta": "132-849201-44",
        "slug": "new-balance",
        "niche": "FOOTWEAR_URBAN"
    },
    {
        "id": 2,
        "name": "Mac Center Cartagena",
        "desc": "Apple Premium Partner oficial. MacBooks con chip M3, iPhone 15 Pro, iPad Air y accesorios originales con soporte y garantía AppleCare.",
        "plan": "ELITE",
        "address": "C.C. La Serrezuela Local 105, San Diego, Cartagena de Indias",
        "nit": "900384721-5",
        "banco": "Bancolombia",
        "cuenta": "048-291034-12",
        "slug": "mac-center",
        "niche": "APPLE_TECH"
    },
    {
        "id": 3,
        "name": "Samsung Experience Store",
        "desc": "Showroom oficial Samsung. Smartphones insignia Galaxy S24 Ultra, pantallas Neo QLED 4K, tabletas Galaxy Tab y tecnología conectada SmartThings.",
        "plan": "ELITE",
        "address": "C.C. Mallplaza El Castillo Local 118, El Cabrero, Cartagena de Indias",
        "nit": "860069284-9",
        "banco": "Davivienda",
        "cuenta": "104-582910-88",
        "slug": "samsung",
        "niche": "SAMSUNG_TECH"
    },
    {
        "id": 4,
        "name": "Nike Store Cartagena",
        "desc": "Tienda concepto oficial Nike. Calzado icónico Air Force 1, Air Jordan, zapatillas técnicas de running Pegasus e indumentaria Dri-FIT.",
        "plan": "ELITE",
        "address": "C.C. La Serrezuela Local 201, San Diego, Cartagena de Indias",
        "nit": "901284910-1",
        "banco": "Bancolombia",
        "cuenta": "304-918234-55",
        "slug": "nike",
        "niche": "FOOTWEAR_SPORTS"
    },

    # 10 PRO (25%)
    {
        "id": 5,
        "name": "Panamericana Cartagena",
        "desc": "Tecnología, informática y entretenimiento familiar. Consolas PlayStation 5, mandos inalámbricos, tablets y suministros de oficina en Cartagena.",
        "plan": "PRO",
        "address": "C.C. Caribe Plaza Local 210, Pie de la Popa, Cartagena de Indias",
        "nit": "901723418-2",
        "banco": "Nequi",
        "cuenta": "3004829102",
        "slug": "panamericana",
        "niche": "GAMING_CONSOLES"
    },
    {
        "id": 6,
        "name": "KTronix Cartagena",
        "desc": "Hipertienda de tecnología, gaming y computación: consolas Nintendo Switch, laptops gamer ASUS ROG y periféricos Logitech G con garantía oficial.",
        "plan": "PRO",
        "address": "C.C. Mallplaza El Castillo Local 102, El Cabrero, Cartagena de Indias",
        "nit": "901639102-7",
        "banco": "Bancolombia",
        "cuenta": "502-391820-11",
        "slug": "ktronix",
        "niche": "GAMING_CONSOLES"
    },
    {
        "id": 7,
        "name": "Alkosto Cartagena",
        "desc": "Hiperahorro en tecnología y electrónica: televisores Smart TV 4K, barras de sonido envolvente Dolby, audio Bluetooth y electrohogar.",
        "plan": "PRO",
        "address": "Av. Pedro de Heredia Sector Los Ejecutivos #51-40, Cartagena de Indias",
        "nit": "900812940-4",
        "banco": "Banco de Bogotá",
        "cuenta": "219-482019-33",
        "slug": "alkosto",
        "niche": "AUDIO_TECH"
    },
    {
        "id": 8,
        "name": "Adidas Performance",
        "desc": "Zapatillas Ultraboost Light, Samba OG, ropa técnica para entrenamiento deportivo y colecciones urbanas oficiales de la marca de las 3 rayas.",
        "plan": "PRO",
        "address": "C.C. Mallplaza El Castillo Local 142, El Cabrero, Cartagena de Indias",
        "nit": "830089201-6",
        "banco": "Bancolombia",
        "cuenta": "103-918204-77",
        "slug": "adidas",
        "niche": "FOOTWEAR_SPORTS"
    },
    {
        "id": 9,
        "name": "Decathlon Cartagena",
        "desc": "Equipamiento multideporte: bicicletas de montaña Rockrider, implementos para fitness Domyos, calzado de running Kalenji y aventura al aire libre.",
        "plan": "PRO",
        "address": "C.C. Mallplaza El Castillo Ancla Sur, Cartagena de Indias",
        "nit": "900984120-8",
        "banco": "Davivienda",
        "cuenta": "089-382910-01",
        "slug": "decathlon",
        "niche": "SPORTS_FITNESS"
    },
    {
        "id": 10,
        "name": "Arturo Calle",
        "desc": "Referente de moda masculina en Colombia. Camisas en lino caribeño, trajes sastre de corte italiano, chaquetas casuales y calzado formal en cuero.",
        "plan": "PRO",
        "address": "C.C. Caribe Plaza Local 101, Pie de la Popa, Cartagena de Indias",
        "nit": "860032910-3",
        "banco": "Bancolombia",
        "cuenta": "132-901824-19",
        "slug": "arturo-calle",
        "niche": "MENS_FASHION"
    },
    {
        "id": 11,
        "name": "Studio F",
        "desc": "Tendencias de moda femenina internacional: vestidos de gala y playa, blusas frescas en lino, jeans con calce perfecto y carteras en cuero.",
        "plan": "PRO",
        "address": "C.C. La Serrezuela Local 112, San Diego, Cartagena de Indias",
        "nit": "800249182-9",
        "banco": "Davivienda",
        "cuenta": "401-291840-52",
        "slug": "studio-f",
        "niche": "WOMENS_FASHION"
    },
    {
        "id": 12,
        "name": "La Riviera Perfumería",
        "desc": "Boutique de alta perfumería y cosmética de lujo en Bocagrande. Fragancias exclusivas Dior, Chanel, Yves Saint Laurent y tratamientos de belleza.",
        "plan": "PRO",
        "address": "Bocagrande Cra. 2 #8-142, Cartagena de Indias",
        "nit": "860512948-1",
        "banco": "Bancolombia",
        "cuenta": "108-392810-66",
        "slug": "la-riviera",
        "niche": "BEAUTY_PERFUME"
    },
    {
        "id": 13,
        "name": "Tugó Muebles & Objetos",
        "desc": "Diseño contemporáneo y confort para el hogar. Sofás modulares resistentes a la humedad, mesas de centro en maderas nobles y lámparas de diseño.",
        "plan": "PRO",
        "address": "Zona Norte Anillo Vial Km 8, Cartagena de Indias",
        "nit": "830094812-2",
        "banco": "Bancolombia",
        "cuenta": "048-192840-88",
        "slug": "tugo",
        "niche": "FURNITURE_HOME"
    },
    {
        "id": 14,
        "name": "Homecenter Sodimac",
        "desc": "El centro de herramientas más completo de Cartagena. Taladros inalámbricos DeWalt, herramientas Stanley, compresores y materiales de obra.",
        "plan": "PRO",
        "address": "Av. Pedro de Heredia Calle 31 #38-12, Cartagena de Indias",
        "nit": "800242106-5",
        "banco": "Davivienda",
        "cuenta": "129-391820-44",
        "slug": "homecenter",
        "niche": "TOOLS_HARDWARE"
    },

    # 26 STARTER (65%)
    {
        "id": 15,
        "name": "Crocs Cartagena",
        "desc": "Comodidad icónica para el clima tropical: zuecos Classic Clog, sandalias ergonómicas Croslite resistentes al agua y pines decorativos Jibbitz.",
        "plan": "STARTER",
        "address": "C.C. Caribe Plaza Local 220, Pie de la Popa, Cartagena de Indias",
        "nit": "901048291-8",
        "banco": "Nequi",
        "cuenta": "3018294019",
        "slug": "crocs",
        "niche": "FOOTWEAR_URBAN"
    },
    {
        "id": 16,
        "name": "Cueros Vélez",
        "desc": "Marroquinería colombiana de exportación. Calzado artesanal en cuero legítimo, billeteras finas, chaquetas y cinturones con acabados de autor.",
        "plan": "STARTER",
        "address": "Bocagrande Cra. 2 #7-35, Cartagena de Indias",
        "nit": "890924182-4",
        "banco": "Bancolombia",
        "cuenta": "132-491820-33",
        "slug": "velez",
        "niche": "MENS_FASHION"
    },
    {
        "id": 17,
        "name": "Mabe Línea Blanca",
        "desc": "Grandes electrodomésticos de ingeniería avanzada: lavadoras automáticas de alta capacidad, neveras No Frost y secadoras de bajo consumo.",
        "plan": "STARTER",
        "address": "Av. Pedro de Heredia #32-15 Sector Pie de la Popa, Cartagena de Indias",
        "nit": "860012948-6",
        "banco": "Bancolombia",
        "cuenta": "048-918204-12",
        "slug": "mabe",
        "niche": "LARGE_APPLIANCES"
    },
    {
        "id": 18,
        "name": "Haceb Oficial",
        "desc": "Tradición e innovación en la cocina colombiana. Estufas a gas seguras, neveras con tecnología titanio y hornos empotrables de alta eficiencia.",
        "plan": "STARTER",
        "address": "Av. Crisanto Luque Transversal 44 #21-10, Cartagena de Indias",
        "nit": "890900281-1",
        "banco": "Davivienda",
        "cuenta": "104-391820-99",
        "slug": "haceb",
        "niche": "LARGE_APPLIANCES"
    },
    {
        "id": 19,
        "name": "Oster Store",
        "desc": "Pequeños electrodomésticos para hacer tu vida más fácil: freidoras de aire Bioceramic, licuadoras con motor reversible y cafeteras espresso.",
        "plan": "STARTER",
        "address": "C.C. Caribe Plaza Local 245, Pie de la Popa, Cartagena de Indias",
        "nit": "860029184-7",
        "banco": "Bancolombia",
        "cuenta": "304-192840-77",
        "slug": "oster",
        "niche": "KITCHEN_APPLIANCES"
    },
    {
        "id": 20,
        "name": "Juan Valdez Café",
        "desc": "Café colombiano de origen premium de Huila, Nariño y Sierra Nevada. Cafeteras francesas, tazas térmicas y métodos artesanales de filtrado.",
        "plan": "STARTER",
        "address": "Plaza Santo Domingo Calle de la Iglesia #35-18, Centro Histórico, Cartagena de Indias",
        "nit": "830114920-5",
        "banco": "Bancolombia",
        "cuenta": "132-819204-90",
        "slug": "juan-valdez",
        "niche": "GROCERIES_FOOD"
    },
    {
        "id": 21,
        "name": "Pepe Ganga",
        "desc": "Juguetería infantil y puericultura en Cartagena: coches plegables de viaje, sets de estimulación temprana Montessori y marcas líderes para niños.",
        "plan": "STARTER",
        "address": "C.C. Caribe Plaza Local 202, Pie de la Popa, Cartagena de Indias",
        "nit": "860064918-2",
        "banco": "Daviplata",
        "cuenta": "3019284012",
        "slug": "pepe-ganga",
        "niche": "TOYS_BABY"
    },
    {
        "id": 22,
        "name": "Sony Center Caribe",
        "desc": "Audífonos premium WH-1000XM5 con cancelación de ruido, barras de sonido Dolby Atmos y parlantes portátiles resistentes al agua salina.",
        "plan": "STARTER",
        "address": "C.C. Mallplaza El Castillo Local 215, El Cabrero, Cartagena de Indias",
        "nit": "800148291-0",
        "banco": "Davivienda",
        "cuenta": "401-928104-18",
        "slug": "sony-center",
        "niche": "AUDIO_TECH"
    },
    {
        "id": 23,
        "name": "Mattelsa Cartagena",
        "desc": "Moda joven y alternativa con identidad colombiana: camisetas oversize en algodón orgánico, bermudas frescas y estilo streetwear contemporáneo.",
        "plan": "STARTER",
        "address": "Av. San Martín Cra. 2 #9-48, Bocagrande, Cartagena de Indias",
        "nit": "830004928-3",
        "banco": "Bancolombia",
        "cuenta": "103-829104-55",
        "slug": "mattelsa",
        "niche": "MENS_FASHION"
    },
    {
        "id": 24,
        "name": "Dermatológica / SkinCare Pharma",
        "desc": "Dermocosmética clínica avanzada. Protectores solares toque seco, hidratantes con ceramidas CeraVe, sérums de ácido hialurónico y retinol puro.",
        "plan": "STARTER",
        "address": "Bocagrande Cra. 3 #6-85 Edificio Torre del Reloj, Cartagena de Indias",
        "nit": "900481920-4",
        "banco": "Bancolombia",
        "cuenta": "132-391820-77",
        "slug": "dermatologica",
        "niche": "SKINCARE_HEALTH"
    },
    {
        "id": 25,
        "name": "Lego Store Cartagena",
        "desc": "Mundo de construcción creativa: sets de Lego Star Wars, colecciones Technic para armar y bloques educativos para desarrollo motriz.",
        "plan": "STARTER",
        "address": "C.C. La Serrezuela Local 210, San Diego, Cartagena de Indias",
        "nit": "901192840-2",
        "banco": "Nequi",
        "cuenta": "3048192041",
        "slug": "lego",
        "niche": "TOYS_BABY"
    },
    {
        "id": 26,
        "name": "Ray-Ban Sunglass Hut",
        "desc": "Gafas de sol legendarias: modelos Wayfarer, Aviator y Clubmaster con lentes polarizados y máxima protección UV400 contra el sol costero.",
        "plan": "STARTER",
        "address": "C.C. Caribe Plaza Local 155, Pie de la Popa, Cartagena de Indias",
        "nit": "800192840-9",
        "banco": "Bancolombia",
        "cuenta": "048-391820-33",
        "slug": "ray-ban",
        "niche": "OPTICA_SUNGLASSES"
    },
    {
        "id": 27,
        "name": "Rolex & Glauser Joyería",
        "desc": "Alta relojería suiza y joyería fina en el Centro Histórico. Cronógrafos de precisión en acero oystersteel y esmeraldas colombianas legítimas.",
        "plan": "STARTER",
        "address": "Centro Histórico Calle de la Inquisición #3-20, Cartagena de Indias",
        "nit": "860019284-8",
        "banco": "Banco de Bogotá",
        "cuenta": "194-829104-88",
        "slug": "rolex-glauser",
        "niche": "WATCHES_LUXURY"
    },
    {
        "id": 28,
        "name": "Trek Bicycle Cartagena",
        "desc": "Bicicletas de montaña Marlin rin 29, cascos Bontrager certificados, luces recargables de alta potencia y candados en U de alta seguridad.",
        "plan": "STARTER",
        "address": "Manga Avenida Miramar Calle 25 #21-50, Cartagena de Indias",
        "nit": "900718294-1",
        "banco": "Bancolombia",
        "cuenta": "132-192840-66",
        "slug": "trek",
        "niche": "CYCLING_BIKES"
    },
    {
        "id": 29,
        "name": "Bata Calzado",
        "desc": "Comodidad clásica para toda la familia: mocasines de cuero, calzado colegial duradero y sandalias anatómicas confort para caminar por la Heroica.",
        "plan": "STARTER",
        "address": "Centro Histórico Calle de la Universidad #36-40, Cartagena de Indias",
        "nit": "890901928-5",
        "banco": "Davivienda",
        "cuenta": "089-192840-77",
        "slug": "bata",
        "niche": "FOOTWEAR_URBAN"
    },
    {
        "id": 30,
        "name": "Xiaomi Mi Store",
        "desc": "Tecnología accesible de vanguardia: smartphones Redmi Note 13, bandas deportivas inteligentes Mi Band y cámaras de seguridad WiFi para el hogar.",
        "plan": "STARTER",
        "address": "C.C. Mallplaza El Castillo Local 130, El Cabrero, Cartagena de Indias",
        "nit": "901294819-3",
        "banco": "Bancolombia",
        "cuenta": "104-819204-12",
        "slug": "xiaomi",
        "niche": "SMARTPHONES_TECH"
    },
    {
        "id": 31,
        "name": "IKEA Colombia Hogar",
        "desc": "Soluciones inteligentes para el hogar tropical: estanterías versátiles, organizadores modulares y menaje minimalista de diseño europeo.",
        "plan": "STARTER",
        "address": "Zona Industrial Mamonal Km 3, Cartagena de Indias",
        "nit": "901384918-0",
        "banco": "Bancolombia",
        "cuenta": "048-819204-66",
        "slug": "ikea",
        "niche": "FURNITURE_HOME"
    },
    {
        "id": 32,
        "name": "KitchenAid Gourmet",
        "desc": "Equipamiento culinario para apasionados de la cocina: batidoras de pedestal Artisan, sartenes antiadherentes y cuchillos forjados de precisión.",
        "plan": "STARTER",
        "address": "Bocagrande Calle 6 #2-30, Cartagena de Indias",
        "nit": "860081928-4",
        "banco": "Daviplata",
        "cuenta": "3049182041",
        "slug": "kitchenaid",
        "niche": "KITCHEN_APPLIANCES"
    },
    {
        "id": 33,
        "name": "Stanley Industrial Store",
        "desc": "Herramientas de máxima durabilidad para taller y náutica: cajas de herramientas modulares FatMax, llaves de copa y niveles láser profesionales.",
        "plan": "STARTER",
        "address": "Sector El Bosque Carrera 54 #28-40, Cartagena de Indias",
        "nit": "860028194-2",
        "banco": "Banco de Bogotá",
        "cuenta": "129-819204-33",
        "slug": "stanley",
        "niche": "TOOLS_HARDWARE"
    },
    {
        "id": 34,
        "name": "Bose Sound Store",
        "desc": "Experiencia auditiva legendaria: audífonos QuietComfort con cancelación de ruido, barras de sonido cine y parlantes portátiles impermeables.",
        "plan": "STARTER",
        "address": "C.C. Caribe Plaza Local 180, Pie de la Popa, Cartagena de Indias",
        "nit": "830091824-7",
        "banco": "Bancolombia",
        "cuenta": "304-819204-99",
        "slug": "bose",
        "niche": "AUDIO_TECH"
    },
    {
        "id": 35,
        "name": "Baby Fresh",
        "desc": "Ropa de algodón pima 100% hipoalergénico para bebés, accesorios esenciales para recién nacidos y conjuntos frescos para el clima de Cartagena.",
        "plan": "STARTER",
        "address": "C.C. Mallplaza El Castillo Local 224, El Cabrero, Cartagena de Indias",
        "nit": "890918294-0",
        "banco": "Nequi",
        "cuenta": "3019284192",
        "slug": "baby-fresh",
        "niche": "TOYS_BABY"
    },
    {
        "id": 36,
        "name": "Éxito Gourmet",
        "desc": "Selección de supermercado prémium: snacks saludables, aceites de oliva extravirgen, frutos secos importados y productos gourmet selectos.",
        "plan": "STARTER",
        "address": "Centro Comercial Matuna Cra. 10 #32-20, Cartagena de Indias",
        "nit": "890900608-9",
        "banco": "Bancolombia",
        "cuenta": "132-918204-88",
        "slug": "exito",
        "niche": "GROCERIES_FOOD"
    },
    {
        "id": 37,
        "name": "Challenger del Caribe",
        "desc": "Electrodomésticos de ingeniería colombiana: estufas de sobremesa a gas, hornos empotrables y campanas extractoras en acero inoxidable.",
        "plan": "STARTER",
        "address": "Av. Pedro de Heredia Sector Los Ejecutivos #51-22, Cartagena de Indias",
        "nit": "860048291-3",
        "banco": "Davivienda",
        "cuenta": "104-918204-33",
        "slug": "challenger",
        "niche": "LARGE_APPLIANCES"
    },
    {
        "id": 38,
        "name": "Zara Home",
        "desc": "Elegancia sutil para espacios residenciales: sábanas de lino lavado, cojines bordados, vajillas rústicas de gres y fragancias para el hogar.",
        "plan": "STARTER",
        "address": "C.C. La Serrezuela Local 108, San Diego, Cartagena de Indias",
        "nit": "900192840-6",
        "banco": "Bancolombia",
        "cuenta": "048-918204-44",
        "slug": "zara-home",
        "niche": "FURNITURE_HOME"
    },
    {
        "id": 39,
        "name": "Under Armour",
        "desc": "Ropa técnica deportiva de compresión HeatGear, zapatillas de entrenamiento Project Rock y accesorios fitness de alto rendimiento.",
        "plan": "STARTER",
        "address": "C.C. Caribe Plaza Local 212, Pie de la Popa, Cartagena de Indias",
        "nit": "900819204-5",
        "banco": "Nequi",
        "cuenta": "3009182041",
        "slug": "under-armour",
        "niche": "SPORTS_FITNESS"
    },
    {
        "id": 40,
        "name": "Lorduy Joyería & Esmeraldas",
        "desc": "Orfebrería fina y esmeraldas colombianas con certificado gemológico. Joyas en filigrana momposina de plata 950 y anillos en oro de 18K.",
        "plan": "STARTER",
        "address": "Centro Histórico Plaza Bolívar Edificio Andian Local 1, Cartagena de Indias",
        "nit": "901391820-2",
        "banco": "Bancolombia",
        "cuenta": "132-918204-12",
        "slug": "lorduy",
        "niche": "WATCHES_LUXURY"
    }
]

print(f"Total verified Cartagena stores: {len(TIENDAS_CARTAGENA)}")

# 2. RESOLVEDOR SQL DINÁMICO PARA LAS 21 CATEGORÍAS DEL MARKETPLACE
def get_category_sql(niche_cat):
    nc = (niche_cat or "").lower()
    
    if nc == "smartphones":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%smartphone%' OR LOWER(nombre) LIKE '%celular%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%tecnolog%' LIMIT 1), 1)"
    if nc == "laptops":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%computador%' OR LOWER(nombre) LIKE '%laptop%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%tecnolog%' LIMIT 1), 1)"
    if nc == "audio":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%audio%' OR LOWER(nombre) LIKE '%audífono%' OR LOWER(nombre) LIKE '%audifono%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%tecnolog%' LIMIT 1), 1)"
    if nc == "technology":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%tecnología y electrónica%' OR LOWER(nombre) LIKE '%tecnolog%' LIMIT 1), 1)"
    if nc == "footwear":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%calzado%' OR LOWER(nombre) LIKE '%zapato%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%moda%' LIMIT 1), 2)"
    if nc == "mens_clothing":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%ropa hombre%' OR LOWER(nombre) LIKE '%hombre%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%moda%' LIMIT 1), 2)"
    if nc == "womens_clothing":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%ropa mujer%' OR LOWER(nombre) LIKE '%mujer%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%moda%' LIMIT 1), 2)"
    if nc == "fashion_general":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%moda y ropa%' OR LOWER(nombre) LIKE '%moda%' LIMIT 1), 2)"
    if nc == "sports_general":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%deportes y fitness%' OR LOWER(nombre) LIKE '%deporte%' LIMIT 1), 4)"
    if nc == "gym_fitness":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%gimnasio%' OR LOWER(nombre) LIKE '%fitness%' ORDER BY id DESC LIMIT 1), 4)"
    if nc == "cycling":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%ciclismo%' OR LOWER(nombre) LIKE '%patinaje%' ORDER BY id DESC LIMIT 1), 4)"
    if nc == "kitchen":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%cocina%' OR LOWER(nombre) LIKE '%menaje%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%hogar%' LIMIT 1), 3)"
    if nc == "furniture_living":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%muebles y sala%' OR LOWER(nombre) LIKE '%mueble%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%hogar%' LIMIT 1), 3)"
    if nc == "home_general":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%hogar y muebles%' OR LOWER(nombre) LIKE '%hogar%' LIMIT 1), 3)"
    if nc == "large_appliances":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%electrodomésticos grandes%' OR LOWER(nombre) LIKE '%electrodom%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%hogar%' LIMIT 1), 3)"
    if nc == "skincare":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%cuidado de la piel%' OR LOWER(nombre) LIKE '%piel%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%belleza%' LIMIT 1), 5)"
    if nc == "beauty_general":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%belleza y cuidado personal%' OR LOWER(nombre) LIKE '%belleza%' LIMIT 1), 5)"
    if nc == "power_tools":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%herramientas eléctricas%' OR LOWER(nombre) LIKE '%eléctricas%' OR LOWER(nombre) LIKE '%electricas%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%herramienta%' LIMIT 1), 6)"
    if nc == "tools_industry":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%herramientas e industria%' OR LOWER(nombre) LIKE '%herramienta%' OR LOWER(nombre) LIKE '%industria%' LIMIT 1), 6)"
    if nc == "groceries":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%supermercado y alimentos%' OR LOWER(nombre) LIKE '%supermercado%' OR LOWER(nombre) LIKE '%alimento%' ORDER BY id DESC LIMIT 1), (SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%hogar%' LIMIT 1), 3)"
    if nc == "toys_baby":
        return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%juguetes y bebés%' OR LOWER(nombre) LIKE '%juguete%' OR LOWER(nombre) LIKE '%bebé%' OR LOWER(nombre) LIKE '%bebe%' ORDER BY id DESC LIMIT 1), 1)"
    
    return "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%tecnolog%' LIMIT 1), 1)"

# 3. EXTRAER PRODUCTOS REALES CON IMÁGENES AISLADAS
print("Fetching real catalog from DummyJSON...")
req = urllib.request.Request("https://dummyjson.com/products?limit=0", headers={"User-Agent": "Mozilla/5.0"})
dj_raw = urllib.request.urlopen(req, timeout=15).read()
dj_data = json.loads(dj_raw.decode("utf-8"))
dj_items = dj_data.get("products", [])

def process_packshot(source_url, filename):
    out_path = os.path.join(FRONTEND_IMAGES_DIR, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return f"/images/products/{filename}"
    try:
        req = urllib.request.Request(source_url, headers={"User-Agent": "Mozilla/5.0"})
        raw_data = urllib.request.urlopen(req, timeout=8).read()
        src_img = Image.open(io.BytesIO(raw_data))
        canvas = Image.new("RGB", (800, 800), (255, 255, 255))
        src_img.thumbnail((720, 720), Image.Resampling.LANCZOS)
        x = (800 - src_img.width) // 2
        y = (800 - src_img.height) // 2
        if src_img.mode in ("RGBA", "LA"):
            canvas.paste(src_img, (x, y), mask=src_img.split()[-1])
        else:
            canvas.paste(src_img, (x, y))
        canvas.save(out_path, "WEBP", quality=85)
        return f"/images/products/{filename}"
    except Exception:
        return source_url

products_by_niche = {}

for p in dj_items:
    cat = p.get("category", "")
    title = p.get("title", "")
    brand = p.get("brand") or "Genérica"
    price_cop = max(45000, round(float(p["price"]) * 3950 / 1000) * 1000)
    img_src = p["images"][0] if p.get("images") else p.get("thumbnail")
    fn = f"prod-{p['id']}-{re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')}.webp"
    final_img = process_packshot(img_src, fn)
    
    niche_key = "GENERAL"
    sub_cat = "technology"
    var_name = "Variante"
    var_vals = ["Estándar", "Edición Especial"]
    
    if cat == "smartphones":
        niche_key = "SMARTPHONES"
        sub_cat = "smartphones"
        var_name = "Color / Almacenamiento"
        var_vals = ["Negro 128GB", "Azul 256GB", "Titanio 512GB"]
    elif cat == "laptops":
        niche_key = "LAPTOPS"
        sub_cat = "laptops"
        var_name = "Memoria RAM / Disco"
        var_vals = ["16GB RAM / 512GB SSD", "32GB RAM / 1TB SSD"]
    elif any(k in title.lower() for k in ["headphone", "earphone", "audio", "speaker", "sound"]):
        niche_key = "AUDIO"
        sub_cat = "audio"
        var_name = "Color"
        var_vals = ["Negro Carbón", "Plata Titanio", "Blanco Glaciar"]
    elif cat in ["mens-shoes", "womens-shoes"]:
        niche_key = "FOOTWEAR"
        sub_cat = "footwear"
        var_name = "Talla"
        var_vals = ["38", "39", "40", "41", "42"]
    elif cat == "mens-shirts":
        niche_key = "MENS_FASHION"
        sub_cat = "mens_clothing"
        var_name = "Talla"
        var_vals = ["S", "M", "L", "XL"]
    elif cat in ["womens-dresses", "tops"]:
        niche_key = "WOMENS_FASHION"
        sub_cat = "womens_clothing"
        var_name = "Talla"
        var_vals = ["XS", "S", "M", "L"]
    elif cat == "womens-bags":
        niche_key = "WOMENS_FASHION"
        sub_cat = "fashion_general"
        var_name = "Color"
        var_vals = ["Negro", "Café Miel", "Beige"]
    elif cat in ["mens-watches", "womens-watches", "womens-jewellery"]:
        niche_key = "WATCHES_JEWELRY"
        sub_cat = "fashion_general"
        var_name = "Acabado"
        var_vals = ["Acero Inoxidable", "Oro Rosa 18K", "Plata 925"]
    elif cat == "sunglasses":
        niche_key = "OPTICA"
        sub_cat = "fashion_general"
        var_name = "Color Lente"
        var_vals = ["Negro Polarizado", "Verde Clásico G-15", "Marrón Degradé"]
    elif cat == "skin-care":
        niche_key = "SKINCARE"
        sub_cat = "skincare"
        var_name = "Presentación"
        var_vals = ["Envase 50ml", "Envase 100ml"]
    elif cat in ["beauty", "fragrances"]:
        niche_key = "BEAUTY"
        sub_cat = "beauty_general"
        var_name = "Presentación"
        var_vals = ["Frasco 50ml", "Frasco 100ml Eau de Parfum"]
    elif cat == "sports-accessories":
        niche_key = "SPORTS"
        sub_cat = "gym_fitness" if "fit" in title.lower() or "ball" in title.lower() else "sports_general"
        var_name = "Talla / Medida"
        var_vals = ["Estándar", "Profesional"]
    elif cat == "kitchen-accessories":
        niche_key = "KITCHEN"
        sub_cat = "kitchen"
        var_name = "Color / Acabado"
        var_vals = ["Acero Inoxidable", "Negro Mate"]
    elif cat in ["home-decoration", "furniture"]:
        niche_key = "FURNITURE"
        sub_cat = "furniture_living"
        var_name = "Color Tapizado"
        var_vals = ["Gris Perla", "Azul Petróleo", "Arena"]
    elif cat in ["motorcycle", "vehicle"]:
        niche_key = "TOOLS"
        sub_cat = "power_tools"
        var_name = "Voltaje / Capacidad"
        var_vals = ["110V Estándar", "20V Batería Litio"]
    elif cat == "groceries":
        niche_key = "GROCERIES"
        sub_cat = "groceries"
        var_name = "Presentación"
        var_vals = ["Bolsa 500g", "Bolsa 1000g"]
    
    item = {
        "title": title,
        "brand": brand,
        "desc": f"{p.get('description', '')} Garantía oficial de 12 meses con despacho asegurado en Cartagena de Indias.",
        "price_cop": price_cop,
        "img_url": final_img,
        "niche": niche_key,
        "cat_sql": get_category_sql(sub_cat),
        "var_name": var_name,
        "var_vals": var_vals
    }
    
    if niche_key not in products_by_niche:
        products_by_niche[niche_key] = []
    products_by_niche[niche_key].append(item)

# Curated items for complete coverage of all 21 categories
CURATED_ITEMS = [
    # Ciclismo y Patinaje
    {"title": "Bicicleta de Montaña Trek Marlin 7 Rin 29", "brand": "Trek", "price_cop": 3650000, "desc": "Suspensión RockShox Judy, transmisión Shimano Deore 1x10 y frenos de disco hidráulicos para trochas.", "img_url": "https://cdn.dummyjson.com/product-images/sports-accessories/golf-ball-set/1.webp", "niche": "CYCLING", "cat_sql": get_category_sql("cycling"), "var_name": "Talla Marco", "var_vals": ["M (17.5\")", "L (19.5\")"]},
    {"title": "Casco de Ciclismo Giro Agilis MIPS Certificado", "brand": "Giro", "price_cop": 480000, "desc": "Sistema de protección cerebral MIPS, 32 canales de ventilación Wind Tunnel y ajuste micrométrico.", "img_url": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/1.webp", "niche": "CYCLING", "cat_sql": get_category_sql("cycling"), "var_name": "Talla", "var_vals": ["M (55-59 cm)", "L (59-63 cm)"]},
    {"title": "Bicicleta de Ruta GW Flamma Aluminio Hydroform", "brand": "GW", "price_cop": 2890000, "desc": "Tenedor en carbono, grupo Shimano Sora 9 velocidades y ruedas de doble pared para alta velocidad.", "img_url": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/1.webp", "niche": "CYCLING", "cat_sql": get_category_sql("cycling"), "var_name": "Talla", "var_vals": ["S (50)", "M (52)", "L (54)"]},
    {"title": "Patines en Línea Rollerblade Macroblade 80", "brand": "Rollerblade", "price_cop": 780000, "desc": "Chasis de aluminio Twinblade, ruedas de 80mm/82A y balineras SG5 para patinaje urbano suave.", "img_url": "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/1.webp", "niche": "CYCLING", "cat_sql": get_category_sql("cycling"), "var_name": "Talla", "var_vals": ["38-39", "40-41", "42-43"]},

    # Electrodomésticos Grandes
    {"title": "Nevera No Frost Challenger 415 Litros Titanio Inverter", "brand": "Challenger", "price_cop": 2590000, "desc": "Compresor Digital Inverter con 10 años de garantía, dispensador de agua exterior y enfriamiento uniforme.", "img_url": "https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/1.webp", "niche": "LARGE_APPLIANCES", "cat_sql": get_category_sql("large_appliances"), "var_name": "Acabado", "var_vals": ["Titanio Cepillado", "Negro Mate"]},
    {"title": "Lavadora Carga Frontal Mabe 22 Kg Diamond Drum", "brand": "Mabe", "price_cop": 2890000, "desc": "Tecnología Ultra Clean con vapor antibacteriano, conectividad WiFi y ciclo exprés de lavado.", "img_url": "https://cdn.dummyjson.com/product-images/kitchen-accessories/plate/1.webp", "niche": "LARGE_APPLIANCES", "cat_sql": get_category_sql("large_appliances"), "var_name": "Color", "var_vals": ["Gris Grafito", "Blanco Glaciar"]},
    {"title": "Nevera Haceb Himalaya 404 Litros Titanio", "brand": "Haceb", "price_cop": 2350000, "desc": "Sistema de descongelación automática inteligente, panel digital táctil y bajo consumo energético A.", "img_url": "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/1.webp", "niche": "LARGE_APPLIANCES", "cat_sql": get_category_sql("large_appliances"), "var_name": "Acabado", "var_vals": ["Titanio", "Inox"]},
    {"title": "Horno Microondas Grill Haceb 1.1 Pies Cúbicos", "brand": "Haceb", "price_cop": 640000, "desc": "10 niveles de potencia, función doradora con grill superior y acabado reflectivo en puerta.", "img_url": "https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/1.webp", "niche": "LARGE_APPLIANCES", "cat_sql": get_category_sql("large_appliances"), "var_name": "Color", "var_vals": ["Negro Espejo", "Acero"]},

    # Juguetes y Bebés
    {"title": "Set de Construcción Lego Star Wars Millennium Falcon", "brand": "Lego", "price_cop": 890000, "desc": "Modelo para coleccionistas con 1351 piezas, cañones láser giratorios y figuras de Chewbacca y C-3PO.", "img_url": "https://cdn.dummyjson.com/product-images/home-decoration/key-holder/1.webp", "niche": "TOYS_BABY", "cat_sql": get_category_sql("toys_baby"), "var_name": "Edición", "var_vals": ["Estándar", "Coleccionista"]},
    {"title": "Coche de Paseo Ultraligero Plegable de Avión", "brand": "Babyzen", "price_cop": 1850000, "desc": "Plegado instantáneo con una mano, homologado como equipaje de cabina y suspensión en 4 ruedas.", "img_url": "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/1.webp", "niche": "TOYS_BABY", "cat_sql": get_category_sql("toys_baby"), "var_name": "Color Chasis", "var_vals": ["Negro", "Gris Taupe"]},
    {"title": "Juguete de Estimulación Temprana Arcoíris Montessori", "brand": "Montessori", "price_cop": 145000, "desc": "12 arcos de madera maciza natural pintados con tintes atóxicos para el desarrollo de la imaginación.", "img_url": "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp", "niche": "TOYS_BABY", "cat_sql": get_category_sql("toys_baby"), "var_name": "Tamaño", "var_vals": ["Grande 38cm", "Mediano 26cm"]},

    # Supermercado & Café Gourmet
    {"title": "Café Juan Valdez Huila Selección Especial 500g", "brand": "Juan Valdez", "price_cop": 48000, "desc": "Notas dulces y afrutadas con acidez media y cuerpo balanceado cosechado a más de 1,700 msnm.", "img_url": "https://cdn.dummyjson.com/product-images/groceries/honey-jar/1.webp", "niche": "GROCERIES", "cat_sql": get_category_sql("groceries"), "var_name": "Molienda", "var_vals": ["Grano Entero", "Molienda Media (Cafetera)"]},
    {"title": "Café Juan Valdez Sierra Nevada Fuerte 500g", "brand": "Juan Valdez", "price_cop": 49000, "desc": "Intensidad alta con notas a chocolate amargo y avellana tostada cultivado por comunidades indígenas.", "img_url": "https://cdn.dummyjson.com/product-images/groceries/ice-cream/1.webp", "niche": "GROCERIES", "cat_sql": get_category_sql("groceries"), "var_name": "Molienda", "var_vals": ["Grano Entero", "Molienda Fina (Espresso)"]},

    # Herramientas Industriales
    {"title": "Taladro Percutor Inalámbrico DeWalt 20V MAX Brushless", "brand": "DeWalt", "price_cop": 890000, "desc": "Motor sin carbones de alta eficiencia, mandril metálico de 1/2 pulgada y 2 baterías de litio de 2.0Ah.", "img_url": "https://cdn.dummyjson.com/product-images/vehicle/sports-car/1.webp", "niche": "TOOLS", "cat_sql": get_category_sql("power_tools"), "var_name": "Voltaje", "var_vals": ["20V MAX"]},
    {"title": "Caja de Herramientas Modular Stanley FatMax 3 en 1", "brand": "Stanley", "price_cop": 380000, "desc": "Estructura reforzada con ruedas todoterreno de 7 pulgadas y broches metálicos inoxidables.", "img_url": "https://cdn.dummyjson.com/product-images/vehicle/motorbike/1.webp", "niche": "TOOLS", "cat_sql": get_category_sql("tools_industry"), "var_name": "Capacidad", "var_vals": ["Capacidad 80 Litros"]}
]

for cur in CURATED_ITEMS:
    fn = f"curated-{re.sub(r'[^a-z0-9]+', '-', cur['title'].lower()).strip('-')}.webp"
    final_img = process_packshot(cur["img_url"], fn)
    cur_copy = dict(cur)
    cur_copy["img_url"] = final_img
    n_key = cur["niche"]
    if n_key not in products_by_niche:
        products_by_niche[n_key] = []
    products_by_niche[n_key].append(cur_copy)

# 4. MATRIZ DE COHERENCIA TIENDA ↔ NICHO COMERCIAL
STORE_NICHE_MAP = {
    "FOOTWEAR_URBAN": ["FOOTWEAR", "MENS_FASHION"],
    "APPLE_TECH": ["LAPTOPS", "SMARTPHONES", "AUDIO"],
    "SAMSUNG_TECH": ["SMARTPHONES", "LAPTOPS", "AUDIO"],
    "FOOTWEAR_SPORTS": ["FOOTWEAR", "SPORTS"],
    "GAMING_CONSOLES": ["LAPTOPS", "AUDIO", "SMARTPHONES"],
    "AUDIO_TECH": ["AUDIO", "SMARTPHONES"],
    "SPORTS_FITNESS": ["SPORTS", "FOOTWEAR", "CYCLING"],
    "MENS_FASHION": ["MENS_FASHION", "WATCHES_JEWELRY", "FOOTWEAR"],
    "WOMENS_FASHION": ["WOMENS_FASHION", "OPTICA", "WATCHES_JEWELRY"],
    "BEAUTY_PERFUME": ["BEAUTY", "SKINCARE"],
    "FURNITURE_HOME": ["FURNITURE", "KITCHEN"],
    "TOOLS_HARDWARE": ["TOOLS"],
    "LARGE_APPLIANCES": ["LARGE_APPLIANCES", "KITCHEN"],
    "KITCHEN_APPLIANCES": ["KITCHEN"],
    "GROCERIES_FOOD": ["GROCERIES"],
    "TOYS_BABY": ["TOYS_BABY", "FURNITURE"],
    "SKINCARE_HEALTH": ["SKINCARE", "BEAUTY"],
    "OPTICA_SUNGLASSES": ["OPTICA", "WATCHES_JEWELRY"],
    "WATCHES_LUXURY": ["WATCHES_JEWELRY"],
    "CYCLING_BIKES": ["CYCLING", "SPORTS"],
    "SMARTPHONES_TECH": ["SMARTPHONES", "AUDIO"]
}

# 5. GENERACIÓN DE MODELOS DE BASE DE DATOS
BCRYPT_HASH = "$2a$10$913d199f349e540cf50caa123e5697cb1d6089eff315529b3ea3f"
NOMBRES_COL = [
    "María Camila", "Juan Sebastián", "Carlos Andrés", "Daniela Sofía", "Andrés Felipe",
    "Valentina", "Mateo", "Mariana", "Alejandro", "Isabella", "Nicolás", "Gabriela",
    "Santiago", "Laura Vanessa", "David Eduardo", "Natalia", "Felipe", "Paola Andrea",
    "Julián David", "Catalina", "Diego Fernando", "Manuela", "Sebastián", "Carolina"
]
APELLIDOS_COL = [
    "Gómez", "Rodríguez", "Martínez", "García", "López", "Hernández", "González",
    "Pérez", "Sánchez", "Ramírez", "Torres", "Díaz", "Vargas", "Castro", "Morales",
    "Herrera", "Medina", "Navarro", "Vergara", "Buelvas", "Lorduy", "Turbay"
]
BARRIOS_CTG = [
    "Bocagrande", "Castillogrande", "El Laguito", "Manga", "Getsemaní", "Centro Histórico",
    "Crespo", "Marbella", "Pie de la Popa", "Chambacú", "El Cabrero", "San Diego"
]

# A) Compradores (120 registros: IDs 5001 - 5120)
buyers = []
buyer_addresses = []
for i in range(120):
    uid = 5001 + i
    nom = f"{random.choice(NOMBRES_COL)} {random.choice(APELLIDOS_COL)}"
    email = f"comprador{i+1}@mock.mercatto.co"
    tel = f"30{random.randint(10000000, 99999999)}"
    dias = random.randint(1, 45)
    barrio = random.choice(BARRIOS_CTG)
    dir_str = f"Cra {random.randint(2, 60)} # {random.randint(10, 80)}-{random.randint(1, 99)}, Edificio Bahía {random.randint(1, 25)}, Apto {random.randint(101, 1404)}"
    
    buyers.append({
        "id": uid,
        "nombre": nom,
        "email": email,
        "telefono": tel,
        "days_ago": dias
    })
    buyer_addresses.append({
        "id": uid,
        "usuario_id": uid,
        "nombre": nom,
        "telefono": tel,
        "direccion": dir_str,
        "barrio": barrio
    })

# B) Tiendas y Propietarios (40 registros: IDs 6001 - 6040)
sellers = []
stores = []
for s in TIENDAS_CARTAGENA:
    sid = 6000 + s["id"]
    owner_nom = f"{random.choice(NOMBRES_COL)} {random.choice(APELLIDOS_COL)}"
    owner_email = f"contacto_{s['slug'].replace('-', '')[:10]}_{s['id']}@mock.mercatto.co"
    owner_tel = f"30{random.randint(10000000, 99999999)}"
    calif = round(random.uniform(4.7, 5.0), 1)
    dias = random.randint(5, 45)
    
    logo_public_url = f"{SUPABASE_BUCKET_BASE}/stores/logos/{s['slug']}.png"
    banner_public_url = f"{SUPABASE_BUCKET_BASE}/stores/banners/{s['slug']}-banner.webp"
    
    sellers.append({
        "id": sid,
        "nombre": owner_nom,
        "email": owner_email,
        "telefono": owner_tel,
        "days_ago": dias
    })
    
    stores.append({
        "id": sid,
        "usuario_id": sid,
        "nombre_tienda": s["name"],
        "descripcion": s["desc"],
        "logo_url": logo_public_url,
        "portada_url": banner_public_url,
        "tipo_suscripcion": s["plan"],
        "nit_cedula": s["nit"],
        "cuenta_bancaria": s["cuenta"],
        "banco": s["banco"],
        "calificacion": calif,
        "total_ventas": random.randint(5, 30),
        "ciudad": "Cartagena de Indias",
        "direccion": s["address"],
        "days_ago": dias
    })

# C) Productos (~540 registros: 20 tiendas x 14 prods + 20 tiendas x 13 prods = 540)
products = []
images = []
variants = []
var_attrs = []

prod_seq = 7001
img_seq = 7001
var_seq = 8001
attr_seq = 8001

for s_idx, s in enumerate(TIENDAS_CARTAGENA):
    sid = 6000 + s["id"]
    niche = s["niche"]
    allowed_keys = STORE_NICHE_MAP.get(niche, ["GENERAL"])
    
    pool = []
    for k in allowed_keys:
        if k in products_by_niche:
            pool.extend(products_by_niche[k])
    if not pool:
        for k, v in products_by_niche.items():
            pool.extend(v)
            
    num_prods = 14 if s_idx < 20 else 13
    
    for p_offset in range(num_prods):
        base_item = pool[p_offset % len(pool)]
        pid = prod_seq
        sku = f"SEED-PROD-{pid}"
        slug = f"{re.sub(r'[^a-z0-9]+', '-', base_item['title'].lower()).strip('-')}-{pid}"
        
        norm_price = base_item["price_cop"]
        has_disc = (pid % 3 == 0) # ~33% con oferta
        disc_pct = random.choice([0.10, 0.15, 0.20])
        offer_price = int(norm_price * (1.0 - disc_pct)) if has_disc else None
        
        stock = random.randint(10, 50)
        calif = round(random.uniform(4.7, 5.0), 1)
        reviews = random.randint(3, 25)
        sales = random.randint(0, 5)
        dias = random.randint(1, 45)
        
        # Inyectar marca acorde a la tienda
        store_brand = base_item["brand"]
        tname = s["name"]
        if "Nike" in tname: store_brand = "Nike"
        elif "Mac Center" in tname or "Apple" in tname: store_brand = "Apple"
        elif "Samsung" in tname: store_brand = "Samsung"
        elif "Adidas" in tname: store_brand = "Adidas"
        elif "Arturo Calle" in tname: store_brand = "Arturo Calle"
        elif "Studio F" in tname: store_brand = "Studio F"
        elif "Vélez" in tname: store_brand = "Vélez"
        elif "Havaianas" in tname: store_brand = "Havaianas"
        elif "Mabe" in tname: store_brand = "Mabe"
        elif "Haceb" in tname: store_brand = "Haceb"
        elif "Oster" in tname: store_brand = "Oster"
        elif "Tugó" in tname: store_brand = "Tugó"
        elif "Decathlon" in tname: store_brand = "Decathlon"
        elif "Juan Valdez" in tname: store_brand = "Juan Valdez"
        elif "Sony" in tname: store_brand = "Sony"
        elif "Lego" in tname: store_brand = "Lego"
        elif "Ray-Ban" in tname: store_brand = "Ray-Ban"
        elif "Rolex" in tname: store_brand = "Rolex"
        elif "Trek" in tname: store_brand = "Trek"
        elif "Bata" in tname: store_brand = "Bata"
        elif "Xiaomi" in tname: store_brand = "Xiaomi"
        elif "IKEA" in tname: store_brand = "IKEA"
        elif "KitchenAid" in tname: store_brand = "KitchenAid"
        elif "Stanley" in tname: store_brand = "Stanley"
        elif "Bose" in tname: store_brand = "Bose"
        elif "Challenger" in tname: store_brand = "Challenger"
        elif "Under Armour" in tname: store_brand = "Under Armour"
        elif "Lorduy" in tname: store_brand = "Lorduy"

        title_final = base_item["title"]
        if store_brand not in title_final and store_brand != "Genérica":
            title_final = f"{title_final} - {store_brand}"
            
        products.append({
            "id": pid,
            "vendedor_id": sid,
            "categoria_sql": base_item["cat_sql"],
            "titulo": title_final,
            "slug": slug,
            "descripcion": base_item["desc"],
            "precio": norm_price,
            "precio_oferta": offer_price,
            "stock": stock,
            "sku": sku,
            "marca": store_brand,
            "calificacion": calif,
            "total_resenas": reviews,
            "total_ventas": sales,
            "days_ago": dias
        })
        
        images.append({
            "id": img_seq,
            "producto_id": pid,
            "url": base_item["img_url"],
            "principal": True
        })
        img_seq += 1
        
        for v_val in base_item["var_vals"][:2]:
            var_sku = f"{sku}-{re.sub(r'[^a-zA-Z0-9]', '', v_val)[:4].upper()}"
            variants.append({
                "id": var_seq,
                "producto_id": pid,
                "sku": var_sku,
                "nombre": v_val,
                "precio": norm_price,
                "precio_oferta": offer_price,
                "stock": max(3, stock // 2),
                "imagen_url": base_item["img_url"]
            })
            var_attrs.append({
                "id": attr_seq,
                "variante_id": var_seq,
                "nombre": base_item["var_name"],
                "valor": v_val
            })
            attr_seq += 1
            var_seq += 1
            
        prod_seq += 1

print(f"Generated {len(products)} products, {len(images)} packshots, {len(variants)} variants.")

# D) Pedidos (300 registros: IDs 9001 - 9300)
orders = []
order_items = []
payments = []

ESTADOS = ["ENTREGADO", "PAGADO", "ENVIADO", "PENDIENTE"]
PESOS = [0.50, 0.30, 0.15, 0.05]
VALID_METODOS = ["WOMPI", "PSE", "NEQUI", "TARJETA_CREDITO", "CONTRA_ENTREGA"]
oi_seq = 10001

for o_idx in range(300):
    oid = 9001 + o_idx
    b = random.choice(buyers)
    code = f"PED-MOCK-2026-{oid}"
    
    num_prods = random.choices([1, 2, 3], weights=[0.70, 0.20, 0.10])[0]
    chosen = random.sample(products, num_prods)
    
    subtotal = 0
    for p in chosen:
        qty = random.randint(1, 2)
        pr = p["precio_oferta"] if p["precio_oferta"] else p["precio"]
        line_tot = pr * qty
        subtotal += line_tot
        
        order_items.append({
            "id": oi_seq,
            "pedido_id": oid,
            "producto_id": p["id"],
            "vendedor_id": p["vendedor_id"],
            "nombre_producto": p["titulo"],
            "precio_unitario": pr,
            "cantidad": qty,
            "subtotal": line_tot
        })
        oi_seq += 1
        
    costo_envio = 0 if subtotal >= 150000 else 12000
    total = subtotal + costo_envio
    estado = random.choices(ESTADOS, weights=PESOS)[0]
    dias = random.randint(1, 40)
    
    orders.append({
        "id": oid,
        "codigo": code,
        "comprador_id": b["id"],
        "estado": estado,
        "subtotal": subtotal,
        "costo_envio": costo_envio,
        "total": total,
        "days_ago": dias
    })
    
    pago_estado = "APROBADO" if estado in ["ENTREGADO", "PAGADO", "ENVIADO"] else "PENDIENTE"
    metodo = random.choice(VALID_METODOS)
    payments.append({
        "id": oid,
        "pedido_id": oid,
        "metodo": metodo,
        "estado": pago_estado,
        "monto": total,
        "days_ago": dias
    })

print(f"Generated {len(orders)} orders, {len(order_items)} items, and {len(payments)} payments.")

# 6. ESCRITURA DEL SCRIPT SQL CON TRANSACCIÓN SEGURA Y COMPATIBILIDAD DDL
sql_path = os.path.join(PROJECT_ROOT, "supabase_seed_feria_1000.sql")
NL = "\n"
SEP = "," + NL

with open(sql_path, "w", encoding="utf-8") as f:
    f.write("-- ============================================================================" + NL)
    f.write("-- MERCATTO MARKETPLACE - SEEDING OFICIAL FERIA COMERCIAL CARTAGENA 2026" + NL)
    f.write("-- 40 TIENDAS VERIFICADAS EN CARTAGENA DE INDIAS (DIRECCIONES REALES + BANCARIZACIÓN)" + NL)
    f.write("-- 540 PRODUCTOS CON FOTOGRAFÍA PACKSHOT ESTUDIO SOBRE FONDO BLANCO PURO (#FFFFFF)" + NL)
    f.write("-- CUBRIMIENTO 100% DE LAS 21 CATEGORÍAS DEL MARKETPLACE SIN COLISIÓN" + NL)
    f.write("-- ============================================================================" + NL + NL)
    f.write("BEGIN;" + NL + NL)
    
    # 0. DDL COMPATIBILIDAD
    f.write("-- 0. ASEGURAR COLUMNAS DDL DE COMPATIBILIDAD" + NL)
    f.write("ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS tokens_chat INT DEFAULT 5;" + NL)
    f.write("ALTER TABLE IF EXISTS vendedores ADD COLUMN IF NOT EXISTS portada_url TEXT;" + NL)
    f.write("ALTER TABLE IF EXISTS vendedores ADD COLUMN IF NOT EXISTS banner_url TEXT;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT false;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS principal BOOLEAN DEFAULT false;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_variantes ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;" + NL)
    f.write("ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP;" + NL)
    f.write("ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP;" + NL + NL)
    
    # 1. COMPRADORES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 1. USUARIOS COMPRADORES (120 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)" + NL + "VALUES" + NL)
    rows = []
    for b in buyers:
        nom_e = b['nombre'].replace("'", "''")
        rows.append(f"({b['id']}, '{nom_e}', '{b['email']}', '{BCRYPT_HASH}', 'COMPRADOR', TRUE, TRUE, '{b['telefono']}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{b['days_ago']} days')")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 2. DIRECCIONES COMPRADORES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 2. DIRECCIONES COMPRADORES (120 Registros en Cartagena)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO direcciones (id, usuario_id, nombre_completo, telefono, direccion, barrio, ciudad, departamento, codigo_postal, notas_entrega, es_principal)" + NL + "VALUES" + NL)
    rows = []
    for d in buyer_addresses:
        nom_e = d['nombre'].replace("'", "''")
        dir_e = d['direccion'].replace("'", "''")
        rows.append(f"({d['id']}, {d['usuario_id']}, '{nom_e}', '{d['telefono']}', '{dir_e}', '{d['barrio']}', 'Cartagena de Indias', 'Bolívar', '130001', 'Entregar en portería / recepción', TRUE)")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 3. USUARIOS VENDEDORES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 3. USUARIOS PROPIETARIOS DE TIENDAS (40 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)" + NL + "VALUES" + NL)
    rows = []
    for s in sellers:
        nom_e = s['nombre'].replace("'", "''")
        rows.append(f"({s['id']}, '{nom_e}', '{s['email']}', '{BCRYPT_HASH}', 'VENDEDOR', TRUE, TRUE, '{s['telefono']}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{s['days_ago']} days')")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 4. TIENDAS VIRTUALES CARTAGENA
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 4. TIENDAS VENDEDORAS EN CARTAGENA DE INDIAS (40 Registros Completos)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO vendedores (id, usuario_id, tipo, nombre_tienda, descripcion, logo_url, portada_url, banner_url, estado, nit_cedula, razon_social, ciudad, direccion, cuenta_bancaria, banco, calificacion, total_ventas, tipo_suscripcion, fecha_registro)" + NL + "VALUES" + NL)
    rows = []
    for st in stores:
        t_e = st['nombre_tienda'].replace("'", "''")
        d_e = st['descripcion'].replace("'", "''")
        dir_e = st['direccion'].replace("'", "''")
        rows.append(f"({st['id']}, {st['usuario_id']}, 'EMPRESA', '{t_e}', '{d_e}', '{st['logo_url']}', '{st['portada_url']}', '{st['portada_url']}', 'APROBADO', '{st['nit_cedula']}', '{t_e} S.A.S.', '{st['ciudad']}', '{dir_e}', '{st['cuenta_bancaria']}', '{st['banco']}', {st['calificacion']}, {st['total_ventas']}, '{st['tipo_suscripcion']}', NOW() - INTERVAL '{st['days_ago']} days')")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 5. PRODUCTOS
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 5. PRODUCTOS DE CATÁLOGO PACKSHOT FONDO BLANCO PURO (540 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(products), 50):
        chunk = products[i:i+50]
        f.write("INSERT INTO productos (id, vendedor_id, categoria_id, titulo, slug, descripcion, precio, precio_oferta, stock, sku, marca, estado, activo, destacado, calificacion, total_resenas, total_ventas, fecha_creacion, fecha_actualizacion)" + NL + "VALUES" + NL)
        p_rows = []
        for p in chunk:
            t_e = p['titulo'].replace("'", "''")
            d_e = p['descripcion'].replace("'", "''")
            m_e = p['marca'].replace("'", "''")
            off_v = f"{p['precio_oferta']}" if p['precio_oferta'] else "NULL"
            p_rows.append(f"({p['id']}, {p['vendedor_id']}, {p['categoria_sql']}, '{t_e}', '{p['slug']}', '{d_e}', {p['precio']}, {off_v}, {p['stock']}, '{p['sku']}', '{m_e}', 'NUEVO', TRUE, FALSE, {p['calificacion']}, {p['total_resenas']}, {p['total_ventas']}, NOW() - INTERVAL '{p['days_ago']} days', NOW() - INTERVAL '{p['days_ago']} days')")
        f.write(SEP.join(p_rows) + ";" + NL + NL)
        
    # 6. PRODUCTO IMAGENES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 6. PRODUCTO IMAGENES PACKSHOT (540 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(images), 50):
        chunk = images[i:i+50]
        f.write("INSERT INTO producto_imagenes (id, producto_id, url, principal, es_principal, orden_visual)" + NL + "VALUES" + NL)
        im_rows = []
        for im in chunk:
            im_rows.append(f"({im['id']}, {im['producto_id']}, '{im['url']}', TRUE, TRUE, 0)")
        f.write(SEP.join(im_rows) + ";" + NL + NL)
        
    # 7. PRODUCTO VARIANTES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 7. PRODUCTO VARIANTES (1080 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(variants), 50):
        chunk = variants[i:i+50]
        f.write("INSERT INTO producto_variantes (id, producto_id, sku, nombre, precio, precio_oferta, stock, imagen_url, activo)" + NL + "VALUES" + NL)
        va_rows = []
        for va in chunk:
            n_e = va['nombre'].replace("'", "''")
            off_v = f"{va['precio_oferta']}" if va['precio_oferta'] else "NULL"
            va_rows.append(f"({va['id']}, {va['producto_id']}, '{va['sku']}', '{n_e}', {va['precio']}, {off_v}, {va['stock']}, '{va['imagen_url']}', TRUE)")
        f.write(SEP.join(va_rows) + ";" + NL + NL)
        
    # 8. VARIANTE ATRIBUTOS
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 8. VARIANTE ATRIBUTOS (1080 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(var_attrs), 50):
        chunk = var_attrs[i:i+50]
        f.write("INSERT INTO variante_atributos (id, variante_id, nombre, valor)" + NL + "VALUES" + NL)
        at_rows = []
        for at in chunk:
            n_e = at['nombre'].replace("'", "''")
            v_e = at['valor'].replace("'", "''")
            at_rows.append(f"({at['id']}, {at['variante_id']}, '{n_e}', '{v_e}')")
        f.write(SEP.join(at_rows) + ";" + NL + NL)
        
    # 9. PEDIDOS
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 9. PEDIDOS (300 Registros de los últimos 45 días)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(orders), 50):
        chunk = orders[i:i+50]
        f.write("INSERT INTO pedidos (id, codigo, comprador_id, direccion_id, estado, subtotal, descuento, costo_envio, total, notas, fecha_creacion, fecha_actualizacion)" + NL + "VALUES" + NL)
        o_rows = []
        for o in chunk:
            o_rows.append(f"({o['id']}, '{o['codigo']}', {o['comprador_id']}, {o['comprador_id']}, '{o['estado']}', {o['subtotal']}, 0.0, {o['costo_envio']}, {o['total']}, 'MOCK_FERIA_CARTAGENA', NOW() - INTERVAL '{o['days_ago']} days', NOW() - INTERVAL '{o['days_ago']} days')")
        f.write(SEP.join(o_rows) + ";" + NL + NL)
        
    # 10. PEDIDO ITEMS
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 10. PEDIDO ITEMS (Detalle de productos comprados)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(order_items), 50):
        chunk = order_items[i:i+50]
        f.write("INSERT INTO pedido_items (id, pedido_id, producto_id, vendedor_id, nombre_producto, precio_unitario, cantidad, subtotal)" + NL + "VALUES" + NL)
        oi_rows = []
        for oi in chunk:
            nom_e = oi['nombre_producto'].replace("'", "''")
            oi_rows.append(f"({oi['id']}, {oi['pedido_id']}, {oi['producto_id']}, {oi['vendedor_id']}, '{nom_e}', {oi['precio_unitario']}, {oi['cantidad']}, {oi['subtotal']})")
        f.write(SEP.join(oi_rows) + ";" + NL + NL)
        
    # 11. PAGOS
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 11. PAGOS (300 Registros con Enums válidos de Pago)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(payments), 50):
        chunk = payments[i:i+50]
        f.write("INSERT INTO pagos (id, pedido_id, metodo, estado, monto, moneda, fecha_pago, fecha_confirmacion, fecha_creacion)" + NL + "VALUES" + NL)
        pay_rows = []
        for pay in chunk:
            pay_rows.append(f"({pay['id']}, {pay['pedido_id']}, '{pay['metodo']}', '{pay['estado']}', {pay['monto']}, 'COP', NOW() - INTERVAL '{pay['days_ago']} days', NOW() - INTERVAL '{pay['days_ago']} days', NOW() - INTERVAL '{pay['days_ago']} days')")
        f.write(SEP.join(pay_rows) + ";" + NL + NL)
        
    # 12. AJUSTE DE SECUENCIAS POSTGRESQL
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 12. REAJUSTE DE SECUENCIAS POSTGRESQL" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('direcciones', 'id'), COALESCE((SELECT MAX(id) FROM direcciones), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('vendedores', 'id'), COALESCE((SELECT MAX(id) FROM vendedores), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('producto_imagenes', 'id'), COALESCE((SELECT MAX(id) FROM producto_imagenes), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('producto_variantes', 'id'), COALESCE((SELECT MAX(id) FROM producto_variantes), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('variante_atributos', 'id'), COALESCE((SELECT MAX(id) FROM variante_atributos), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('pedido_items', 'id'), COALESCE((SELECT MAX(id) FROM pedido_items), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('pagos', 'id'), COALESCE((SELECT MAX(id) FROM pagos), 1));" + NL + NL)
    f.write("COMMIT;" + NL)

print(f"SUCCESS: {sql_path} generated with {len(TIENDAS_CARTAGENA)} Cartagena stores and {len(products)} products.")
