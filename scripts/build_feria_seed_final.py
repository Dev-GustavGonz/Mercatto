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

print("Building new Packshot & Seeding pipeline with fresh stores and diverse category products...")

# 1. NEW STORES SPECIFICATION (Zero collision with manual stores: Hakzr, Underwater, Bosque, Koaj, Havaianas, Nexo)
# Distribution: 3 ELITE (8%), 9 PRO (25%), 24 STARTER (67%)
STORES_CATALOG = [
    # 3 ELITE (8%)
    {
        "id": 1,
        "name": "Apple Premium Reseller (iShop)",
        "desc": "Distribuidor oficial Apple en Cartagena. MacBooks, iPhones, iPads, Apple Watch y accesorios con garantía internacional.",
        "logo": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80",
        "plan": "ELITE",
        "niche": "APPLE_TECH"
    },
    {
        "id": 2,
        "name": "Samsung Experience Store",
        "desc": "Showroom oficial Samsung. Smartphones Galaxy S24, pantallas Neo QLED, tabletas Tab S9 y electrodomésticos inteligentes Bespoke.",
        "logo": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80",
        "plan": "ELITE",
        "niche": "SAMSUNG_TECH"
    },
    {
        "id": 3,
        "name": "Nike Official Store Cartagena",
        "desc": "Tienda concepto Nike. Air Jordan, Air Force 1, calzado running Pegasus, indumentaria deportiva y streetwear de alto rendimiento.",
        "logo": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=80",
        "plan": "ELITE",
        "niche": "FOOTWEAR_SPORTS"
    },

    # 9 PRO (25%)
    {
        "id": 4,
        "name": "Adidas Originals & Performance",
        "desc": "Zapatillas Ultraboost, Samba OG, Stan Smith, ropa de entrenamiento y colaboraciones exclusivas de la marca de las tres rayas.",
        "logo": "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "FOOTWEAR_SPORTS"
    },
    {
        "id": 5,
        "name": "Sony Center Caribe",
        "desc": "Audífonos líderes WH-1000XM5, barras de sonido Dolby Atmos, cámaras profesionales Alpha y accesorios oficiales PlayStation.",
        "logo": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "AUDIO_TECH"
    },
    {
        "id": 6,
        "name": "Decathlon Sports Cartagena",
        "desc": "Equipamiento para más de 65 deportes: bicicletas de montaña Rockrider, mancuernas Domyos, running Kalenji y senderismo Quechua.",
        "logo": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "SPORTS_FITNESS"
    },
    {
        "id": 7,
        "name": "Arturo Calle Menswear",
        "desc": "Moda masculina ejecutiva y casual. Camisas de lino y algodón pima, trajes de corte italiano, chaquetas y calzado formal.",
        "logo": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "MENS_FASHION"
    },
    {
        "id": 8,
        "name": "Studio F High Fashion",
        "desc": "Tendencias en moda femenina contemporánea: vestidos de gala y coctel, blusas frescas, jeans levanta cola y carteras en cuero.",
        "logo": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "WOMENS_FASHION"
    },
    {
        "id": 9,
        "name": "Sephora Beauty Lounge",
        "desc": "Cosmética de lujo y perfumería francesa. Fragancias Dior, Chanel, Gucci, paletas Huda Beauty y tratamientos faciales antiedad.",
        "logo": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "BEAUTY_PERFUME"
    },
    {
        "id": 10,
        "name": "IKEA Home & Living",
        "desc": "Diseño nórdico para el hogar. Sofás modulares, mesas de centro, estanterías funcionales, iluminación cálida y menaje minimalista.",
        "logo": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "FURNITURE_HOME"
    },
    {
        "id": 11,
        "name": "Homecenter Constructor",
        "desc": "Herramientas eléctricas y manuales Stanley, DeWalt y Bosch. Taladros, sierras, compresores e insumos de remodelación profesional.",
        "logo": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "TOOLS_HARDWARE"
    },
    {
        "id": 12,
        "name": "Dermatológica Skincare",
        "desc": "Clínica de la piel y dermocosmética especializada. Protectores solares toque seco, hidratantes CeraVe, sérums de ácido hialurónico y retinol.",
        "logo": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&auto=format&fit=crop&q=80",
        "plan": "PRO",
        "niche": "SKINCARE_HEALTH"
    },

    # 24 STARTER (67%)
    {
        "id": 13,
        "name": "Oster Official Store",
        "desc": "Pequeños electrodomésticos de cocina. Freidoras de aire Bioceramic, licuadoras con motor reversible, cafeteras espresso y sartenes.",
        "logo": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "KITCHEN_APPLIANCES"
    },
    {
        "id": 14,
        "name": "Éxito Gourmet & Supermercado",
        "desc": "Cafés colombianos especiales de origen, aceites de oliva extravirgen, frutos secos, snacks importados y alimentos de primera necesidad.",
        "logo": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "GROCERIES_FOOD"
    },
    {
        "id": 15,
        "name": "Lego Store Colombia",
        "desc": "Sets de construcción Lego Star Wars, Technic, City y juegos de estimulación temprana Montessori para niños de todas las edades.",
        "logo": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "TOYS_BABY"
    },
    {
        "id": 16,
        "name": "Ray-Ban Sunglass Hut",
        "desc": "Lentes de sol polarizados con protección UV400 completa: Wayfarer, Aviator, Clubmaster y monturas ultralivianas en acetato.",
        "logo": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "OPTICA_SUNGLASSES"
    },
    {
        "id": 17,
        "name": "Rolex Glauser Relojería",
        "desc": "Alta relojería suiza y cronógrafos analógicos sumergibles. Piezas de precisión en acero oystersteel, oro y cristal de zafiro.",
        "logo": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "WATCHES_LUXURY"
    },
    {
        "id": 18,
        "name": "Lenovo ThinkPad Hub",
        "desc": "Portátiles corporativos ThinkPad, estaciones de trabajo Yoga y laptops gamers Legion con procesadores Intel Core i7 y Ryzen.",
        "logo": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "LAPTOPS_PC"
    },
    {
        "id": 19,
        "name": "Dell Technologies Store",
        "desc": "Laptops premium Dell XPS 13 y 15, monitores UltraSharp 4K, accesorios de productividad y computadores de alto rendimiento.",
        "logo": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "LAPTOPS_PC"
    },
    {
        "id": 20,
        "name": "Puma Athletics",
        "desc": "Zapatillas urbanas Puma Suede, calzado de running Nitro, sudaderas deportivas y accesorios de estilo urbano casual.",
        "logo": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "FOOTWEAR_SPORTS"
    },
    {
        "id": 21,
        "name": "Trek Bicycle Shop",
        "desc": "Bicicletas de montaña Marlin, cascos aerodinámicos certificados, candados de alta seguridad, luces LED y repuestos ciclistas.",
        "logo": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "CYCLING_BIKES"
    },
    {
        "id": 22,
        "name": "Challenger Electrodomésticos",
        "desc": "Grandes electrodomésticos: neveras No Frost, lavadoras automáticas, hornos empotrables y estufas de cocina 100% colombianas.",
        "logo": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "LARGE_APPLIANCES"
    },
    {
        "id": 23,
        "name": "Bata Calzado Caribe",
        "desc": "Mocasines de cuero legítimo, zapatos escolares, sandalias ergonómicas de descanso y botas para el día a día.",
        "logo": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "FOOTWEAR_SPORTS"
    },
    {
        "id": 24,
        "name": "Xiaomi Mi Store",
        "desc": "Smartphones Redmi Note 13, bandas inteligentes Mi Band, cámaras de seguridad 360 WiFi y gadgets para el hogar conectado.",
        "logo": "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "SMARTPHONES_TECH"
    },
    {
        "id": 25,
        "name": "Clinique Laboratories",
        "desc": "Dermatología probada contra alergias. Hidratantes Moisture Surge 100H, bálsamos limpiadores desmaquillantes y tónicos clarificantes.",
        "logo": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "SKINCARE_HEALTH"
    },
    {
        "id": 26,
        "name": "KitchenAid Gourmet",
        "desc": "Batidoras de pedestal Artisan icónicas, ollas en hierro fundido esmaltado, cuchillos de chef damasco y accesorios de pastelería.",
        "logo": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "KITCHEN_APPLIANCES"
    },
    {
        "id": 27,
        "name": "Stanley Industrial Tools",
        "desc": "Juegos de copas y raches profesionales, cajas de herramientas modulares FatMax, niveles láser y atornilladores de impacto.",
        "logo": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "TOOLS_HARDWARE"
    },
    {
        "id": 28,
        "name": "Mabe Línea Blanca",
        "desc": "Refrigeración no-frost y centros de lavado de alta eficiencia energética para el clima cálido de Cartagena de Indias.",
        "logo": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "LARGE_APPLIANCES"
    },
    {
        "id": 29,
        "name": "Zara Home Decor",
        "desc": "Ropa de cama en lino lavado europeo, fundas de cojín bordadas, vajillas de gres artesanal, velas aromáticas y difusores.",
        "logo": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "FURNITURE_HOME"
    },
    {
        "id": 30,
        "name": "Bose Audio Lounge",
        "desc": "Audífonos QuietComfort con cancelación de ruido de referencia acústica, parlantes portátiles resistentes al agua salina y barras de sonido.",
        "logo": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "AUDIO_TECH"
    },
    {
        "id": 31,
        "name": "Baby Fresh Boutique",
        "desc": "Prendas en 100% algodón orgánico hipoalergénico para bebés, coches de paseo ultraligeros de viaje y biberones anticólicos.",
        "logo": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "TOYS_BABY"
    },
    {
        "id": 32,
        "name": "Juan Valdez Café Oficial",
        "desc": "Café colombiano premium de las regiones de Huila, Nariño y Sierra Nevada. Cafeteras de émbolo, prensas francesas y termos de viaje.",
        "logo": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "GROCERIES_FOOD"
    },
    {
        "id": 33,
        "name": "Motorola Flagship Store",
        "desc": "Teléfonos inteligentes plegables Motorola Razr 50 Ultra, serie Edge 50 con carga rápida TurboPower y sonido Dolby Atmos.",
        "logo": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "SMARTPHONES_TECH"
    },
    {
        "id": 34,
        "name": "Under Armour Performance",
        "desc": "Ropa de compresión HeatGear para entrenamiento físico intenso, tenis de levantamiento Project Rock y maletines deportivos.",
        "logo": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "SPORTS_FITNESS"
    },
    {
        "id": 35,
        "name": "Lorduy Alta Joyería",
        "desc": "Joyas de autor elaboradas en oro de 18 quilates, plata 950 y esmeraldas colombianas naturales certificadas con diseño atemporal.",
        "logo": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "WATCHES_LUXURY"
    },
    {
        "id": 36,
        "name": "Whirlpool Electrodomésticos",
        "desc": "Neveras French Door con dispensador de hielo, microondas con función grill y lavavajillas silenciosas con garantía de fabricante.",
        "logo": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80",
        "banner": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop&q=80",
        "plan": "STARTER",
        "niche": "LARGE_APPLIANCES"
    }
]

print(f"Defined {len(STORES_CATALOG)} official stores with zero collision with manual stores.")

# 2. CATEGORY SQL RESOLVER FOR ALL 21 FRONTEND CATEGORIES
def get_category_sql(niche_category):
    nc = (niche_category or "").lower()
    
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

# 3. FETCH CATALOG PRODUCTS FROM DUMMYJSON AND MAP NICHE PRODUCTS
print("Fetching 194 DummyJSON products...")
req = urllib.request.Request("https://dummyjson.com/products?limit=0", headers={"User-Agent": "Mozilla/5.0"})
dj_raw = urllib.request.urlopen(req, timeout=15).read()
dj_data = json.loads(dj_raw.decode("utf-8"))
dj_items = dj_data.get("products", [])

# Process packshots onto white canvas if not already processed
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

# Build a clean product bank with category assignments
products_by_niche = {}

for p in dj_items:
    cat = p.get("category", "")
    title = p.get("title", "")
    brand = p.get("brand") or "Genérica"
    price_cop = max(45000, round(float(p["price"]) * 3950 / 1000) * 1000)
    img_src = p["images"][0] if p.get("images") else p.get("thumbnail")
    fn = f"prod-{p['id']}-{re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')}.webp"
    final_img = process_packshot(img_src, fn)
    
    # Classify into niche and frontend category
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
        "desc": f"{p.get('description', '')} Garantía oficial de 12 meses con soporte directo en Cartagena de Indias.",
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

# Add curated Colombian & Flagship items for empty categories (Cycling, Large Appliances, Toys & Baby)
CURATED_ITEMS = [
    # Cycling
    {"title": "Bicicleta de Montaña Trek Marlin 7 Gen 3 Rin 29", "brand": "Trek", "price_cop": 3650000, "desc": "Suspensión delantera RockShox Judy, transmisión Shimano Deore 1x10 y frenos de disco hidráulicos para trochas exigentes.", "img_url": "https://cdn.dummyjson.com/product-images/sports-accessories/golf-ball-set/1.webp", "niche": "CYCLING", "cat_sql": get_category_sql("cycling"), "var_name": "Talla Marco", "var_vals": ["M (17.5\")", "L (19.5\")"]},
    {"title": "Casco de Ciclismo Aerodinámico Giro Agilis MIPS", "brand": "Giro", "price_cop": 480000, "desc": "Sistema de protección cerebral MIPS, 32 canales de ventilación Wind Tunnel y ajuste micrométrico Roc Loc 5.5.", "img_url": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/1.webp", "niche": "CYCLING", "cat_sql": get_category_sql("cycling"), "var_name": "Talla", "var_vals": ["M (55-59 cm)", "L (59-63 cm)"]},
    {"title": "Bicicleta Urbana de Paseo Vintage Con Canasta", "brand": "GW", "price_cop": 980000, "desc": "Cuero café clásico, guardabarros de aluminio pulido y sillín ergonómico con resortes para la brisa de Cartagena.", "img_url": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/1.webp", "niche": "CYCLING", "cat_sql": get_category_sql("cycling"), "var_name": "Color", "var_vals": ["Verde Menta", "Blanco Crema", "Azul Pastel"]},

    # Large Appliances
    {"title": "Nevera No Frost Challenger 415 Litros Titanio Inverter", "brand": "Challenger", "price_cop": 2590000, "desc": "Compresor Digital Inverter con 10 años de garantía, dispensador de agua exterior y enfriamiento uniforme Multi Air Flow.", "img_url": "https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/1.webp", "niche": "LARGE_APPLIANCES", "cat_sql": get_category_sql("large_appliances"), "var_name": "Acabado", "var_vals": ["Titanio Cepillado", "Negro Mate"]},
    {"title": "Lavadora Carga Frontal Mabe 22 Kg Diamond Drum", "brand": "Mabe", "price_cop": 2890000, "desc": "Tecnología Ultra Clean con vapor antibacteriano, conectividad WiFi y ciclo exprés de lavado en solo 28 minutos.", "img_url": "https://cdn.dummyjson.com/product-images/kitchen-accessories/plate/1.webp", "niche": "LARGE_APPLIANCES", "cat_sql": get_category_sql("large_appliances"), "var_name": "Color", "var_vals": ["Gris Grafito", "Blanco"]},
    {"title": "Horno Empotrable a Gas Challenger 60cm con Grill", "brand": "Challenger", "price_cop": 1420000, "desc": "Encendido electrónico progresivo, cristal templado reflectivo de alta resistencia térmica y sistema de convección.", "img_url": "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/1.webp", "niche": "LARGE_APPLIANCES", "cat_sql": get_category_sql("large_appliances"), "var_name": "Tipo Gas", "var_vals": ["Gas Natural", "Gas Propano (GLP)"]},

    # Toys & Baby
    {"title": "Set de Construcción Lego Star Wars Millennium Falcon", "brand": "Lego", "price_cop": 890000, "desc": "Modelo icónico para coleccionistas con 1351 piezas, cañones láser giratorios y figuras de Chewbacca, Finn y C-3PO.", "img_url": "https://cdn.dummyjson.com/product-images/home-decoration/key-holder/1.webp", "niche": "TOYS_BABY", "cat_sql": get_category_sql("toys_baby"), "var_name": "Edición", "var_vals": ["Edición Estándar", "Edición Coleccionista"]},
    {"title": "Coche de Paseo Ultraligero Plegable de Avión Babyzen", "brand": "Babyzen", "price_cop": 1850000, "desc": "Plegado instantáneo a una sola mano, homologado como equipaje de cabina y suspensión individual en las 4 ruedas.", "img_url": "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/1.webp", "niche": "TOYS_BABY", "cat_sql": get_category_sql("toys_baby"), "var_name": "Color Chasis", "var_vals": ["Negro / Toffee", "Blanco / Ginger", "Gris Taupe"]},
    {"title": "Juguete de Estimulación Temprana Arcoíris Madera Montessori", "brand": "Montessori Kids", "price_cop": 145000, "desc": "12 arcos de madera maciza natural pintados con tintes al agua atóxicos para el desarrollo de la imaginación espacial.", "img_url": "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp", "niche": "TOYS_BABY", "cat_sql": get_category_sql("toys_baby"), "var_name": "Tamaño", "var_vals": ["Grande 38cm", "Mediano 26cm"]},

    # Colombian Specialty Coffee & Gourmet
    {"title": "Café Juan Valdez Huila Selección Especial Grano Entero 500g", "brand": "Juan Valdez", "price_cop": 48000, "desc": "Notas dulces y afrutadas con acidez media y cuerpo balanceado. Cosechado a más de 1,700 metros en los Andes del Huila.", "img_url": "https://cdn.dummyjson.com/product-images/groceries/honey-jar/1.webp", "niche": "GROCERIES", "cat_sql": get_category_sql("groceries"), "var_name": "Molienda", "var_vals": ["Grano Entero", "Molienda Media (Cafetera)", "Molienda Fina (Espresso)"]},
    {"title": "Prensa Francesa Bodum Chambord Vidrio Borosilicato 1L", "brand": "Bodum", "price_cop": 189000, "desc": "El método icónico para extraer los aceites aromáticos esenciales del café sin filtros de papel. Estructura cromada.", "img_url": "https://cdn.dummyjson.com/product-images/groceries/ice-cream/1.webp", "niche": "GROCERIES", "cat_sql": get_category_sql("groceries"), "var_name": "Capacidad", "var_vals": ["1 Litro (8 Tazas)", "500 ml (4 Tazas)"]}
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

print("Mapped products across all retail niches successfully.")

# 4. STORE-TO-NICHE MAPPING MATRIX
STORE_NICHE_MAP = {
    "APPLE_TECH": ["LAPTOPS", "SMARTPHONES", "AUDIO"],
    "SAMSUNG_TECH": ["SMARTPHONES", "LAPTOPS", "AUDIO"],
    "FOOTWEAR_SPORTS": ["FOOTWEAR", "SPORTS"],
    "AUDIO_TECH": ["AUDIO", "SMARTPHONES"],
    "SPORTS_FITNESS": ["SPORTS", "FOOTWEAR", "CYCLING"],
    "MENS_FASHION": ["MENS_FASHION", "WATCHES_JEWELRY", "FOOTWEAR"],
    "WOMENS_FASHION": ["WOMENS_FASHION", "OPTICA", "WATCHES_JEWELRY"],
    "BEAUTY_PERFUME": ["BEAUTY", "SKINCARE"],
    "FURNITURE_HOME": ["FURNITURE", "KITCHEN"],
    "TOOLS_HARDWARE": ["TOOLS"],
    "SKINCARE_HEALTH": ["SKINCARE", "BEAUTY"],
    "KITCHEN_APPLIANCES": ["KITCHEN"],
    "GROCERIES_FOOD": ["GROCERIES"],
    "TOYS_BABY": ["TOYS_BABY", "FURNITURE"],
    "OPTICA_SUNGLASSES": ["OPTICA", "WATCHES_JEWELRY"],
    "WATCHES_LUXURY": ["WATCHES_JEWELRY"],
    "LAPTOPS_PC": ["LAPTOPS", "AUDIO"],
    "CYCLING_BIKES": ["CYCLING", "SPORTS"],
    "LARGE_APPLIANCES": ["LARGE_APPLIANCES", "KITCHEN"],
    "SMARTPHONES_TECH": ["SMARTPHONES", "AUDIO"]
}

# 5. GENERATE DATA STRUCTURES
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
    "Crespo", "Marbella", "Pie de la Popa", "Cabany", "Castillo Grande", "Chambacú"
]
BANCOS_COL = ["Bancolombia", "Nequi", "Daviplata", "Davivienda", "Banco de Bogotá"]

# Generate Buyers (120 buyers: 5001 - 5120)
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

# Generate Stores and Store Owners (36 stores: 6001 - 6036)
sellers = []
stores = []
for s in STORES_CATALOG:
    sid = 6000 + s["id"]
    owner_nom = f"{random.choice(NOMBRES_COL)} {random.choice(APELLIDOS_COL)}"
    owner_email = f"contacto_{re.sub(r'[^a-z0-9]', '', s['name'].lower())[:12]}_{s['id']}@mock.mercatto.co"
    owner_tel = f"30{random.randint(10000000, 99999999)}"
    banco = random.choice(BANCOS_COL)
    cuenta = f"30{random.randint(10000000, 99999999)}" if banco in ["Nequi", "Daviplata"] else f"{random.randint(10000000000, 99999999999)}"
    nit = f"901{random.randint(100000, 999999)}-{random.randint(1, 9)}"
    calif = round(random.uniform(4.7, 5.0), 1)
    dias = random.randint(5, 45)
    
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
        "logo_url": s["logo"],
        "banner_url": s["banner"],
        "tipo_suscripcion": s["plan"],
        "nit_cedula": nit,
        "cuenta_bancaria": cuenta,
        "banco": banco,
        "calificacion": calif,
        "total_ventas": random.randint(3, 25),
        "direccion": f"Cartagena de Indias, Bolívar - Cra {random.randint(2, 60)} # {random.randint(10, 80)}-{random.randint(1, 99)}",
        "days_ago": dias
    })

# Generate Products: 15 unique items per store = 540 products
products = []
images = []
variants = []
var_attrs = []

prod_seq = 7001
img_seq = 7001
var_seq = 8001
attr_seq = 8001

for s in STORES_CATALOG:
    sid = 6000 + s["id"]
    niche = s["niche"]
    allowed_pool_keys = STORE_NICHE_MAP.get(niche, ["GENERAL"])
    
    pool = []
    for k in allowed_pool_keys:
        if k in products_by_niche:
            pool.extend(products_by_niche[k])
    if not pool:
        for k, v in products_by_niche.items():
            pool.extend(v)
            
    # Assign 15 distinct items to this store
    for p_idx in range(15):
        base_item = pool[p_idx % len(pool)]
        pid = prod_seq
        sku = f"SEED-PROD-{pid}"
        slug = f"{re.sub(r'[^a-z0-9]+', '-', base_item['title'].lower()).strip('-')}-{pid}"
        
        norm_price = base_item["price_cop"]
        has_disc = (pid % 3 == 0)
        disc_pct = random.choice([0.10, 0.15, 0.20])
        offer_price = int(norm_price * (1.0 - disc_pct)) if has_disc else None
        
        stock = random.randint(10, 50)
        calif = round(random.uniform(4.7, 5.0), 1)
        reviews = random.randint(3, 24)
        sales = random.randint(0, 4)
        dias = random.randint(1, 45)
        
        # Inyectar marca de la tienda si es tienda oficial de marca
        store_brand = base_item["brand"]
        if "Apple" in s["name"]:
            store_brand = "Apple"
        elif "Samsung" in s["name"]:
            store_brand = "Samsung"
        elif "Nike" in s["name"]:
            store_brand = "Nike"
        elif "Adidas" in s["name"]:
            store_brand = "Adidas"
        elif "Sony" in s["name"]:
            store_brand = "Sony"
        elif "Arturo Calle" in s["name"]:
            store_brand = "Arturo Calle"
        elif "Studio F" in s["name"]:
            store_brand = "Studio F"
        elif "IKEA" in s["name"]:
            store_brand = "IKEA"
        elif "Oster" in s["name"]:
            store_brand = "Oster"
        elif "Lego" in s["name"]:
            store_brand = "Lego"
        elif "Ray-Ban" in s["name"]:
            store_brand = "Ray-Ban"
        elif "Rolex" in s["name"]:
            store_brand = "Rolex"
        elif "Dell" in s["name"]:
            store_brand = "Dell"
        elif "Puma" in s["name"]:
            store_brand = "Puma"
        elif "Trek" in s["name"]:
            store_brand = "Trek"
        elif "Challenger" in s["name"]:
            store_brand = "Challenger"
        elif "Xiaomi" in s["name"]:
            store_brand = "Xiaomi"
        elif "Clinique" in s["name"]:
            store_brand = "Clinique"
        elif "Stanley" in s["name"]:
            store_brand = "Stanley"
        elif "Mabe" in s["name"]:
            store_brand = "Mabe"
        elif "Bose" in s["name"]:
            store_brand = "Bose"
        elif "Juan Valdez" in s["name"]:
            store_brand = "Juan Valdez"
            
        products.append({
            "id": pid,
            "vendedor_id": sid,
            "categoria_sql": base_item["cat_sql"],
            "titulo": f"{base_item['title']} - {store_brand}" if store_brand not in base_item['title'] else base_item['title'],
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

print(f"Generated {len(products)} products across {len(STORES_CATALOG)} stores.")

# Generate Orders (300 orders: 9001 - 9300)
orders = []
order_items = []
payments = []

ESTADOS = ["ENTREGADO", "PAGADO", "ENVIADO", "PENDIENTE"]
PESOS = [0.50, 0.30, 0.15, 0.05]
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
    metodo = random.choice(["WOMPI", "PSE", "NEQUI", "TARJETA_CREDITO", "CONTRA_ENTREGA"])
    payments.append({
        "id": oid,
        "pedido_id": oid,
        "metodo": metodo,
        "estado": pago_estado,
        "monto": total,
        "days_ago": dias
    })

print(f"Generated {len(orders)} orders, {len(order_items)} items, and {len(payments)} payments.")

# 6. WRITE SQL FILE
sql_path = os.path.join(PROJECT_ROOT, "supabase_seed_feria_1000.sql")
NL = "\n"
SEP = "," + NL

with open(sql_path, "w", encoding="utf-8") as f:
    f.write("-- ============================================================================" + NL)
    f.write("-- MERCATTO MARKETPLACE - SEEDING FERIA COMERCIAL CARTAGENA 2026 (RETAIL OFICIAL)" + NL)
    f.write("-- PACKSHOTS FONDO BLANCO PURO (#FFFFFF) - PRODUCTOS REALES Y MARCAS OFICIALES" + NL)
    f.write("-- TIENDAS EXCLUSIVAS (CERO COLISION CON LAS 6 TIENDAS CREADAS MANUALMENTE)" + NL)
    f.write("-- ============================================================================" + NL + NL)
    f.write("BEGIN;" + NL + NL)
    
    # 0. DDL COMPATIBILITY
    f.write("-- 0. COLUMNAS DE COMPATIBILIDAD" + NL)
    f.write("ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS tokens_chat INT DEFAULT 5;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT false;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS principal BOOLEAN DEFAULT false;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_variantes ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;" + NL)
    f.write("ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP;" + NL)
    f.write("ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP;" + NL + NL)
    
    # 1. COMPRADORES
    f.write("-- 1. USUARIOS COMPRADORES (120 Registros)" + NL)
    f.write("INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)" + NL + "VALUES" + NL)
    rows = []
    for b in buyers:
        nom_e = b['nombre'].replace("'", "''")
        rows.append(f"({b['id']}, '{nom_e}', '{b['email']}', '{BCRYPT_HASH}', 'COMPRADOR', TRUE, TRUE, '{b['telefono']}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{b['days_ago']} days')")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 2. DIRECCIONES
    f.write("-- 2. DIRECCIONES COMPRADORES (120 Registros)" + NL)
    f.write("INSERT INTO direcciones (id, usuario_id, nombre_completo, telefono, direccion, barrio, ciudad, departamento, codigo_postal, notas_entrega, es_principal)" + NL + "VALUES" + NL)
    rows = []
    for d in buyer_addresses:
        nom_e = d['nombre'].replace("'", "''")
        dir_e = d['direccion'].replace("'", "''")
        rows.append(f"({d['id']}, {d['usuario_id']}, '{nom_e}', '{d['telefono']}', '{dir_e}', '{d['barrio']}', 'Cartagena de Indias', 'Bolívar', '130001', 'Entregar en portería / recepción', TRUE)")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 3. VENDEDORES
    f.write("-- 3. USUARIOS VENDEDORES (36 Registros)" + NL)
    f.write("INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)" + NL + "VALUES" + NL)
    rows = []
    for s in sellers:
        nom_e = s['nombre'].replace("'", "''")
        rows.append(f"({s['id']}, '{nom_e}', '{s['email']}', '{BCRYPT_HASH}', 'VENDEDOR', TRUE, TRUE, '{s['telefono']}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{s['days_ago']} days')")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 4. TIENDAS
    f.write("-- 4. TIENDAS OFICIALES / VENDEDORES (36 Registros)" + NL)
    f.write("INSERT INTO vendedores (id, usuario_id, tipo, nombre_tienda, descripcion, logo_url, estado, nit_cedula, razon_social, ciudad, direccion, cuenta_bancaria, banco, calificacion, total_ventas, tipo_suscripcion, fecha_registro)" + NL + "VALUES" + NL)
    rows = []
    for st in stores:
        t_e = st['nombre_tienda'].replace("'", "''")
        d_e = st['descripcion'].replace("'", "''")
        rows.append(f"({st['id']}, {st['usuario_id']}, 'EMPRESA', '{t_e}', '{d_e}', '{st['logo_url']}', 'APROBADO', '{st['nit_cedula']}', '{t_e} S.A.S.', 'Cartagena de Indias', '{st['direccion']}', '{st['cuenta_bancaria']}', '{st['banco']}', {st['calificacion']}, {st['total_ventas']}, '{st['tipo_suscripcion']}', NOW() - INTERVAL '{st['days_ago']} days')")
    f.write(SEP.join(rows) + ";" + NL + NL)
    
    # 5. PRODUCTOS
    f.write("-- 5. PRODUCTOS DE CATÁLOGO PACKSHOT FONDO BLANCO PURO (540 Registros)" + NL)
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
    f.write("-- 6. PRODUCTO IMAGENES (540 Registros Packshot Fondo Blanco)" + NL)
    for i in range(0, len(images), 50):
        chunk = images[i:i+50]
        f.write("INSERT INTO producto_imagenes (id, producto_id, url, principal, es_principal, orden_visual)" + NL + "VALUES" + NL)
        im_rows = []
        for im in chunk:
            im_rows.append(f"({im['id']}, {im['producto_id']}, '{im['url']}', TRUE, TRUE, 0)")
        f.write(SEP.join(im_rows) + ";" + NL + NL)
        
    # 7. PRODUCTO VARIANTES
    f.write("-- 7. PRODUCTO VARIANTES (Tallas / Colores / Almacenamiento)" + NL)
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
    f.write("-- 8. VARIANTE ATRIBUTOS" + NL)
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
    f.write("-- 9. PEDIDOS HISTÓRICOS Y ACTIVOS (300 Registros)" + NL)
    for i in range(0, len(orders), 50):
        chunk = orders[i:i+50]
        f.write("INSERT INTO pedidos (id, codigo, comprador_id, direccion_id, estado, subtotal, descuento, costo_envio, total, notas, fecha_creacion, fecha_actualizacion)" + NL + "VALUES" + NL)
        o_rows = []
        for o in chunk:
            o_rows.append(f"({o['id']}, '{o['codigo']}', {o['comprador_id']}, {o['comprador_id']}, '{o['estado']}', {o['subtotal']}, 0.0, {o['costo_envio']}, {o['total']}, 'MOCK_FERIA_CARTAGENA', NOW() - INTERVAL '{o['days_ago']} days', NOW() - INTERVAL '{o['days_ago']} days')")
        f.write(SEP.join(o_rows) + ";" + NL + NL)
        
    # 10. PEDIDO ITEMS
    f.write("-- 10. PEDIDO ITEMS" + NL)
    for i in range(0, len(order_items), 50):
        chunk = order_items[i:i+50]
        f.write("INSERT INTO pedido_items (id, pedido_id, producto_id, vendedor_id, nombre_producto, precio_unitario, cantidad, subtotal)" + NL + "VALUES" + NL)
        oi_rows = []
        for oi in chunk:
            nom_e = oi['nombre_producto'].replace("'", "''")
            oi_rows.append(f"({oi['id']}, {oi['pedido_id']}, {oi['producto_id']}, {oi['vendedor_id']}, '{nom_e}', {oi['precio_unitario']}, {oi['cantidad']}, {oi['subtotal']})")
        f.write(SEP.join(oi_rows) + ";" + NL + NL)
        
    # 11. PAGOS
    f.write("-- 11. PAGOS (300 Registros)" + NL)
    for i in range(0, len(payments), 50):
        chunk = payments[i:i+50]
        f.write("INSERT INTO pagos (id, pedido_id, metodo, estado, monto, moneda, fecha_pago, fecha_confirmacion, fecha_creacion)" + NL + "VALUES" + NL)
        pay_rows = []
        for pay in chunk:
            pay_rows.append(f"({pay['id']}, {pay['pedido_id']}, '{pay['metodo']}', '{pay['estado']}', {pay['monto']}, 'COP', NOW() - INTERVAL '{pay['days_ago']} days', NOW() - INTERVAL '{pay['days_ago']} days', NOW() - INTERVAL '{pay['days_ago']} days')")
        f.write(SEP.join(pay_rows) + ";" + NL + NL)
        
    # 12. AJUSTE DE SECUENCIAS
    f.write("-- 12. REAJUSTE DE SECUENCIAS POSTGRESQL" + NL)
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

print("SUCCESS: supabase_seed_feria_1000.sql has been written successfully!")
