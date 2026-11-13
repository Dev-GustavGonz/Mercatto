import json
import random
import datetime

# Seed for reproducible high-quality data
random.seed(42)

# Bcrypt hash for 'Mercatto2026*'
BCRYPT_PASSWORD_HASH = "$2a$10$913d199f349e540cf50caa123e5697cb1d6089eff315529b3ea3f"

# Colombian names
NOMBRES_MASCULINOS = [
    "Santiago", "Carlos", "Andrés", "Mateo", "Felipe", "Daniel", "Alejandro", "Juan", "David", "Gabriel",
    "Sebastián", "Diego", "Nicolás", "Esteban", "Julián", "Lucas", "Samuel", "Martín", "Leonardo", "Emilio",
    "Fabián", "Gustavo", "Rodrigo", "Mauricio", "Álvaro", "Alonso", "Camilo", "Hernán", "Ricardo", "Eduardo"
]
NOMBRES_FEMENINOS = [
    "María", "Valeria", "Camila", "Mariana", "Daniela", "Paula", "Isabella", "Natalia", "Laura", "Lucía",
    "Juliana", "Carolina", "Diana", "Silvia", "Sofía", "Adriana", "Mónica", "Tatiana", "Karen", "Ana",
    "Ingrid", "Elena", "Clara", "Catalina", "Patricia", "Verónica", "Gabriela", "Carmen", "Lorena", "Luisa"
]
APELLIDOS = [
    "Gómez", "Martínez", "Rodríguez", "López", "García", "Pérez", "González", "Hernández", "Sánchez", "Ramírez",
    "Torres", "Flores", "Díaz", "Vásquez", "Castro", "Morales", "Álvarez", "Reyes", "Gutiérrez", "Jiménez",
    "De La Espriella", "Paternina", "Berrio", "Buelvas", "Donado", "Manotas", "Vergel", "Arrieta", "Amador", "Vives",
    "Osorio", "Pretelt", "Covo", "Chaljub", "Segovia", "Tatis", "Lorduy", "De Ávila", "Meza", "Ballestas"
]

BARRIOS_CARTAGENA = [
    "Bocagrande", "Castillogrande", "El Laguito", "Manga", "Pie de la Popa", "Crespo", "Getsemaní", 
    "Centro Histórico", "San Diego", "El Cabrero", "Los Ejecutivos", "La Castellana", "Los Alpes", "Alto Bosque"
]

BANCOS = ["Bancolombia", "Nequi", "Daviplata", "Davivienda", "Banco de Bogotá"]

# 40 Stores definitions
STORES_DATA = [
    ("Underwater Electro", "Vitrina oficial de audio premium, tecnología submarina y gadgets de última generación con garantía directa en Cartagena.", "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80", "ELITE", 1),
    ("NexoShop Cartagena", "Tu aliado en calzado urbano de alta gama, zapatillas de colección y accesorios streetwear 100% originales.", "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=80", "ELITE", 4),
    ("Hakzr Games", "Distribuidor autorizado de PlayStation 5, Xbox Series X, Nintendo Switch, periféricos esports y coleccionables.", "https://images.unsplash.com/photo-1612287271034-2e21e0d37e28?w=500&auto=format&fit=crop&q=80", "ELITE", 1),
    ("Havaianas Cartagena", "Distribuidor oficial de las icónicas chanclas brasileñas. Diseñadas para disfrutar con frescura el verano caribeño.", "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=500&auto=format&fit=crop&q=80", "ELITE", 4),
    ("Electrónicos El Bosque", "Componentes electrónicos, domótica, sistemas de energía solar y audio profesional para Bolívar.", "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop&q=80", "PRO", 1),
    ("Aura Café Cartagena", "Café de especialidad origen Sierra Nevada y Huila tostado en Cartagena, prensas francesas y cafeteras espresso.", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80", "PRO", 2),
    ("Calzados La Heroica", "Mocasines en cuero legítimo, calzado artesanal y sandalias de exportación hechas a mano por maestros zapateros.", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80", "PRO", 3),
    ("CaribeTech Solutions", "Smartphones libres de fábrica, smartwatches, cargadores GaN y accesorios de marcas líderes mundiales.", "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=500&auto=format&fit=crop&q=80", "PRO", 1),
    ("Gamer Studio Cartagena", "Computadores armados de alto rendimiento, tarjetas gráficas Nvidia RTX y periféricos gamers de precisión.", "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80", "ELITE", 1),
    ("Moda Bocagrande", "Prendas frescas en lino, camisas guayaberas contemporáneas y vestidos playeros de alta costura.", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80", "PRO", 4),
    ("ElectroHogar Manglar", "Air fryers, batidoras, licuadoras de alta potencia y robots aspiradores con despacho exprés en Cartagena.", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80", "STARTER", 15),
    ("Dermatología del Caribe", "Cuidado dermocosmético avanzado, protectores solares ultraligeros para clima costero y sérums antioxidantes.", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80", "ELITE", 7),
    ("Pretelt Relojería", "Relojes analógicos y cronógrafos clásicos, resistentes al agua salina y diseñados para ejecutivos modernos.", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80", "PRO", 3),
    ("Zenith Óptica", "Lentes de sol polarizados con protección UV400 y monturas livianas en acetato italiano.", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80", "PRO", 4),
    ("Chaljub Deportes", "Implementos para running, natación, crossfit, raquetas de pádel y ropa deportiva antitranspirante.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80", "STARTER", 5),
    ("Playa & Soleil", "Trajes de baño ecológicos elaborados con botellas recicladas del océano y pareos pintados a mano.", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80", "PRO", 4),
    ("Audio & Sonido Cartagena", "Bafles portátiles impermeables Bluetooth, micrófonos inalámbricos y barras de sonido para cine en casa.", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80", "PRO", 1),
    ("Lorduy Joyería Fina", "Filigrana momposina en plata 950 y esmeraldas colombianas certificadas de alta pureza.", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80", "ELITE", 4),
    ("De Ávila Motor Repuestos", "Baterías automotrices Bosch, aceites sintéticos y accesorios de seguridad para motos y carros.", "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80", "STARTER", 10),
    ("Meza Beauty Bar", "Cosmética vegana, paletas de sombras profesionales, brochas de cerdas sintéticas y skincare caribeño.", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80", "PRO", 7),
    ("Urban Style Cartagena", "Chaquetas livianas, joggers, gorras originales New Era y prendas streetwear oversize.", "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&auto=format&fit=crop&q=80", "STARTER", 3),
    ("Carriazo Home Decor", "Vajillas de cerámica vidriada, mantelería en lino costero y lámparas colgantes en fibra de ratán natural.", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80", "PRO", 2),
    ("Lecompte Computadores", "Servidores, switches de red, memorias RAM DDR5 y soluciones informáticas corporativas para empresas.", "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80", "PRO", 1),
    ("Aromas de Indias", "Velas de cera de soja con aromas cítricos y florales de Cartagena, difusores mikado y sprays de almohada.", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80", "ELITE", 2),
    ("Cartagena Fit Nutrition", "Proteínas aisladas de suero, creatina monohidratada creapure, aminoácidos y snacks saludables.", "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=80", "ELITE", 11),
    ("Benedetti Boutique", "Prendas exclusivas de diseñadores colombianos para bodas, cocteles y galas en Cartagena.", "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80", "PRO", 4),
    ("Pareja Instrumentos", "Guitarras electroacústicas, ukeleles caribeños, percusión menor (congas, bongoes) y amplificadores.", "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop&q=80", "STARTER", 1),
    ("Turbay Accesorios", "Bolsos de mano en palma de iraca tejida, aretes artesanales con piedras semipreciosas y turbantes.", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=80", "PRO", 4),
    ("Marrugo Bikes", "Bicicletas de montaña, cascos certificados, candados de alta seguridad y accesorios para ciclistas.", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80", "PRO", 5),
    ("Angulo Muebles & Confort", "Colchones ortopédicos con tecnología memory foam y sofás modulares resistentes a la humedad tropical.", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80", "STARTER", 14),
    ("Castillo Celulares", "Servicio técnico especializado Apple y Samsung, pantallas OLED originales y baterías de alta durabilidad.", "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80", "STARTER", 1),
    ("Pinedo Cosméticos", "Labiales indelebles resistentes al sudor, fijadores de maquillaje en bruma y mascarillas capilares.", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80", "PRO", 7),
    ("Senior Kitchen Gourmet", "Cuchillos forjados en acero damasco japonés, sartenes con revestimiento en granito y tablas de teca.", "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500&auto=format&fit=crop&q=80", "PRO", 2),
    ("Burgos Calzado Infantil", "Zapatos ortopédicos y sandalias ergonómicas para los primeros pasos de los niños en Cartagena.", "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=500&auto=format&fit=crop&q=80", "STARTER", 12),
    ("Lemaitre Smart Security", "Cámaras de seguridad WiFi con visión nocturna a color, timbres con video y cerraduras biométricas.", "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop&q=80", "ELITE", 1),
    ("Román Juguetes & Bebés", "Juegos de estimulación temprana Montessori, coches plegables para viaje y biberones anticólicos.", "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&auto=format&fit=crop&q=80", "PRO", 6),
    ("Badel Ferretería Industrial", "Taladros percutores inalámbricos, herramientas Stanley, compresores y tornillería naval inoxidable.", "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=500&auto=format&fit=crop&q=80", "STARTER", 13),
    ("Calvo Sportswear", "Uniformes deportivos personalizados, licras térmicas de compresión y gorras para deportes al aire libre.", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80", "STARTER", 5),
    ("De La Rosa Laptops", "Laptops Apple MacBook Air M3, Dell XPS, Lenovo ThinkPad con factura legal y garantía local.", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80", "ELITE", 1),
    ("Fortich Home & Living", "Hamacas artesanales de San Jacinto, cojines bordados a mano y canastos tejidos en fibras naturales.", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80", "PRO", 2)
]

# High quality studio product catalog templates with PURE WHITE background (#FFFFFF)
PRODUCT_CATALOG = [
    # Tecnologia
    ("Auriculares Inalámbricos Sony WH-CH520 Bluetooth 5.3", "Sony", 1, 280000, "SNY-WHCH520", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", ["Negro", "Azul", "Blanco"]),
    ("Parlante Portátil Bluetooth JBL Flip 6 Resistente al Agua", "JBL", 1, 580000, "JBL-FLIP6", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80", ["Negro", "Rojo", "Azul"]),
    ("Consola Nintendo Switch OLED 64GB Edición Blanca", "Nintendo", 1, 1750000, "NTD-SW-OLED", "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80", ["Blanca", "Neon"]),
    ("Control Inalámbrico Sony DualSense PlayStation 5", "Sony", 1, 340000, "SNY-PS5-DS", "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80", ["Blanco", "Negro Medianoche", "Rojo Cósmico"]),
    ("Apple iPhone 15 128GB Pantalla Super Retina XDR USB-C", "Apple", 1, 3850000, "APL-IPH15", "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&auto=format&fit=crop&q=80", ["Negro", "Azul", "Verde"]),
    ("Mouse Gamer Inalámbrico Logitech G Pro X Superlight", "Logitech G", 1, 620000, "LOG-GPRO-SL", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80", ["Blanco", "Negro", "Magenta"]),
    ("Teclado Mecánico Inalámbrico Logitech MX Mechanical Mini", "Logitech", 1, 540000, "LOG-MX-MECH", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80", ["Gris Grafito"]),
    ("Apple Watch Series 9 GPS 45mm Caja de Aluminio", "Apple", 1, 2150000, "APL-AW9-45", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80", ["Medianoche", "Plata"]),
    ("MacBook Air 13 Pulgadas Chip M3 256GB SSD", "Apple", 1, 5200000, "APL-MBA-M3", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80", ["Blanco Estelar", "Gris Espacial"]),
    ("Cámara de Seguridad WiFi TP-Link Tapo C200 360 FHD", "TP-Link", 1, 145000, "TPL-TAPO-C200", "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80", ["Blanco"]),

    # Calzado y Moda
    ("Chanclas Havaianas Top Unisex 100 Goma Brasil", "Havaianas", 4, 65000, "HAV-TOP-ORIG", "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80", ["37-38", "39-40", "41-42"]),
    ("Chanclas Havaianas Slim Elegance Mujer Tiras Finas", "Havaianas", 4, 75000, "HAV-SLIM-ELG", "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80", ["35-36", "37-38", "39-40"]),
    ("Tenis Urbanos Nike Air Force 1 07 Low Cuero Blanco", "Nike", 4, 520000, "NIKE-AF1-07", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80", ["38", "39", "40", "41", "42"]),
    ("Zapatillas Running Adidas Ultraboost Light Performance", "Adidas", 3, 690000, "ADI-UB-LGT", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", ["39", "40", "41", "42"]),
    ("Tenis Casuales Adidas Stan Smith Clásicos Blancos", "Adidas", 3, 380000, "ADI-STAN-WHT", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80", ["38", "39", "40", "41"]),
    ("Mocasines Clásicos en Cuero Graso Hecho a Mano", "La Heroica", 3, 210000, "HER-MOC-CUER", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80", ["39", "40", "41", "42"]),
    ("Lentes de Sol Polarizados Ray-Ban Wayfarer Clásicos", "Ray-Ban", 4, 490000, "RB-WAY-2140", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80", ["Negro Pulido", "Carey"]),
    ("Reloj Cronógrafo Seiko 5 Sports Automático Acero", "Seiko", 3, 1150000, "SEI-5-SPORT", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80", ["Plata / Esfera Azul", "Plata / Esfera Negra"]),
    ("Morral Ejecutivo Antirrobo Impermeable para Portátil", "NexoGear", 3, 160000, "NXG-MORR-15", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80", ["Negro Carbón", "Gris Oxford"]),
    ("Camisa Guayabera Manga Larga en Lino Puro 100", "Bocagrande", 3, 240000, "BOC-GUAY-LIN", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80", ["Blanco", "Beige", "Celeste"]),

    # Hogar y Electrodomesticos
    ("Cafetera Espresso Manual DeLonghi Dedica Deluxe Acero", "DeLonghi", 15, 950000, "DLG-EC680-SS", "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80", ["Acero Inoxidable", "Negro Mate"]),
    ("Freidora de Aire Digital Oster 4L DiamondForce", "Oster", 15, 390000, "OST-AF4L-DF", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80", ["Negro"]),
    ("Licuadora de Alta Potencia Oster Reversible 2 Litros", "Oster", 15, 320000, "OST-BLND-REV", "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80", ["Cromado", "Rojo"]),
    ("Lámpara de Escritorio LED Minimalista con Carga Inalámbrica", "Carriazo", 2, 140000, "CRZ-LAMP-LED", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80", ["Blanco", "Negro"]),
    ("Altavoz Inteligente Amazon Echo Dot 5ta Generación", "Amazon", 1, 230000, "AMZ-ECHO-5", "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80", ["Antracita", "Blanco"]),

    # Cuidado Personal y Belleza
    ("Sérum Facial Antioxidante La Roche-Posay Pure Vitamin C10", "La Roche-Posay", 7, 198000, "LRP-VITC10", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80", ["30ml"]),
    ("Protector Solar Anthelios UVMune 400 Oil Control SPF50", "La Roche-Posay", 7, 115000, "LRP-ANTH-50", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80", ["50ml"]),
    ("Perfume Unisex Acqua di Giò Giorgio Armani Eau de Parfum", "Giorgio Armani", 7, 490000, "ARM-ADG-EDP", "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80", ["75ml", "125ml"]),
    ("Secador de Cabello Iónico Profesional Babyliss Pro Nano", "Babyliss Pro", 7, 360000, "BBL-SEC-NANO", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80", ["Azul Titanio"])
]

print(f"Total base templates: {len(PRODUCT_CATALOG)}")
