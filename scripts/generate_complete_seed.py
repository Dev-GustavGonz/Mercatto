import random
import datetime

random.seed(42)

BCRYPT_HASH = "$2a$10$913d199f349e540cf50caa123e5697cb1d6089eff315529b3ea3f"

NOMBRES_MASC = [
    "Santiago", "Carlos", "Andrés", "Mateo", "Felipe", "Daniel", "Alejandro", "Juan", "David", "Gabriel",
    "Sebastián", "Diego", "Nicolás", "Esteban", "Julián", "Lucas", "Samuel", "Martín", "Leonardo", "Emilio",
    "Fabián", "Gustavo", "Rodrigo", "Mauricio", "Álvaro", "Alonso", "Camilo", "Hernán", "Ricardo", "Eduardo"
]
NOMBRES_FEM = [
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

BARRIOS = [
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

# Product catalog templates with studio pure white (#FFFFFF) background photography
PRODUCT_SEEDS = [
    # Tecnologia (cat 1)
    ("Auriculares Inalámbricos Sony WH-CH520 Bluetooth 5.3", "Sony", 1, 280000, "SNY-WHCH520", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", ["Negro", "Azul", "Blanco"]),
    ("Parlante Portátil Bluetooth JBL Flip 6 Resistente al Agua", "JBL", 1, 580000, "JBL-FLIP6", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80", ["Negro", "Rojo", "Azul"]),
    ("Consola Nintendo Switch OLED 64GB Edición Blanca", "Nintendo", 1, 1750000, "NTD-SW-OLED", "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80", ["Blanca", "Neon"]),
    ("Control Inalámbrico Sony DualSense PlayStation 5", "Sony", 1, 340000, "SNY-PS5-DS", "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80", ["Blanco", "Negro", "Rojo Cósmico"]),
    ("Apple iPhone 15 128GB Pantalla Super Retina XDR USB-C", "Apple", 1, 3850000, "APL-IPH15", "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&auto=format&fit=crop&q=80", ["Negro", "Azul", "Verde"]),
    ("Mouse Gamer Inalámbrico Logitech G Pro X Superlight", "Logitech G", 1, 620000, "LOG-GPRO-SL", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80", ["Blanco", "Negro", "Magenta"]),
    ("Teclado Mecánico Inalámbrico Logitech MX Mechanical Mini", "Logitech", 1, 540000, "LOG-MX-MECH", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80", ["Gris Grafito"]),
    ("Apple Watch Series 9 GPS 45mm Caja de Aluminio", "Apple", 1, 2150000, "APL-AW9-45", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80", ["Medianoche", "Plata"]),
    ("MacBook Air 13 Pulgadas Chip M3 256GB SSD", "Apple", 1, 5200000, "APL-MBA-M3", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80", ["Blanco Estelar", "Gris Espacial"]),
    ("Cámara de Seguridad WiFi TP-Link Tapo C200 360 FHD", "TP-Link", 1, 145000, "TPL-TAPO-C200", "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80", ["Blanco"]),
    ("Audífonos In-Ear Inalámbricos Samsung Galaxy Buds2 Pro", "Samsung", 1, 640000, "SAM-BUDS2-PRO", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80", ["Grafito", "Blanco", "Lavanda"]),
    ("Smartphone Samsung Galaxy S24 Ultra 256GB Titanium", "Samsung", 1, 5100000, "SAM-S24U-256", "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&auto=format&fit=crop&q=80", ["Titanio Gris", "Titanio Negro"]),
    ("Tablet Apple iPad Air 11 Pulgadas Chip M2 128GB Wi-Fi", "Apple", 1, 3100000, "APL-IPADAIR-M2", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80", ["Azul", "Blanco Estelar"]),
    ("Smartwatch Deportivo Garmin Forerunner 55 GPS", "Garmin", 1, 890000, "GAR-FR-55", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80", ["Negro", "Aqua", "Blanco"]),
    ("Cargador Rápido Anker GaN Prime 65W Triple Puerto USB-C", "Anker", 1, 185000, "ANK-GAN-65W", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80", ["Negro", "Plata"]),

    # Calzado y Moda (cat 3 y 4)
    ("Chanclas Havaianas Top Unisex 100 Goma Brasil", "Havaianas", 4, 65000, "HAV-TOP-ORIG", "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80", ["37-38", "39-40", "41-42"]),
    ("Chanclas Havaianas Slim Elegance Mujer Tiras Finas", "Havaianas", 4, 75000, "HAV-SLIM-ELG", "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80", ["35-36", "37-38", "39-40"]),
    ("Tenis Urbanos Nike Air Force 1 07 Low Cuero Blanco", "Nike", 4, 520000, "NIKE-AF1-07", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80", ["38", "39", "40", "41", "42"]),
    ("Zapatillas Running Adidas Ultraboost Light Performance", "Adidas", 3, 690000, "ADI-UB-LGT", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", ["39", "40", "41", "42"]),
    ("Tenis Casuales Adidas Stan Smith Clásicos Blancos", "Adidas", 3, 380000, "ADI-STAN-WHT", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80", ["38", "39", "40", "41"]),
    ("Mocasines Clásicos en Cuero Graso Hecho a Mano", "La Heroica", 3, 210000, "HER-MOC-CUER", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80", ["39", "40", "41", "42"]),
    ("Lentes de Sol Polarizados Ray-Ban Wayfarer Clásicos", "Ray-Ban", 4, 490000, "RB-WAY-2140", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80", ["Negro Pulido", "Carey"]),
    ("Reloj Cronógrafo Seiko 5 Sports Automático Acero", "Seiko", 3, 1150000, "SEI-5-SPORT", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80", ["Plata / Azul", "Plata / Negro"]),
    ("Morral Ejecutivo Antirrobo Impermeable para Portátil", "NexoGear", 3, 160000, "NXG-MORR-15", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80", ["Negro Carbón", "Gris Oxford"]),
    ("Camisa Guayabera Manga Larga en Lino Puro 100", "Bocagrande", 3, 240000, "BOC-GUAY-LIN", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80", ["Blanco", "Beige", "Celeste"]),
    ("Sandalias Cuña en Yute Natural y Cuero Caramelo", "La Heroica", 4, 185000, "HER-SAND-YUTE", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80", ["36", "37", "38", "39"]),
    ("Vestido Largo Estilo Bohemio en Algodón Pima", "Benedetti", 4, 290000, "BND-VEST-BOH", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80", ["S", "M", "L"]),
    ("Bermuda Casual en Lino Transpirable Corte Slim", "Bocagrande", 3, 140000, "BOC-BERM-LIN", "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80", ["30", "32", "34"]),
    ("Billetera Delgada en Cuero Colombiano con Bloqueo RFID", "Lorduy", 3, 95000, "LRD-BILL-RFID", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80", ["Café", "Negro"]),
    ("Bolso Tote Playero Tejido en Fibras de Palma de Iraca", "Turbay", 4, 210000, "TRB-TOTE-IRAC", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80", ["Natural", "Crudo y Azul"]),

    # Hogar y Electrodomesticos (cat 2 y 15)
    ("Cafetera Espresso Manual DeLonghi Dedica Deluxe Acero", "DeLonghi", 15, 950000, "DLG-EC680-SS", "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80", ["Acero Inoxidable", "Negro"]),
    ("Freidora de Aire Digital Oster 4L DiamondForce", "Oster", 15, 390000, "OST-AF4L-DF", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80", ["Negro"]),
    ("Licuadora de Alta Potencia Oster Reversible 2 Litros", "Oster", 15, 320000, "OST-BLND-REV", "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80", ["Cromado", "Rojo"]),
    ("Lámpara de Escritorio LED Minimalista con Carga Inalámbrica", "Carriazo", 2, 140000, "CRZ-LAMP-LED", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80", ["Blanco", "Negro"]),
    ("Altavoz Inteligente Amazon Echo Dot 5ta Generación", "Amazon", 1, 230000, "AMZ-ECHO-5", "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80", ["Antracita", "Blanco"]),
    ("Juego de Sartenes Antiadherentes Tefal Ingenio 3 Piezas", "Tefal", 2, 280000, "TEF-ING-3P", "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80", ["Negro"]),
    ("Prensa Francesa Bodum Chambord en Vidrio Borosilicato", "Bodum", 2, 160000, "BDM-CHAMB-1L", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80", ["Cobre", "Cromo"]),
    ("Aspiradora Robot Xiaomi Robot Vacuum E10 con Fregado", "Xiaomi", 15, 820000, "XMI-VAC-E10", "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80", ["Blanco"]),
    ("Dispensador de Agua Fría y Caliente Haceb Torre", "Haceb", 15, 590000, "HCB-DISP-TOR", "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80", ["Plata"]),
    ("Set de Cuchillos de Chef en Acero Alemán 5 Piezas", "Senior Kitchen", 2, 260000, "SNR-CHEF-5P", "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80", ["Acero y Nogal"]),

    # Cuidado Personal y Belleza (cat 7 y 11)
    ("Sérum Facial Antioxidante La Roche-Posay Pure Vitamin C10", "La Roche-Posay", 7, 198000, "LRP-VITC10", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80", ["30ml"]),
    ("Protector Solar Anthelios UVMune 400 Oil Control SPF50", "La Roche-Posay", 7, 115000, "LRP-ANTH-50", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80", ["50ml"]),
    ("Perfume Unisex Acqua di Giò Giorgio Armani Eau de Parfum", "Giorgio Armani", 7, 490000, "ARM-ADG-EDP", "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80", ["75ml", "125ml"]),
    ("Secador de Cabello Iónico Profesional Babyliss Pro Nano", "Babyliss Pro", 7, 360000, "BBL-SEC-NANO", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80", ["Azul Titanio"]),
    ("Crema Hidratante Cerave Facial Loción con Ceramidas", "CeraVe", 7, 72000, "CRV-PM-52ML", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80", ["52ml", "89ml"]),
    ("Gel Limpiador Espumoso La Roche-Posay Effaclar Purificante", "La Roche-Posay", 7, 105000, "LRP-EFF-200", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80", ["200ml", "400ml"]),
    ("Proteína Aislada Dymatize ISO100 Hidrolizada 5 Libras", "Dymatize", 11, 410000, "DYM-ISO100-5L", "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800&auto=format&fit=crop&q=80", ["Vainilla Gourmet", "Chocolate Fudge"]),
    ("Creatina Monohidratada Creapure Nutricost 500 Gramos", "Nutricost", 11, 145000, "NTC-CREA-500", "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800&auto=format&fit=crop&q=80", ["Sin Sabor"]),
    ("Kit de Brochas Profesionales de Maquillaje 12 Piezas", "Meza Beauty", 7, 130000, "MZB-BRSH-12P", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80", ["Oro Rosa", "Negro Mate"]),
    ("Vela Aromática en Cera de Soya Notas de Coco y Verbena", "Aromas de Indias", 2, 68000, "ADI-VELA-COCO", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80", ["250g"])
]

# Generate Buyers: 120
buyers = []
for i in range(1, 121):
    uid = 2000 + i
    is_fem = i % 2 == 0
    nom = random.choice(NOMBRES_FEM) if is_fem else random.choice(NOMBRES_MASC)
    ape1 = random.choice(APELLIDOS)
    ape2 = random.choice(APELLIDOS)
    full_name = f"{nom} {ape1} {ape2}"
    email = f"comprador{i}@mock.mercatto.co"
    tel = f"30{random.randint(10000000, 99999999)}"
    barrio = random.choice(BARRIOS)
    dir_txt = f"Cra {random.randint(2, 80)} # {random.randint(2, 60)}-{random.randint(10, 99)}"
    days_ago = random.randint(1, 45)
    buyers.append({
        "id": uid,
        "nombre": full_name,
        "email": email,
        "telefono": tel,
        "barrio": barrio,
        "direccion": dir_txt,
        "days_ago": days_ago
    })

# Generate Sellers / Stores: 40
sellers = []
stores = []
for i, s_def in enumerate(STORES_DATA, start=1):
    uid = 2120 + i
    sid = 200 + i
    s_name, s_desc, s_logo, s_sub, s_cat = s_def
    is_fem = i % 2 == 1
    nom = random.choice(NOMBRES_FEM) if is_fem else random.choice(NOMBRES_MASC)
    ape1 = random.choice(APELLIDOS)
    full_name = f"{nom} {ape1}"
    email = f"tienda{i}@mock.mercatto.co"
    tel = f"31{random.randint(10000000, 99999999)}"
    bank = random.choice(BANCOS)
    acc = f"{tel}" if bank in ["Nequi", "Daviplata"] else f"{random.randint(10000000000, 99999999999)}"
    nit = f"901{random.randint(100000, 999999)}-{random.randint(0, 9)}"
    rating = round(random.uniform(4.65, 5.0), 1)
    sales = random.randint(45, 340)
    days_ago = random.randint(15, 45)
    barrio = random.choice(BARRIOS)
    dir_store = f"{barrio} Calle {random.randint(5, 40)} # {random.randint(2, 30)}-{random.randint(10, 50)}"

    sellers.append({
        "id": uid,
        "nombre": full_name,
        "email": email,
        "telefono": tel,
        "days_ago": days_ago
    })
    stores.append({
        "id": sid,
        "usuario_id": uid,
        "nombre_tienda": s_name,
        "descripcion": s_desc,
        "logo_url": s_logo,
        "tipo_suscripcion": s_sub,
        "banco": bank,
        "cuenta_bancaria": acc,
        "nit_cedula": nit,
        "calificacion": rating,
        "total_ventas": sales,
        "direccion": dir_store,
        "cat_principal": s_cat,
        "days_ago": days_ago
    })

# Generate 540 Products across the 40 stores
# Exactly 540 products
products = []
images = []
variants = []
var_attrs = []

prod_id_seq = 1001
img_id_seq = 1001
var_id_seq = 1001
attr_id_seq = 1001

for p_idx in range(540):
    pid = prod_id_seq
    prod_id_seq += 1

    # Distribute among the 40 stores
    store = stores[p_idx % len(stores)]
    vendedor_id = store["id"]

    # Choose a template
    template = PRODUCT_SEEDS[p_idx % len(PRODUCT_SEEDS)]
    title_base, brand, cat_id, base_price, sku_prefix, img_url, var_options = template

    # Add realistic variant in title if repeated
    variation_suffix = f" Edición {chr(65 + (p_idx // len(PRODUCT_SEEDS)))}" if p_idx >= len(PRODUCT_SEEDS) else ""
    title = f"{title_base}{variation_suffix}"
    slug = f"mock-{sku_prefix.lower()}-{pid}"

    # ~35% of products have offer price
    has_offer = (p_idx % 3 == 0)
    normal_price = int(base_price * random.choice([0.9, 1.0, 1.05, 1.1]))
    offer_price = int(normal_price * random.choice([0.80, 0.85, 0.88])) if has_offer else None

    stock = random.randint(6, 48)
    rating = round(random.uniform(4.6, 5.0), 1)
    reviews = random.randint(8, 95)
    sales = random.randint(12, 180)
    sku = f"SEED-{sku_prefix}-{pid}"
    days_ago = random.randint(5, 40)

    desc = f"{title}. Calidad original con garantía directa por {store['nombre_tienda']} en Cartagena. Estado nuevo en empaque de fábrica sellado."

    products.append({
        "id": pid,
        "vendedor_id": vendedor_id,
        "categoria_id": cat_id,
        "titulo": title,
        "slug": slug,
        "descripcion": desc,
        "precio": normal_price,
        "precio_oferta": offer_price,
        "stock": stock,
        "sku": sku,
        "marca": brand,
        "calificacion": rating,
        "total_resenas": reviews,
        "total_ventas": sales,
        "days_ago": days_ago
    })

    # Images (1-2 per product)
    images.append({
        "id": img_id_seq,
        "producto_id": pid,
        "url": img_url,
        "principal": True,
        "orden": 0
    })
    img_id_seq += 1

    # Variants
    for v_name in var_options[:2]:
        var_sku = f"{sku}-{v_name[:3].upper()}"
        variants.append({
            "id": var_id_seq,
            "producto_id": pid,
            "sku": var_sku,
            "nombre": v_name,
            "precio": normal_price,
            "precio_oferta": offer_price,
            "stock": max(3, stock // 2),
            "imagen_url": img_url
        })

        attr_name = "Talla" if v_name[0].isdigit() else "Color / Variante"
        var_attrs.append({
            "id": attr_id_seq,
            "variante_id": var_id_seq,
            "nombre": attr_name,
            "valor": v_name
        })
        attr_id_seq += 1
        var_id_seq += 1

# Generate 300 Orders across the buyers and stores
orders = []
order_items = []
payments = []

ESTADOS_ORDEN = ["ENTREGADO", "PAGADO", "ENVIADO", "PENDIENTE"]
PESOS_ESTADOS = [0.45, 0.35, 0.15, 0.05]

order_item_seq = 1001

for o_idx in range(300):
    oid = 1001 + o_idx
    buyer = random.choice(buyers)
    buyer_id = buyer["id"]
    code = f"PED-MOCK-2026-{oid}"

    # Pick 1-3 products
    num_items = random.choices([1, 2, 3], weights=[0.65, 0.25, 0.10])[0]
    chosen_prods = random.sample(products, num_items)

    subtotal = 0
    for p in chosen_prods:
        qty = random.randint(1, 2)
        unit_price = p["precio_oferta"] if p["precio_oferta"] else p["precio"]
        line_total = unit_price * qty
        subtotal += line_total

        order_items.append({
            "id": order_item_seq,
            "pedido_id": oid,
            "producto_id": p["id"],
            "vendedor_id": p["vendedor_id"],
            "nombre_producto": p["titulo"],
            "precio_unitario": unit_price,
            "cantidad": qty,
            "subtotal": line_total
        })
        order_item_seq += 1

    envio = 12000 if subtotal < 150000 else 0
    total = subtotal + envio
    estado = random.choices(ESTADOS_ORDEN, weights=PESOS_ESTADOS)[0]
    days_ago = random.randint(1, 45)

    orders.append({
        "id": oid,
        "codigo": code,
        "comprador_id": buyer_id,
        "estado": estado,
        "subtotal": subtotal,
        "costo_envio": envio,
        "total": total,
        "days_ago": days_ago
    })

    payments.append({
        "id": oid,
        "pedido_id": oid,
        "metodo": random.choice(["WOMPI", "STRIPE", "CONTRA_ENTREGA"]),
        "estado": "APROBADO" if estado in ["ENTREGADO", "PAGADO", "ENVIADO"] else "PENDIENTE",
        "monto": total,
        "days_ago": days_ago
    })

print(f"Generated:")
print(f"  Buyers: {len(buyers)}")
print(f"  Sellers: {len(sellers)}")
print(f"  Stores: {len(stores)}")
print(f"  Products: {len(products)}")
print(f"  Images: {len(images)}")
print(f"  Variants: {len(variants)}")
print(f"  Orders: {len(orders)}")
print(f"  Order Items: {len(order_items)}")
print(f"  Payments: {len(payments)}")

# NOW WRITE SQL SCRIPT: supabase_seed_feria_1000.sql
NL = chr(10)
SEP = "," + NL

with open(r"c:\Users\gjgh2\Downloads\mercatto\supabase_seed_feria_1000.sql", "w", encoding="utf-8") as f:
    f.write("-- ============================================================================" + NL)
    f.write("-- MERCATTO MARKETPLACE - SEEDING OFICIAL PARA FERIA COMERCIAL CARTAGENA 2026" + NL)
    f.write("-- Base de Datos: PostgreSQL 14+ / Supabase" + NL)
    f.write("-- Total Registros: ~1000 con Integridad Referencial Estricta" + NL)
    f.write("-- Tag de Aislamiento: google_id = 'MOCK_DATA_2026' / email = '%@mock.mercatto.co'" + NL)
    f.write("-- ============================================================================" + NL + NL)
    f.write("BEGIN;" + NL + NL)

    # 0. ASEGURAR COLUMNAS DE COMPATIBILIDAD
    f.write("-- 0. ASEGURAR COLUMNAS DE COMPATIBILIDAD" + NL)
    f.write("ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS tokens_chat INT DEFAULT 5;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT false;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS principal BOOLEAN DEFAULT false;" + NL)
    f.write("ALTER TABLE IF EXISTS producto_variantes ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;" + NL)
    f.write("ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP;" + NL)
    f.write("ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP;" + NL + NL)

    # 1. USUARIOS COMPRADORES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 1. USUARIOS COMPRADORES (120 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)" + NL + "VALUES" + NL)
    b_rows = []
    for b in buyers:
        nom_esc = b['nombre'].replace("'", "''")
        b_rows.append(f"({b['id']}, '{nom_esc}', '{b['email']}', '{BCRYPT_HASH}', 'COMPRADOR', TRUE, TRUE, '{b['telefono']}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{b['days_ago']} days')")
    f.write(SEP.join(b_rows) + ";" + NL + NL)

    # 2. DIRECCIONES COMPRADORES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 2. DIRECCIONES COMPRADORES (120 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO direcciones (id, usuario_id, nombre_completo, telefono, direccion, barrio, ciudad, departamento, codigo_postal, notas_entrega, es_principal)" + NL + "VALUES" + NL)
    d_rows = []
    for b in buyers:
        nom_esc = b['nombre'].replace("'", "''")
        d_rows.append(f"({b['id']}, {b['id']}, '{nom_esc}', '{b['telefono']}', '{b['direccion']}', '{b['barrio']}', 'Cartagena de Indias', 'Bolívar', '130001', 'Entregar en portería / recepción', TRUE)")
    f.write(SEP.join(d_rows) + ";" + NL + NL)

    # 3. USUARIOS VENDEDORES
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 3. USUARIOS VENDEDORES (40 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)" + NL + "VALUES" + NL)
    s_rows = []
    for s in sellers:
        nom_esc = s['nombre'].replace("'", "''")
        s_rows.append(f"({s['id']}, '{nom_esc}', '{s['email']}', '{BCRYPT_HASH}', 'VENDEDOR', TRUE, TRUE, '{s['telefono']}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{s['days_ago']} days')")
    f.write(SEP.join(s_rows) + ";" + NL + NL)

    # 4. TIENDAS VIRTUALES (40 Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 4. TIENDAS VIRTUALES / VENDEDORES (40 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("INSERT INTO vendedores (id, usuario_id, tipo, nombre_tienda, descripcion, logo_url, estado, nit_cedula, razon_social, ciudad, direccion, cuenta_bancaria, banco, calificacion, total_ventas, tipo_suscripcion, fecha_registro)" + NL + "VALUES" + NL)
    st_rows = []
    for st in stores:
        t_esc = st['nombre_tienda'].replace("'", "''")
        d_esc = st['descripcion'].replace("'", "''")
        st_rows.append(f"({st['id']}, {st['usuario_id']}, 'EMPRESA', '{t_esc}', '{d_esc}', '{st['logo_url']}', 'APROBADO', '{st['nit_cedula']}', '{t_esc} S.A.S.', 'Cartagena de Indias', '{st['direccion']}', '{st['cuenta_bancaria']}', '{st['banco']}', {st['calificacion']}, {st['total_ventas']}, '{st['tipo_suscripcion']}', NOW() - INTERVAL '{st['days_ago']} days')")
    f.write(SEP.join(st_rows) + ";" + NL + NL)

    # 5. PRODUCTOS (540 Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 5. PRODUCTOS CON FOTOGRAFÍA ESTUDIO FONDO BLANCO PURO #FFFFFF (540 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(products), 50):
        chunk = products[i:i+50]
        f.write("INSERT INTO productos (id, vendedor_id, categoria_id, titulo, slug, descripcion, precio, precio_oferta, stock, sku, marca, estado, activo, destacado, calificacion, total_resenas, total_ventas, fecha_creacion, fecha_actualizacion)" + NL + "VALUES" + NL)
        p_rows = []
        for p in chunk:
            t_esc = p['titulo'].replace("'", "''")
            d_esc = p['descripcion'].replace("'", "''")
            off_val = f"{p['precio_oferta']}" if p['precio_oferta'] else "NULL"
            dest_val = "TRUE" if p['id'] % 5 == 0 else "FALSE"
            p_rows.append(f"({p['id']}, {p['vendedor_id']}, {p['categoria_id']}, '{t_esc}', '{p['slug']}', '{d_esc}', {p['precio']}, {off_val}, {p['stock']}, '{p['sku']}', '{p['marca']}', 'NUEVO', TRUE, {dest_val}, {p['calificacion']}, {p['total_resenas']}, {p['total_ventas']}, NOW() - INTERVAL '{p['days_ago']} days', NOW() - INTERVAL '{p['days_ago']} days')")
        f.write(SEP.join(p_rows) + ";" + NL + NL)

    # 6. PRODUCTO IMAGENES (540 Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 6. PRODUCTO IMAGENES (540 Registros - Catálogo Centrado Fondo Blanco Puro)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(images), 50):
        chunk = images[i:i+50]
        f.write("INSERT INTO producto_imagenes (id, producto_id, url, principal, es_principal, orden_visual)" + NL + "VALUES" + NL)
        im_rows = []
        for im in chunk:
            im_rows.append(f"({im['id']}, {im['producto_id']}, '{im['url']}', TRUE, TRUE, 0)")
        f.write(SEP.join(im_rows) + ";" + NL + NL)

    # 7. PRODUCTO VARIANTES (953 Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 7. PRODUCTO VARIANTES (Tallas / Colores - 953 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(variants), 50):
        chunk = variants[i:i+50]
        f.write("INSERT INTO producto_variantes (id, producto_id, sku, nombre, precio, precio_oferta, stock, imagen_url, activo)" + NL + "VALUES" + NL)
        va_rows = []
        for va in chunk:
            n_esc = va['nombre'].replace("'", "''")
            off_val = f"{va['precio_oferta']}" if va['precio_oferta'] else "NULL"
            va_rows.append(f"({va['id']}, {va['producto_id']}, '{va['sku']}', '{n_esc}', {va['precio']}, {off_val}, {va['stock']}, '{va['imagen_url']}', TRUE)")
        f.write(SEP.join(va_rows) + ";" + NL + NL)

    # 8. VARIANTE ATRIBUTOS (953 Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 8. VARIANTE ATRIBUTOS (953 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(var_attrs), 50):
        chunk = var_attrs[i:i+50]
        f.write("INSERT INTO variante_atributos (id, variante_id, nombre, valor)" + NL + "VALUES" + NL)
        at_rows = []
        for at in chunk:
            n_esc = at['nombre'].replace("'", "''")
            v_esc = at['valor'].replace("'", "''")
            at_rows.append(f"({at['id']}, {at['variante_id']}, '{n_esc}', '{v_esc}')")
        f.write(SEP.join(at_rows) + ";" + NL + NL)

    # 9. PEDIDOS (300 Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 9. PEDIDOS HISTÓRICOS Y ACTIVOS (300 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(orders), 50):
        chunk = orders[i:i+50]
        f.write("INSERT INTO pedidos (id, codigo, comprador_id, direccion_id, estado, subtotal, descuento, costo_envio, total, notas, fecha_creacion, fecha_actualizacion)" + NL + "VALUES" + NL)
        o_rows = []
        for o in chunk:
            o_rows.append(f"({o['id']}, '{o['codigo']}', {o['comprador_id']}, {o['comprador_id']}, '{o['estado']}', {o['subtotal']}, 0.0, {o['costo_envio']}, {o['total']}, 'MOCK_FERIA_CARTAGENA', NOW() - INTERVAL '{o['days_ago']} days', NOW() - INTERVAL '{o['days_ago']} days')")
        f.write(SEP.join(o_rows) + ";" + NL + NL)

    # 10. PEDIDO ITEMS (400+ Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 10. PEDIDO ITEMS" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(order_items), 50):
        chunk = order_items[i:i+50]
        f.write("INSERT INTO pedido_items (id, pedido_id, producto_id, vendedor_id, nombre_producto, precio_unitario, cantidad, subtotal)" + NL + "VALUES" + NL)
        oi_rows = []
        for oi in chunk:
            nom_esc = oi['nombre_producto'].replace("'", "''")
            oi_rows.append(f"({oi['id']}, {oi['pedido_id']}, {oi['producto_id']}, {oi['vendedor_id']}, '{nom_esc}', {oi['precio_unitario']}, {oi['cantidad']}, {oi['subtotal']})")
        f.write(SEP.join(oi_rows) + ";" + NL + NL)

    # 11. PAGOS (300 Registros)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 11. PAGOS RELACIONADOS (300 Registros)" + NL)
    f.write("-- ----------------------------------------------------------------------------" + NL)
    for i in range(0, len(payments), 50):
        chunk = payments[i:i+50]
        f.write("INSERT INTO pagos (id, pedido_id, metodo, estado, monto, moneda, fecha_pago, fecha_confirmacion, fecha_creacion)" + NL + "VALUES" + NL)
        pay_rows = []
        for pay in chunk:
            pay_rows.append(f"({pay['id']}, {pay['pedido_id']}, '{pay['metodo']}', '{pay['estado']}', {pay['monto']}, 'COP', NOW() - INTERVAL '{pay['days_ago']} days', NOW() - INTERVAL '{pay['days_ago']} days', NOW() - INTERVAL '{pay['days_ago']} days')")
        f.write(SEP.join(pay_rows) + ";" + NL + NL)

    # 12. AJUSTE DE SECUENCIAS
    f.write("-- ----------------------------------------------------------------------------" + NL)
    f.write("-- 12. REAJUSTE DE SECUENCIAS POSTGRESQL (Auto-Increment)" + NL)
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

# NOW WRITE PURGE SCRIPT: supabase_purge_mock_data.sql
with open(r"c:\Users\gjgh2\Downloads\mercatto\supabase_purge_mock_data.sql", "w", encoding="utf-8") as f:
    f.write("-- ============================================================================" + NL)
    f.write("-- PURGA SEGURA DE DATOS MOCK DE LA FERIA - MERCATTO" + NL)
    f.write("-- Borra ÚNICAMENTE los registros generados con tag MOCK_DATA_2026" + NL)
    f.write("-- TUS TIENDAS Y PRODUCTOS MANUALES QUEDAN 100% INTACTOS" + NL)
    f.write("-- ============================================================================" + NL + NL)
    f.write("BEGIN;" + NL + NL)
    f.write("-- 1. Eliminar pagos de prueba" + NL)
    f.write("DELETE FROM pagos WHERE pedido_id IN (SELECT id FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%');" + NL + NL)
    f.write("-- 2. Eliminar pedido_items de prueba" + NL)
    f.write("DELETE FROM pedido_items WHERE pedido_id IN (SELECT id FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%');" + NL + NL)
    f.write("-- 3. Eliminar pedidos de prueba" + NL)
    f.write("DELETE FROM pedidos WHERE codigo LIKE 'PED-MOCK-%' OR notas LIKE '%MOCK_FERIA%';" + NL + NL)
    f.write("-- 4. Eliminar productos generados por seed (sus variantes e imágenes caen en cascada)" + NL)
    f.write("DELETE FROM productos WHERE sku LIKE 'SEED-%' OR vendedor_id IN (SELECT v.id FROM vendedores v JOIN usuarios u ON v.usuario_id = u.id WHERE u.google_id = 'MOCK_DATA_2026' OR u.email LIKE '%@mock.mercatto.co');" + NL + NL)
    f.write("-- 5. Eliminar tiendas de prueba" + NL)
    f.write("DELETE FROM vendedores WHERE usuario_id IN (SELECT id FROM usuarios WHERE google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co');" + NL + NL)
    f.write("-- 6. Eliminar direcciones de compradores de prueba" + NL)
    f.write("DELETE FROM direcciones WHERE usuario_id IN (SELECT id FROM usuarios WHERE google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co');" + NL + NL)
    f.write("-- 7. Eliminar usuarios de prueba (compradores y vendedores)" + NL)
    f.write("DELETE FROM usuarios WHERE google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co';" + NL + NL)
    f.write("-- 8. Sincronizar secuencias con los datos reales restantes" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('direcciones', 'id'), COALESCE((SELECT MAX(id) FROM direcciones), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('vendedores', 'id'), COALESCE((SELECT MAX(id) FROM vendedores), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1));" + NL)
    f.write("SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1));" + NL + NL)
    f.write("COMMIT;" + NL)

print("Files generated successfully!")
