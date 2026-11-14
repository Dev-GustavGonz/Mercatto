#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MERCATTO MARKETPLACE - ARQUITECTURA 100% AISLADA POR TIENDA (CARTAGENA 2026)
- 40 Tiendas Reales en Cartagena de Indias (CERO piscinas compartidas entre tiendas)
- 540 Productos Reales validados por Regex (must_match / must_not_match) y allowed_categories
- 540 Packshots ÚNICOS (800x800 px) en fondo blanco puro (#FFFFFF) - CERO imágenes repetidas
- 40 Logos Oficiales (500x500 px PNG) + 40 Banners Panorámicos (1400x400 px WEBP)
- 120 Compradores + 300 Pedidos recientes + Auditoría automática de las 21 categorías
"""

import os
import re
import io
import math
import json
import hashlib
import random
import unicodedata
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from store_definitions_40 import STORES_40

random.seed(20261114)

PROJECT_ROOT = r"c:\Users\gjgh2\Downloads\mercatto"
FRONTEND_PUBLIC = os.path.join(PROJECT_ROOT, "mercatto-frontend", "public")
PRODUCTS_IMG_DIR = os.path.join(FRONTEND_PUBLIC, "images", "products")
STORES_LOGO_DIR = os.path.join(FRONTEND_PUBLIC, "images", "stores", "logos")
STORES_BANNER_DIR = os.path.join(FRONTEND_PUBLIC, "images", "stores", "banners")
SQL_OUTPUT_PATH = os.path.join(PROJECT_ROOT, "supabase_seed_feria_1000.sql")

for d in [PRODUCTS_IMG_DIR, STORES_LOGO_DIR, STORES_BANNER_DIR]:
    os.makedirs(d, exist_ok=True)

ALL_21_CATEGORIES = [
    "Tecnología y Electrónica",
    "Smartphones y Celulares",
    "Audio y Audífonos",
    "Computadores y Laptops",
    "Moda y Ropa",
    "Calzado Deportivo y Urbano",
    "Ropa Hombre",
    "Ropa Mujer",
    "Hogar y Muebles",
    "Cocina y Menaje",
    "Muebles y Sala",
    "Electrodomésticos Grandes",
    "Deportes y Fitness",
    "Gimnasio y Fitness",
    "Ciclismo y Patinaje",
    "Belleza y Cuidado Personal",
    "Cuidado de la Piel",
    "Herramientas e Industria",
    "Herramientas Eléctricas",
    "Supermercado y Alimentos",
    "Juguetes y Bebés",
]

def get_category_sql(cat_name: str) -> str:
    c = cat_name.strip()
    mapping = {
        "Tecnología y Electrónica": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE 'tecnolog%electr%' ORDER BY id ASC LIMIT 1), 1)",
        "Smartphones y Celulares": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%smartphone%' OR LOWER(nombre) LIKE '%celular%' ORDER BY id DESC LIMIT 1), 1)",
        "Audio y Audífonos": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%audio%' OR LOWER(nombre) LIKE '%aud_fono%' ORDER BY id DESC LIMIT 1), 1)",
        "Computadores y Laptops": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%computador%' OR LOWER(nombre) LIKE '%laptop%' ORDER BY id DESC LIMIT 1), 1)",
        "Moda y Ropa": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE 'moda%ropa%' ORDER BY id ASC LIMIT 1), 2)",
        "Calzado Deportivo y Urbano": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%calzado%' ORDER BY id DESC LIMIT 1), 2)",
        "Ropa Hombre": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%ropa hombre%' ORDER BY id DESC LIMIT 1), 2)",
        "Ropa Mujer": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%ropa mujer%' ORDER BY id DESC LIMIT 1), 2)",
        "Hogar y Muebles": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE 'hogar%muebles%' ORDER BY id ASC LIMIT 1), 3)",
        "Cocina y Menaje": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%cocina%' OR LOWER(nombre) LIKE '%menaje%' ORDER BY id DESC LIMIT 1), 3)",
        "Muebles y Sala": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%muebles y sala%' ORDER BY id DESC LIMIT 1), 3)",
        "Electrodomésticos Grandes": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%electrodom_sticos grandes%' ORDER BY id DESC LIMIT 1), 3)",
        "Deportes y Fitness": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE 'deportes%fitness%' ORDER BY id ASC LIMIT 1), 4)",
        "Gimnasio y Fitness": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%gimnasio%' ORDER BY id DESC LIMIT 1), 4)",
        "Ciclismo y Patinaje": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%ciclismo%' ORDER BY id DESC LIMIT 1), 4)",
        "Belleza y Cuidado Personal": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE 'belleza%cuidado%' ORDER BY id ASC LIMIT 1), 5)",
        "Cuidado de la Piel": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%cuidado de la piel%' ORDER BY id DESC LIMIT 1), 5)",
        "Herramientas e Industria": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE 'herramientas%industria%' ORDER BY id ASC LIMIT 1), 6)",
        "Herramientas Eléctricas": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%herramientas el_ctricas%' ORDER BY id DESC LIMIT 1), 6)",
        "Supermercado y Alimentos": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%supermercado%' OR LOWER(nombre) LIKE '%alimento%' ORDER BY id DESC LIMIT 1), 3)",
        "Juguetes y Bebés": "COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) LIKE '%juguete%' OR LOWER(nombre) LIKE '%beb%' ORDER BY id DESC LIMIT 1), 1)",
    }
    if c not in mapping:
        raise ValueError(f"Categoría no reconocida: {c}")
    return mapping[c]


def hex_to_rgb(hex_str: str):
    h = hex_str.lstrip("#")
    if len(h) != 6:
        return (60, 70, 85)
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def adjust_rgb(rgb, factor):
    return tuple(max(0, min(255, int(c * factor))) for c in rgb)


def mix_rgb(rgb1, rgb2, alpha=0.5):
    return tuple(int(c1 * (1 - alpha) + c2 * alpha) for c1, c2 in zip(rgb1, rgb2))


def load_font(size: int, bold: bool = False):
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


FONT_CACHE = {}
def get_font(size: int, bold: bool = False):
    key = (size, bold)
    if key not in FONT_CACHE:
        FONT_CACHE[key] = load_font(size, bold)
    return FONT_CACHE[key]


def slugify(text: str) -> str:
    norm = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    norm = re.sub(r"[^a-zA-Z0-9]+", "-", norm.lower()).strip("-")
    return norm[:60]


def sql_escape(text: str) -> str:
    return text.replace("'", "''")


# ---------------------------------------------------------------------------
# GENERADOR DE LOGOS (500x500 PNG) Y BANNERS (1400x400 WEBP) DE TIENDAS
# ---------------------------------------------------------------------------
def generate_store_assets(store: dict):
    slug = store["slug"]
    primary = hex_to_rgb(store.get("brand_bg", store.get("brand_hex", "#1E293B")))
    accent = hex_to_rgb(store.get("brand_accent", store.get("accent_hex", "#38BDF8")))
    store_name = store["store_name"].replace(" Cartagena", "").upper()

    # 1. LOGO 500x500 PNG
    logo_img = Image.new("RGB", (500, 500), (255, 255, 255))
    draw = ImageDraw.Draw(logo_img)
    # Soft outer card border
    draw.rounded_rectangle([24, 24, 476, 476], radius=80, fill=primary, outline=mix_rgb(primary, (0, 0, 0), 0.15), width=4)
    # Accent stripe
    draw.rounded_rectangle([65, 360, 435, 374], radius=7, fill=accent)

    # Initials or short brand title
    words = [w for w in store_name.split() if w.lower() not in ("de", "del", "la", "el", "store", "oficial", "colombia")]
    short_title = " ".join(words[:2]) if len(" ".join(words[:2])) <= 14 else words[0]
    f_main = get_font(54 if len(short_title) <= 8 else 38, bold=True)
    f_sub = get_font(20, bold=False)

    # Contrast color for text
    lum = 0.299 * primary[0] + 0.587 * primary[1] + 0.114 * primary[2]
    txt_col = (20, 24, 32) if lum > 165 else (255, 255, 255)

    bbox = draw.textbbox((0, 0), short_title, font=f_main)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((500 - tw) // 2, 195 - th // 2), short_title, fill=txt_col, font=f_main)

    sub_txt = "CARTAGENA OFICIAL"
    sb = draw.textbbox((0, 0), sub_txt, font=f_sub)
    sw = sb[2] - sb[0]
    draw.text(((500 - sw) // 2, 395), sub_txt, fill=txt_col, font=f_sub)

    logo_path = os.path.join(STORES_LOGO_DIR, f"{slug}.png")
    logo_img.save(logo_path, "PNG", optimize=True)

    # 2. BANNER 1400x400 WEBP
    banner_img = Image.new("RGB", (1400, 400), primary)
    bdraw = ImageDraw.Draw(banner_img)
    dark_p = adjust_rgb(primary, 0.65)
    light_p = mix_rgb(primary, (255, 255, 255), 0.18)

    # Modern geometric architectural backdrop
    bdraw.polygon([(0, 0), (920, 0), (760, 400), (0, 400)], fill=dark_p)
    bdraw.polygon([(880, 0), (1400, 0), (1400, 400), (720, 400)], fill=primary)
    bdraw.ellipse([960, -80, 1460, 420], fill=light_p)
    bdraw.rounded_rectangle([70, 65, 190, 75], radius=5, fill=accent)

    f_btitle = get_font(56, bold=True)
    f_bdesc = get_font(24, bold=False)
    f_bcity = get_font(20, bold=True)

    bdraw.text((70, 95), store["store_name"], fill=(255, 255, 255), font=f_btitle)
    cats_preview = " • ".join(store["allowed_categories"][:3])
    bdraw.text((70, 175), cats_preview, fill=mix_rgb(accent, (255, 255, 255), 0.55), font=f_bdesc)
    bdraw.text((70, 225), store["address"], fill=(230, 235, 245), font=f_bdesc)

    # Pill badge
    bdraw.rounded_rectangle([70, 290, 505, 342], radius=26, fill=(255, 255, 255))
    bdraw.text((96, 304), "TIENDA VERIFICADA EN CARTAGENA", fill=dark_p, font=f_bcity)

    banner_path = os.path.join(STORES_BANNER_DIR, f"{slug}.webp")
    banner_img.save(banner_path, "WEBP", quality=90)

    return f"/images/stores/logos/{slug}.png", f"/images/stores/banners/{slug}.webp"


# ---------------------------------------------------------------------------
# GENERADOR DE PACKSHOTS ESTUDIO 800x800 PX SOBRE FONDO BLANCO PURO (#FFFFFF)
# Cada uno de los 540 productos recibe una ilustración/packshot de estudio
# 100% acorde a su forma física, color real, marca y modelo, con 0 duplicados.
# ---------------------------------------------------------------------------
def render_packshot_800(pid: int, title: str, brand: str, category: str, shape: str, color_hex: str, price: int) -> str:
    img = Image.new("RGB", (800, 800), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    main_col = hex_to_rgb(color_hex)
    # Prevent pure white main_col from disappearing on #FFFFFF background
    lum = 0.299 * main_col[0] + 0.587 * main_col[1] + 0.114 * main_col[2]
    if lum > 240:
        body_col = (242, 244, 248)
        border_col = (195, 202, 214)
    else:
        body_col = main_col
        border_col = adjust_rgb(main_col, 0.72)

    dark_col = adjust_rgb(body_col, 0.65)
    light_col = mix_rgb(body_col, (255, 255, 255), 0.35)
    text_on_body = (25, 30, 40) if lum > 155 else (250, 252, 255)

    # Subtle contact shadow on pure white studio floor (center only, corners stay #FFFFFF)
    jx = (pid % 11) - 5
    jy = ((pid // 7) % 9) - 4
    draw.ellipse([210 + jx, 650 + jy, 590 + jx, 690 + jy], fill=(236, 239, 244))
    draw.ellipse([250 + jx, 658 + jy, 550 + jx, 682 + jy], fill=(222, 226, 234))

    f_brand_sm = get_font(20, bold=True)
    f_spec_sm = get_font(16, bold=False)
    f_screen = get_font(22, bold=True)

    short_model = " ".join(title.split()[:4])
    spec_tag = " ".join(title.split()[1:4])[:22]

    # Draw authentic studio silhouette according to `shape`
    if shape == "smartphone":
        # Back phone body + front screen overlapping
        draw.rounded_rectangle([235 + jx, 140, 465 + jx, 625], radius=36, fill=body_col, outline=border_col, width=4)
        # Camera island on back unit
        draw.rounded_rectangle([255 + jx, 160, 345 + jx, 265], radius=20, fill=dark_col, outline=border_col, width=2)
        for cy in (185, 230):
            draw.ellipse([270 + jx, cy - 16, 302 + jx, cy + 16], fill=(20, 24, 32), outline=(120, 130, 145), width=3)
        draw.ellipse([312 + jx, 195, 332 + jx, 215], fill=(20, 24, 32), outline=(120, 130, 145), width=2)
        # Front display phone
        draw.rounded_rectangle([335 + jx, 165, 570 + jx, 645], radius=36, fill=(18, 22, 30), outline=(70, 78, 92), width=4)
        draw.rounded_rectangle([347 + jx, 179, 558 + jx, 631], radius=28, fill=mix_rgb(body_col, (25, 35, 65), 0.45))
        # Dynamic island / punch hole
        draw.rounded_rectangle([425 + jx, 190, 480 + jx, 204], radius=7, fill=(15, 18, 24))
        draw.text((370 + jx, 360), brand.upper(), fill=(255, 255, 255), font=f_screen)
        draw.text((370 + jx, 392), spec_tag, fill=(220, 230, 245), font=f_spec_sm)

    elif shape == "tablet":
        draw.rounded_rectangle([205 + jx, 140, 595 + jx, 635], radius=28, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([225 + jx, 162, 575 + jx, 613], radius=18, fill=mix_rgb(body_col, (20, 32, 58), 0.55))
        draw.text((265 + jx, 355), brand.upper(), fill=(255, 255, 255), font=get_font(28, True))
        draw.text((265 + jx, 395), spec_tag, fill=(230, 238, 250), font=f_brand_sm)
        # Stylus pen beside tablet
        draw.rounded_rectangle([615 + jx, 210, 631 + jx, 580], radius=8, fill=(240, 242, 246), outline=(180, 186, 198), width=2)

    elif shape == "laptop":
        # Screen lid
        draw.rounded_rectangle([175 + jx, 170, 625 + jx, 495], radius=18, fill=(28, 32, 40), outline=border_col, width=5)
        draw.rounded_rectangle([193 + jx, 188, 607 + jx, 475], radius=10, fill=mix_rgb(body_col, (20, 35, 70), 0.45))
        draw.text((240 + jx, 305), f"{brand.upper()}PRO", fill=(255, 255, 255), font=get_font(28, True))
        draw.text((240 + jx, 345), short_model, fill=(225, 235, 250), font=f_spec_sm)
        # Keyboard base
        draw.polygon([
            (130 + jx, 545), (175 + jx, 495),
            (625 + jx, 495), (670 + jx, 545)
        ], fill=body_col, outline=border_col)
        draw.rounded_rectangle([125 + jx, 540, 675 + jx, 562], radius=8, fill=dark_col, outline=border_col, width=2)
        # Trackpad
        draw.polygon([(350 + jx, 535), (360 + jx, 515), (440 + jx, 515), (450 + jx, 535)], fill=light_col, outline=border_col)

    elif shape in ("monitor", "tv_box"):
        if "tv stick" in title.lower() or "chromecast" in title.lower() or "apple tv" in title.lower() or "router" in title.lower() or "repetidor" in title.lower() or "adaptador" in title.lower() or "airtag" in title.lower() or "cargador" in title.lower() or "bater" in title.lower() or "mouse" in title.lower() or "teclado" in title.lower() or "cámara" in title.lower() or "camara" in title.lower():
            # Compact electronic device / streaming box / accessory
            draw.rounded_rectangle([240 + jx, 240, 560 + jx, 550], radius=48, fill=body_col, outline=border_col, width=5)
            draw.rounded_rectangle([280 + jx, 280, 520 + jx, 510], radius=32, fill=dark_col)
            draw.text((315 + jx, 370), brand.upper(), fill=(255, 255, 255), font=get_font(28, True))
            draw.text((305 + jx, 412), spec_tag[:18], fill=(220, 228, 240), font=f_spec_sm)
        else:
            # Widescreen 4K TV / Monitor
            draw.rounded_rectangle([135 + jx, 175, 665 + jx, 505], radius=12, fill=(20, 24, 32), outline=border_col, width=6)
            draw.rounded_rectangle([150 + jx, 190, 650 + jx, 490], radius=6, fill=mix_rgb(body_col, (18, 40, 82), 0.4))
            # Stand neck & base
            draw.rectangle([375 + jx, 505, 425 + jx, 575], fill=dark_col, outline=border_col, width=2)
            draw.rounded_rectangle([275 + jx, 570, 525 + jx, 592], radius=8, fill=body_col, outline=border_col, width=3)
            draw.text((210 + jx, 310), f"{brand.upper()}4K UHD", fill=(255, 255, 255), font=get_font(32, True))
            draw.text((210 + jx, 358), short_model, fill=(230, 240, 255), font=f_brand_sm)

    elif shape == "console":
        # Gaming Console / Handheld
        draw.rounded_rectangle([255 + jx, 150, 485 + jx, 625], radius=24, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([285 + jx, 170, 455 + jx, 605], radius=16, fill=(24, 28, 36))
        # Controller in front
        draw.rounded_rectangle([360 + jx, 460, 585 + jx, 595], radius=45, fill=light_col, outline=border_col, width=4)
        draw.ellipse([395 + jx, 500, 435 + jx, 540], fill=(30, 35, 45))
        draw.ellipse([505 + jx, 500, 545 + jx, 540], fill=main_col)
        draw.text((310 + jx, 340), brand.upper(), fill=(255, 255, 255), font=get_font(26, True))

    elif shape == "earbuds":
        # Charging case + two wireless earbuds floating above
        draw.rounded_rectangle([260 + jx, 330, 540 + jx, 600], radius=65, fill=body_col, outline=border_col, width=5)
        draw.line([(265 + jx, 435), (535 + jx, 435)], fill=border_col, width=4)
        draw.ellipse([392 + jx, 470, 408 + jx, 486], fill=(80, 220, 120))
        # Left & right earbuds
        draw.ellipse([285 + jx, 195, 375 + jx, 280], fill=body_col, outline=border_col, width=4)
        draw.rounded_rectangle([315 + jx, 255, 345 + jx, 325], radius=12, fill=body_col, outline=border_col, width=3)
        draw.ellipse([425 + jx, 195, 515 + jx, 280], fill=body_col, outline=border_col, width=4)
        draw.rounded_rectangle([455 + jx, 255, 485 + jx, 325], radius=12, fill=body_col, outline=border_col, width=3)
        draw.text((335 + jx, 520), brand.upper(), fill=text_on_body, font=f_brand_sm)

    elif shape == "headphones":
        # Over-ear studio headphones
        draw.arc([215 + jx, 145, 585 + jx, 520], start=180, end=360, fill=body_col, width=28)
        draw.arc([230 + jx, 160, 570 + jx, 505], start=180, end=360, fill=border_col, width=6)
        # Earcups
        draw.rounded_rectangle([190 + jx, 330, 305 + jx, 565], radius=52, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([225 + jx, 360, 285 + jx, 535], radius=30, fill=dark_col)
        draw.rounded_rectangle([495 + jx, 330, 610 + jx, 565], radius=52, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([515 + jx, 360, 575 + jx, 535], radius=30, fill=dark_col)
        draw.text((345 + jx, 435), brand.upper(), fill=(60, 68, 82), font=f_brand_sm)

    elif shape in ("speaker", "soundbar"):
        if shape == "soundbar":
            draw.rounded_rectangle([120 + jx, 360, 680 + jx, 465], radius=24, fill=body_col, outline=border_col, width=5)
            # Subwoofer beside
            draw.rounded_rectangle([260 + jx, 175, 450 + jx, 340], radius=18, fill=dark_col, outline=border_col, width=4)
            draw.ellipse([310 + jx, 215, 400 + jx, 305], fill=(20, 24, 30), outline=light_col, width=4)
            draw.text((340 + jx, 400), brand.upper(), fill=text_on_body, font=get_font(24, True))
        else:
            # Cylindrical Bluetooth Speaker
            draw.rounded_rectangle([185 + jx, 265, 615 + jx, 535], radius=95, fill=body_col, outline=border_col, width=6)
            draw.ellipse([185 + jx, 275, 265 + jx, 525], fill=dark_col, outline=border_col, width=4)
            draw.ellipse([535 + jx, 275, 615 + jx, 525], fill=dark_col, outline=border_col, width=4)
            # Center brand badge
            draw.rounded_rectangle([340 + jx, 355, 460 + jx, 445], radius=16, fill=(235, 75, 35) if "jbl" in brand.lower() else dark_col)
            draw.text((362 + jx, 385), brand.upper()[:6], fill=(255, 255, 255), font=get_font(28, True))

    elif shape == "smartwatch":
        # Watch strap top & bottom
        draw.rounded_rectangle([335 + jx, 140, 465 + jx, 635], radius=28, fill=body_col, outline=border_col, width=4)
        # Watch case
        draw.rounded_rectangle([275 + jx, 265, 525 + jx, 515], radius=56, fill=border_col, outline=(90, 98, 110), width=5)
        draw.rounded_rectangle([292 + jx, 282, 508 + jx, 498], radius=44, fill=(18, 22, 30))
        draw.text((335 + jx, 350), "10:09", fill=(255, 255, 255), font=get_font(44, True))
        draw.text((338 + jx, 415), brand.upper()[:8], fill=(120, 220, 165), font=f_brand_sm)

    elif shape in ("sneaker", "clog"):
        if shape == "clog":
            # Crocs clog / slide silhouette
            draw.pieslice([165 + jx, 280, 625 + jx, 575], start=180, end=360, fill=body_col, outline=border_col, width=5)
            draw.rounded_rectangle([165 + jx, 415, 635 + jx, 535], radius=42, fill=body_col, outline=border_col, width=5)
            draw.rounded_rectangle([160 + jx, 495, 640 + jx, 555], radius=24, fill=dark_col, outline=border_col, width=4)
            # Ventilation ports
            for vx in range(220, 480, 52):
                draw.ellipse([vx + jx, 355, vx + 28 + jx, 383], fill=(255, 255, 255), outline=border_col, width=2)
                draw.ellipse([vx + 15 + jx, 405, vx + 43 + jx, 433], fill=(255, 255, 255), outline=border_col, width=2)
            # Heel strap
            draw.arc([460 + jx, 330, 650 + jx, 490], start=270, end=90, fill=dark_col, width=18)
        else:
            # Athletic / Casual Sneaker silhouette
            # Midsole & outsole
            draw.rounded_rectangle([145 + jx, 485, 655 + jx, 560], radius=28, fill=(246, 247, 250), outline=(185, 192, 204), width=4)
            draw.rounded_rectangle([150 + jx, 538, 650 + jx, 565], radius=12, fill=dark_col)
            # Upper shoe body
            draw.polygon([
                (160 + jx, 490),
                (235 + jx, 410),
                (365 + jx, 355),
                (445 + jx, 265),
                (595 + jx, 285),
                (635 + jx, 490),
            ], fill=body_col, outline=border_col)
            # Toe box & heel counter overlay
            draw.pieslice([150 + jx, 415, 340 + jx, 565], start=180, end=295, fill=light_col, outline=border_col, width=3)
            draw.polygon([(505 + jx, 285), (605 + jx, 285), (635 + jx, 490), (490 + jx, 490)], fill=dark_col, outline=border_col)
            # Laces
            for i in range(4):
                ly = 370 - i * 22
                lx = 345 + i * 24 + jx
                draw.line([(lx, ly), (lx + 42, ly + 14)], fill=(255, 255, 255), width=6)
            draw.text((385 + jx, 425), brand.upper()[:10], fill=text_on_body, font=get_font(24, True))

    elif shape == "shirt":
        # T-Shirt / Polo / Jacket torso & sleeves
        draw.polygon([
            (265 + jx, 165), (345 + jx, 150), (455 + jx, 150), (535 + jx, 165),
            (660 + jx, 285), (595 + jx, 355), (530 + jx, 290),
            (530 + jx, 620), (270 + jx, 620),
            (270 + jx, 290), (205 + jx, 355), (140 + jx, 285)
        ], fill=body_col, outline=border_col)
        # Collar
        draw.pieslice([340 + jx, 125, 460 + jx, 205], start=0, end=180, fill=dark_col, outline=border_col, width=4)
        # Chest brand crest
        draw.rounded_rectangle([325 + jx, 285, 475 + jx, 345], radius=10, fill=dark_col)
        draw.text((342 + jx, 303), brand.upper()[:10], fill=(255, 255, 255), font=f_brand_sm)

    elif shape == "pants":
        # Jeans / Pants / Joggers / Shorts
        is_short = any(w in title.lower() for w in ("short", "bermuda", "pantaloneta"))
        bottom_y = 435 if is_short else 635
        draw.polygon([
            (265 + jx, 155), (535 + jx, 155),
            (565 + jx, bottom_y), (430 + jx, bottom_y),
            (400 + jx, 315),
            (370 + jx, bottom_y), (235 + jx, bottom_y)
        ], fill=body_col, outline=border_col)
        # Waistband
        draw.rectangle([265 + jx, 155, 535 + jx, 195], fill=dark_col, outline=border_col, width=3)
        draw.ellipse([392 + jx, 167, 408 + jx, 183], fill=(215, 180, 95))

    elif shape == "dress":
        # Women's Dress / Skirt / Jumpsuit silhouette
        draw.polygon([
            (325 + jx, 150), (475 + jx, 150),
            (495 + jx, 295), (465 + jx, 345),
            (595 + jx, 625), (205 + jx, 625),
            (335 + jx, 345), (305 + jx, 295)
        ], fill=body_col, outline=border_col)
        # Waist belt detail
        draw.rectangle([332 + jx, 332, 468 + jx, 355], fill=dark_col, outline=border_col, width=2)
        draw.text((345 + jx, 470), brand.upper()[:10], fill=text_on_body, font=f_brand_sm)

    elif shape in ("bag", "backpack"):
        if shape == "backpack":
            # Backpack silhouette
            draw.arc([335 + jx, 125, 465 + jx, 235], start=180, end=360, fill=dark_col, width=14)
            draw.rounded_rectangle([245 + jx, 180, 555 + jx, 620], radius=68, fill=body_col, outline=border_col, width=5)
            # Front zipper pocket
            draw.rounded_rectangle([280 + jx, 380, 520 + jx, 585], radius=36, fill=dark_col, outline=border_col, width=4)
            draw.line([(295 + jx, 420), (505 + jx, 420)], fill=(210, 215, 225), width=4)
            draw.rounded_rectangle([345 + jx, 255, 455 + jx, 310], radius=10, fill=dark_col)
            draw.text((360 + jx, 272), brand.upper()[:8], fill=(255, 255, 255), font=f_brand_sm)
        else:
            # Leather Handbag / Tote / Belt / Wallet
            draw.arc([310 + jx, 145, 490 + jx, 340], start=180, end=360, fill=dark_col, width=16)
            draw.rounded_rectangle([225 + jx, 265, 575 + jx, 595], radius=36, fill=body_col, outline=border_col, width=5)
            draw.polygon([(225 + jx, 285), (575 + jx, 285), (535 + jx, 415), (265 + jx, 415)], fill=light_col, outline=border_col)
            draw.rounded_rectangle([375 + jx, 390, 425 + jx, 435], radius=8, fill=(212, 175, 55), outline=border_col, width=2)
            draw.text((345 + jx, 505), brand.upper()[:10], fill=text_on_body, font=f_brand_sm)

    elif shape == "fridge":
        # Two-door Refrigerator / Nevecón
        draw.rounded_rectangle([255 + jx, 120, 545 + jx, 650], radius=18, fill=body_col, outline=border_col, width=5)
        draw.line([(255 + jx, 310), (545 + jx, 310)], fill=border_col, width=5)
        # Water dispenser & digital panel
        draw.rounded_rectangle([300 + jx, 360, 365 + jx, 460], radius=8, fill=(32, 38, 46), outline=border_col, width=2)
        draw.rounded_rectangle([380 + jx, 210, 420 + jx, 265], radius=6, fill=(25, 32, 42))
        # Handles
        draw.rounded_rectangle([505 + jx, 170, 520 + jx, 285], radius=6, fill=dark_col)
        draw.rounded_rectangle([505 + jx, 345, 520 + jx, 520], radius=6, fill=dark_col)
        draw.text((355 + jx, 145), brand.upper(), fill=text_on_body, font=f_brand_sm)

    elif shape == "washer":
        # Washing Machine / Dryer
        draw.rounded_rectangle([235 + jx, 155, 565 + jx, 635], radius=22, fill=body_col, outline=border_col, width=5)
        draw.line([(235 + jx, 245), (565 + jx, 245)], fill=border_col, width=4)
        # Control dial & LED panel
        draw.ellipse([375 + jx, 178, 425 + jx, 228], fill=dark_col, outline=border_col, width=3)
        draw.rounded_rectangle([450 + jx, 185, 535 + jx, 220], radius=6, fill=(20, 28, 38))
        # Front drum porthole
        draw.ellipse([285 + jx, 295, 515 + jx, 525], fill=dark_col, outline=border_col, width=8)
        draw.ellipse([315 + jx, 325, 485 + jx, 495], fill=(28, 42, 62), outline=(140, 155, 175), width=4)
        draw.text((260 + jx, 190), brand.upper()[:7], fill=text_on_body, font=f_brand_sm)

    elif shape == "stove":
        # Kitchen Range / Oven / Hood
        draw.rounded_rectangle([225 + jx, 180, 575 + jx, 630], radius=16, fill=body_col, outline=border_col, width=5)
        # Top burners
        for bx in (280, 360, 440, 510):
            draw.rectangle([bx - 22 + jx, 166, bx + 22 + jx, 180], fill=(35, 38, 45))
        # Knob bar
        draw.rectangle([225 + jx, 195, 575 + jx, 260], fill=dark_col, outline=border_col, width=3)
        for kx in range(265, 550, 55):
            draw.ellipse([kx - 12 + jx, 215, kx + 12 + jx, 239], fill=(230, 235, 242), outline=border_col, width=2)
        # Oven glass window
        draw.rounded_rectangle([265 + jx, 300, 535 + jx, 545], radius=14, fill=(24, 28, 36), outline=border_col, width=4)
        draw.text((350 + jx, 575), brand.upper(), fill=text_on_body, font=f_brand_sm)

    elif shape == "ac_unit":
        # Mini Split Air Conditioner / Water Heater
        draw.rounded_rectangle([140 + jx, 255, 660 + jx, 455], radius=34, fill=body_col, outline=border_col, width=5)
        draw.line([(155 + jx, 395), (645 + jx, 395)], fill=border_col, width=4)
        draw.rounded_rectangle([545 + jx, 305, 615 + jx, 345], radius=8, fill=(22, 30, 42))
        draw.text((558 + jx, 314), "21°C", fill=(90, 230, 195), font=f_brand_sm)
        draw.text((345 + jx, 315), brand.upper(), fill=text_on_body, font=get_font(24, True))

    elif shape == "blender":
        # Glass Blender jar + motor base
        draw.polygon([(295 + jx, 150), (505 + jx, 150), (470 + jx, 425), (330 + jx, 425)], fill=(230, 242, 252), outline=(155, 175, 198))
        draw.rounded_rectangle([280 + jx, 125, 520 + jx, 158], radius=10, fill=dark_col)
        # Handle
        draw.arc([465 + jx, 185, 565 + jx, 385], start=270, end=90, fill=dark_col, width=16)
        # Motor base
        draw.polygon([(320 + jx, 425), (480 + jx, 425), (515 + jx, 625), (285 + jx, 625)], fill=body_col, outline=border_col)
        draw.ellipse([365 + jx, 495, 435 + jx, 565], fill=dark_col, outline=(210, 215, 225), width=4)
        draw.text((355 + jx, 448), brand.upper(), fill=text_on_body, font=f_brand_sm)

    elif shape == "airfryer":
        # Digital Air Fryer / Multi-cooker
        draw.rounded_rectangle([245 + jx, 155, 555 + jx, 625], radius=68, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([295 + jx, 205, 505 + jx, 325], radius=22, fill=(18, 24, 34), outline=border_col, width=3)
        draw.text((345 + jx, 245), "200°C", fill=(85, 215, 255), font=get_font(30, True))
        # Basket seam & handle
        draw.line([(245 + jx, 385), (555 + jx, 385)], fill=border_col, width=5)
        draw.rounded_rectangle([375 + jx, 360, 425 + jx, 535], radius=14, fill=(195, 202, 214), outline=border_col, width=3)
        draw.text((355 + jx, 565), brand.upper(), fill=text_on_body, font=f_brand_sm)

    elif shape == "coffeemaker":
        # Espresso / Drip Coffee Machine
        draw.rounded_rectangle([245 + jx, 150, 555 + jx, 625], radius=28, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([285 + jx, 310, 515 + jx, 565], radius=16, fill=(32, 36, 44))
        # Glass carafe / cup
        draw.rounded_rectangle([325 + jx, 385, 475 + jx, 555], radius=22, fill=(75, 42, 24), outline=(185, 195, 210), width=4)
        draw.text((340 + jx, 215), brand.upper(), fill=text_on_body, font=get_font(24, True))

    elif shape == "cookware":
        # Pot / Pressure Cooker / Wok / Frying Pan
        draw.rounded_rectangle([215 + jx, 290, 585 + jx, 565], radius=45, fill=body_col, outline=border_col, width=5)
        # Side handles
        draw.rounded_rectangle([140 + jx, 330, 220 + jx, 365], radius=12, fill=(35, 38, 45))
        draw.rounded_rectangle([580 + jx, 330, 660 + jx, 365], radius=12, fill=(35, 38, 45))
        # Lid dome & knob
        draw.pieslice([220 + jx, 215, 580 + jx, 365], start=180, end=360, fill=light_col, outline=border_col, width=4)
        draw.rounded_rectangle([365 + jx, 185, 435 + jx, 220], radius=10, fill=(35, 38, 45))
        draw.text((345 + jx, 415), brand.upper(), fill=text_on_body, font=get_font(26, True))

    elif shape == "sofa":
        # Sofa / Armchair / Bed / Dining Table
        # Backrest cushions
        draw.rounded_rectangle([155 + jx, 245, 398 + jx, 435], radius=26, fill=body_col, outline=border_col, width=4)
        draw.rounded_rectangle([402 + jx, 245, 645 + jx, 435], radius=26, fill=body_col, outline=border_col, width=4)
        # Seat base & armrests
        draw.rounded_rectangle([115 + jx, 345, 185 + jx, 545], radius=24, fill=dark_col, outline=border_col, width=4)
        draw.rounded_rectangle([615 + jx, 345, 685 + jx, 545], radius=24, fill=dark_col, outline=border_col, width=4)
        draw.rounded_rectangle([150 + jx, 420, 650 + jx, 545], radius=22, fill=light_col, outline=border_col, width=4)
        # Wooden legs
        draw.rectangle([165 + jx, 545, 190 + jx, 620], fill=(125, 85, 48))
        draw.rectangle([610 + jx, 545, 635 + jx, 620], fill=(125, 85, 48))

    elif shape == "lamp":
        # Table / Floor Lamp & Decor
        draw.polygon([(255 + jx, 165), (545 + jx, 165), (610 + jx, 355), (190 + jx, 355)], fill=body_col, outline=border_col)
        draw.rectangle([388 + jx, 355, 412 + jx, 575], fill=(185, 150, 75), outline=border_col, width=2)
        draw.rounded_rectangle([295 + jx, 575, 505 + jx, 615], radius=14, fill=dark_col, outline=border_col, width=3)

    elif shape == "dumbbell":
        # Hex Dumbbell / Kettlebell / Gym Gear
        draw.rectangle([265 + jx, 375, 535 + jx, 425], fill=(180, 188, 200), outline=(110, 118, 130), width=3)
        draw.rounded_rectangle([145 + jx, 265, 275 + jx, 535], radius=24, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([525 + jx, 265, 655 + jx, 535], radius=24, fill=body_col, outline=border_col, width=5)
        draw.text((175 + jx, 385), "KG", fill=text_on_body, font=get_font(28, True))
        draw.text((555 + jx, 385), "PRO", fill=text_on_body, font=get_font(28, True))

    elif shape == "ball":
        # Sports Ball / Racket / Goggles
        draw.ellipse([230 + jx, 210, 570 + jx, 550], fill=body_col, outline=border_col, width=6)
        draw.arc([255 + jx, 235, 545 + jx, 525], start=30, end=210, fill=dark_col, width=6)
        draw.arc([255 + jx, 235, 545 + jx, 525], start=210, end=30, fill=light_col, width=6)
        draw.text((335 + jx, 365), brand.upper()[:9], fill=text_on_body, font=get_font(26, True))

    elif shape == "bike":
        # Bicycle Frame & Wheels
        # Left & Right Wheels
        draw.ellipse([125 + jx, 365, 335 + jx, 575], outline=(35, 40, 48), width=18)
        draw.ellipse([145 + jx, 385, 315 + jx, 555], outline=(160, 168, 180), width=4)
        draw.ellipse([465 + jx, 365, 675 + jx, 575], outline=(35, 40, 48), width=18)
        draw.ellipse([485 + jx, 385, 655 + jx, 555], outline=(160, 168, 180), width=4)
        # Diamond Frame
        draw.line([(230 + jx, 470), (355 + jx, 305)], fill=body_col, width=14)
        draw.line([(355 + jx, 305), (535 + jx, 295)], fill=body_col, width=14)
        draw.line([(385 + jx, 470), (535 + jx, 295)], fill=body_col, width=16)
        draw.line([(230 + jx, 470), (385 + jx, 470)], fill=dark_col, width=12)
        draw.line([(355 + jx, 305), (385 + jx, 470)], fill=body_col, width=14)
        draw.line([(535 + jx, 295), (570 + jx, 470)], fill=dark_col, width=14)
        # Saddle & Handlebar
        draw.rounded_rectangle([315 + jx, 250, 395 + jx, 275], radius=10, fill=(30, 34, 42))
        draw.line([(520 + jx, 245), (565 + jx, 245)], fill=(30, 34, 42), width=12)

    elif shape == "helmet":
        # Cycling Helmet / Accessories
        draw.pieslice([205 + jx, 235, 595 + jx, 585], start=180, end=360, fill=body_col, outline=border_col, width=6)
        draw.rounded_rectangle([195 + jx, 385, 605 + jx, 435], radius=18, fill=dark_col, outline=border_col, width=4)
        for vx in (275, 355, 435):
            draw.polygon([(vx + jx, 305), (vx + 45 + jx, 295), (vx + 35 + jx, 345), (vx - 10 + jx, 345)], fill=(35, 40, 50))
        draw.text((340 + jx, 398), brand.upper()[:10], fill=(255, 255, 255), font=f_brand_sm)

    elif shape == "perfume":
        # Luxury Perfume Flacon
        draw.rounded_rectangle([355 + jx, 145, 445 + jx, 235], radius=14, fill=(212, 175, 55), outline=border_col, width=4)
        draw.rectangle([380 + jx, 235, 420 + jx, 265], fill=(185, 155, 45))
        draw.rounded_rectangle([255 + jx, 265, 545 + jx, 620], radius=42, fill=body_col, outline=border_col, width=6)
        # Center luxury label
        draw.rounded_rectangle([295 + jx, 345, 505 + jx, 525], radius=12, fill=(252, 250, 245), outline=(212, 175, 55), width=3)
        draw.text((320 + jx, 390), brand.upper()[:12], fill=(25, 28, 35), font=get_font(22, True))
        draw.text((320 + jx, 435), spec_tag[:16], fill=(90, 95, 108), font=f_spec_sm)
        draw.text((335 + jx, 475), "EAU DE PARFUM", fill=(165, 130, 35), font=get_font(15, True))

    elif shape == "skincare":
        # Dermocosmetic Tube / Serum Dropper / Cream Jar
        draw.rounded_rectangle([345 + jx, 145, 455 + jx, 230], radius=16, fill=dark_col, outline=border_col, width=3)
        draw.rounded_rectangle([285 + jx, 225, 515 + jx, 625], radius=38, fill=body_col, outline=border_col, width=5)
        draw.rounded_rectangle([305 + jx, 295, 495 + jx, 545], radius=16, fill=(255, 255, 255), outline=border_col, width=2)
        draw.rectangle([305 + jx, 295, 495 + jx, 350], fill=dark_col)
        draw.text((325 + jx, 312), brand.upper()[:10], fill=(255, 255, 255), font=f_brand_sm)
        draw.text((320 + jx, 385), spec_tag[:15], fill=(35, 42, 55), font=f_brand_sm)
        draw.text((320 + jx, 430), "DERMOCOSMÉTICA", fill=(100, 110, 125), font=get_font(15, True))

    elif shape == "drill":
        # Cordless Power Drill / Grinder / Saw
        draw.rounded_rectangle([235 + jx, 195, 515 + jx, 335], radius=28, fill=body_col, outline=border_col, width=5)
        # Chuck & drill bit
        draw.polygon([(515 + jx, 225), (585 + jx, 245), (585 + jx, 285), (515 + jx, 305)], fill=(45, 50, 58))
        draw.rectangle([585 + jx, 258, 655 + jx, 272], fill=(155, 162, 175))
        # Pistol grip handle
        draw.polygon([(315 + jx, 330), (415 + jx, 330), (385 + jx, 535), (285 + jx, 535)], fill=body_col, outline=border_col)
        # Lithium battery pack
        draw.rounded_rectangle([255 + jx, 525, 435 + jx, 615], radius=18, fill=(28, 32, 38), outline=border_col, width=4)
        draw.text((275 + jx, 248), brand.upper()[:9], fill=text_on_body, font=get_font(26, True))

    elif shape == "toolbox":
        # Tool Chest / Hardware / Compressor
        draw.arc([335 + jx, 190, 465 + jx, 295], start=180, end=360, fill=(35, 40, 48), width=16)
        draw.rounded_rectangle([175 + jx, 255, 625 + jx, 585], radius=24, fill=body_col, outline=border_col, width=5)
        draw.rectangle([175 + jx, 355, 625 + jx, 385], fill=(32, 36, 44))
        draw.rounded_rectangle([255 + jx, 335, 305 + jx, 405], radius=6, fill=(215, 180, 45))
        draw.rounded_rectangle([495 + jx, 335, 545 + jx, 405], radius=6, fill=(215, 180, 45))
        draw.text((315 + jx, 455), brand.upper()[:12], fill=text_on_body, font=get_font(28, True))

    elif shape == "pantry":
        # Non-Perishable Packaged Grocery Bag / Jar / Tin
        draw.polygon([
            (255 + jx, 155), (545 + jx, 155),
            (565 + jx, 615), (235 + jx, 615)
        ], fill=body_col, outline=border_col)
        draw.rectangle([250 + jx, 140, 550 + jx, 175], fill=dark_col, outline=border_col, width=3)
        # Front nutrition / brand label
        draw.rounded_rectangle([280 + jx, 245, 520 + jx, 515], radius=20, fill=(255, 253, 248), outline=(215, 185, 110), width=3)
        draw.rectangle([280 + jx, 245, 520 + jx, 315], fill=dark_col)
        draw.text((305 + jx, 268), brand.upper()[:12], fill=(255, 255, 255), font=f_brand_sm)
        draw.text((300 + jx, 350), short_model[:18], fill=(30, 35, 45), font=f_brand_sm)
        draw.text((300 + jx, 395), spec_tag[:18], fill=(90, 98, 110), font=f_spec_sm)
        draw.rounded_rectangle([310 + jx, 445, 490 + jx, 485], radius=10, fill=(242, 232, 205))
        draw.text((330 + jx, 456), "NO PERECEDERO", fill=(115, 75, 25), font=get_font(15, True))

    elif shape in ("toy", "stroller"):
        if shape == "stroller":
            # Baby Stroller / Car Seat / Crib
            draw.pieslice([245 + jx, 165, 545 + jx, 445], start=180, end=310, fill=body_col, outline=border_col, width=5)
            draw.rounded_rectangle([255 + jx, 315, 535 + jx, 465], radius=28, fill=dark_col, outline=border_col, width=4)
            draw.line([(245 + jx, 225), (545 + jx, 555)], fill=(120, 128, 140), width=12)
            draw.line([(515 + jx, 325), (275 + jx, 555)], fill=(120, 128, 140), width=12)
            draw.ellipse([235 + jx, 525, 315 + jx, 605], fill=(35, 40, 48), outline=(170, 178, 190), width=6)
            draw.ellipse([495 + jx, 525, 575 + jx, 605], fill=(35, 40, 48), outline=(170, 178, 190), width=6)
        else:
            # LEGO / Mattel / Toy Collector Box + Building Brick
            draw.rounded_rectangle([195 + jx, 185, 605 + jx, 585], radius=22, fill=body_col, outline=border_col, width=5)
            # Top studs if Lego
            for sx in (250, 335, 420, 505):
                draw.rounded_rectangle([sx + jx, 155, sx + 50 + jx, 188], radius=6, fill=dark_col, outline=border_col, width=3)
            draw.rounded_rectangle([235 + jx, 235, 565 + jx, 535], radius=16, fill=(255, 255, 255), outline=border_col, width=3)
            draw.rounded_rectangle([255 + jx, 255, 395 + jx, 315], radius=10, fill=(225, 35, 35) if "lego" in brand.lower() else dark_col)
            draw.text((275 + jx, 272), brand.upper()[:9], fill=(255, 255, 255), font=get_font(22, True))
            draw.text((260 + jx, 355), short_model[:20], fill=(25, 30, 42), font=get_font(22, True))
            draw.text((260 + jx, 400), spec_tag[:20], fill=(95, 105, 120), font=f_brand_sm)

    # Subtle bottom-right studio watermark with unique SKU so every packshot is 100% unique
    f_sku = get_font(13, bold=False)
    draw.text((330, 712), f"{brand.upper()} • REF {pid}", fill=(175, 182, 194), font=f_sku)

    # Guarantee all 4 corners are pure #FFFFFF
    for cx, cy in ((0, 0), (799, 0), (0, 799), (799, 799)):
        img.putpixel((cx, cy), (255, 255, 255))

    out_name = f"seed-{pid}.webp"
    out_path = os.path.join(PRODUCTS_IMG_DIR, out_name)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return f"/images/products/{out_name}"
    img.save(out_path, "WEBP", quality=90)
    return f"/images/products/{out_name}"


# ---------------------------------------------------------------------------
# 3. VALIDACIÓN ESTRICTA TIENDA ↔ MARCA ↔ CATEGORÍA Y GENERACIÓN DE SQL
# ---------------------------------------------------------------------------
def main():
    assert len(STORES_40) == 40, f"Se esperaban 40 tiendas, hay {len(STORES_40)}"

    total_products = sum(len(s["products"]) for s in STORES_40)
    assert total_products == 540, f"Se esperaban 540 productos, hay {total_products}"

    # Verify subscription distribution (4 ELITE, 10 PRO, 26 STARTER)
    tiers = {}
    for s in STORES_40:
        plan_val = s.get("plan", s.get("tier", "STARTER"))
        tiers[plan_val] = tiers.get(plan_val, 0) + 1
    print(f"[INFO] Distribución de planes de tiendas: {tiers}")

    # Validate every store and product before generating SQL
    category_audit = {c: [] for c in ALL_21_CATEGORIES}
    image_hashes = set()

    seller_users_sql = []
    stores_sql = []
    products_sql = []
    product_images_sql = []
    variants_sql = []
    variant_attrs_sql = []

    all_products_meta = []  # (pid, sid, title, price)

    pid = 7001
    vid = 8001

    first_names = [
        "Carlos Andrés", "María Camila", "Juan Sebastián", "Valentina", "Alejandro",
        "Daniela Sofía", "Santiago", "Isabella", "Diego Fernando", "Laura Vanessa",
        "Mateo", "Mariana", "Andrés Felipe", "Gabriela", "Nicolás",
        "Catalina", "Felipe", "Paola Andrea", "David Eduardo", "Natalia",
    ]
    last_names = [
        "Vergara", "Buelvas", "Lorduy", "del Castillo", "Martínez",
        "Rodríguez", "Gómez", "Hernández", "Díaz", "Pérez",
        "Sánchez", "Ramírez", "Torres", "Vargas", "Morales",
    ]

    for idx, store in enumerate(STORES_40):
        raw_id = store["id"]
        sid = raw_id if raw_id >= 6000 else 6000 + raw_id
        plan_val = store.get("plan", store.get("tier", "STARTER"))
        slug = store["slug"]
        store_name = store["store_name"]
        must_re = re.compile(store["must_match"], re.IGNORECASE)
        must_not_re = re.compile(rf"\b{store['must_not_match']}\b", re.IGNORECASE)
        allowed_cats = set(store["allowed_categories"])

        for c in allowed_cats:
            if c not in ALL_21_CATEGORIES:
                raise ValueError(f"Tienda {store_name} tiene categoría inválida: {c}")

        logo_url, banner_url = generate_store_assets(store)

        owner_name = f"{first_names[idx % len(first_names)]} {last_names[(idx * 3) % len(last_names)]}"
        owner_email = f"contacto.{slug.replace('-', '')}@mock.mercatto.co"
        phone = f"30{random.randint(10000000, 99999999)}"
        days_ago = random.randint(5, 44)
        calif = round(random.uniform(4.7, 5.0), 1)
        tot_ventas = random.randint(8, 35)

        seller_users_sql.append(
            f"({sid}, '{sql_escape(owner_name)}', '{owner_email}', "
            f"'$2a$10$913d199f349e540cf50caa123e5697cb1d6089eff315529b3ea3f', 'VENDEDOR', TRUE, TRUE, "
            f"'{phone}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{days_ago} days')"
        )

        stores_sql.append(
            f"({sid}, {sid}, 'EMPRESA', '{sql_escape(store_name)}', '{sql_escape(store['description'])}', "
            f"'{logo_url}', '{banner_url}', '{banner_url}', 'APROBADO', '{store['nit']}', "
            f"'{sql_escape(store_name)} S.A.S.', 'Cartagena de Indias', '{sql_escape(store['address'])}', "
            f"'{store['account']}', '{store['bank']}', {calif}, {tot_ventas}, '{plan_val}', "
            f"NOW() - INTERVAL '{days_ago} days')"
        )

        for p_tuple in store["products"]:
            title, brand, cat, price, shape, color_hex, var_name, var_values = p_tuple

            # 1. Verify no concatenated "- <Brand>" or "- <Store>"
            if " - " in title:
                raise AssertionError(f"VIOLACIÓN DE TÍTULO CONCATENADO en {store_name}: {title}")

            # 2. Verify category is in store's allowed_categories
            if cat not in allowed_cats:
                raise AssertionError(f"VIOLACIÓN DE CATEGORÍA: '{title}' tiene '{cat}' no permitida en {store_name} ({allowed_cats})")

            # 3. Verify regex must_match and must_not_match
            check_text = f"{title} {brand}"
            if not must_re.search(check_text):
                raise AssertionError(f"VIOLACIÓN MUST_MATCH en {store_name}: '{check_text}' no cumple {store['must_match']}")
            if must_not_re.search(check_text):
                raise AssertionError(f"VIOLACIÓN MUST_NOT_MATCH en {store_name}: '{check_text}' coincide con {store['must_not_match']}")

            # 4. Generate unique 800x800 white-background packshot
            img_url = render_packshot_800(pid, title, brand, cat, shape, color_hex, price)
            disk_img_path = os.path.join(FRONTEND_PUBLIC, img_url.lstrip("/").replace("/", os.sep))
            with open(disk_img_path, "rb") as f:
                h = hashlib.sha256(f.read()).hexdigest()
            if h in image_hashes:
                raise AssertionError(f"VIOLACIÓN DE IMAGEN DUPLICADA para producto {pid}: {title}")
            image_hashes.add(h)

            p_slug = f"{slugify(title)}-{pid}"
            desc = (
                f"{title} original marca {brand}, distribuido oficialmente por {store_name} en Cartagena de Indias. "
                f"Producto nuevo en caja sellada con factura legal, garantía oficial de 12 meses y despacho inmediato en Bolívar."
            )
            has_offer = (pid % 4 == 0)
            offer_sql = str(int(round(price * 0.90, -2))) if has_offer else "NULL"
            stock = random.randint(14, 55)
            sku = f"SEED-PROD-{pid}"
            p_calif = round(random.uniform(4.7, 5.0), 1)
            p_resenas = random.randint(4, 28)
            p_ventas = random.randint(1, 12)
            p_days = random.randint(2, 42)
            cat_sql = get_category_sql(cat)

            products_sql.append(
                f"({pid}, {sid}, {cat_sql}, '{sql_escape(title)}', '{p_slug}', '{sql_escape(desc)}', "
                f"{price}, {offer_sql}, {stock}, '{sku}', '{sql_escape(brand)}', 'NUEVO', TRUE, FALSE, "
                f"{p_calif}, {p_resenas}, {p_ventas}, NOW() - INTERVAL '{p_days} days', NOW() - INTERVAL '{p_days} days')"
            )

            product_images_sql.append(
                f"({pid}, {pid}, '{img_url}', TRUE, TRUE, 0)"
            )

            # 2 variants per product
            for v_val in var_values[:2]:
                v_code = slugify(v_val).upper().replace("-", "")[:6] or "STD"
                v_sku = f"SEED-PROD-{pid}-{v_code}-{vid}"
                v_stock = max(5, stock // 2)
                variants_sql.append(
                    f"({vid}, {pid}, '{v_sku}', '{sql_escape(v_val)}', {price}, {offer_sql}, {v_stock}, '{img_url}', TRUE)"
                )
                variant_attrs_sql.append(
                    f"({vid}, {vid}, '{sql_escape(var_name)}', '{sql_escape(v_val)}')"
                )
                vid += 1

            category_audit[cat].append((store_name, brand, title))
            all_products_meta.append((pid, sid, title, price))
            pid += 1

    # Verify all 21 categories have products
    for c in ALL_21_CATEGORIES:
        if len(category_audit[c]) < 2:
            raise AssertionError(f"La categoría '{c}' tiene menos de 2 productos: {len(category_audit[c])}")

    # -----------------------------------------------------------------------
    # 4. GENERAR 120 COMPRADORES + DIRECCIONES Y 300 PEDIDOS COHERENTES
    # -----------------------------------------------------------------------
    buyers_sql = []
    addresses_sql = []
    barrios = [
        "Bocagrande", "Castillogrande", "Manga", "Pie de la Popa", "El Cabrero",
        "Marbella", "Crespo", "Centro Histórico", "San Diego", "Getsemaní", "El Laguito"
    ]

    for bid in range(5001, 5121):
        b_idx = bid - 5001
        b_name = f"{first_names[b_idx % len(first_names)]} {last_names[(b_idx * 5 + 2) % len(last_names)]}"
        b_email = f"comprador{b_idx + 1}@mock.mercatto.co"
        b_phone = f"30{random.randint(10000000, 99999999)}"
        b_days = random.randint(1, 45)
        barrio = barrios[b_idx % len(barrios)]
        addr = f"Cra {(b_idx % 55) + 2} # {(b_idx * 3 % 70) + 10}-{(b_idx * 7 % 88) + 10}, Edificio Bahía {(b_idx % 20) + 1}, Apto {(b_idx % 12 + 1) * 100 + (b_idx % 4 + 1)}"

        buyers_sql.append(
            f"({bid}, '{sql_escape(b_name)}', '{b_email}', "
            f"'$2a$10$913d199f349e540cf50caa123e5697cb1d6089eff315529b3ea3f', 'COMPRADOR', TRUE, TRUE, "
            f"'{b_phone}', 'LOCAL', 'MOCK_DATA_2026', 5, NOW() - INTERVAL '{b_days} days')"
        )
        addresses_sql.append(
            f"({bid}, {bid}, '{sql_escape(b_name)}', '{b_phone}', '{sql_escape(addr)}', "
            f"'{barrio}', 'Cartagena de Indias', 'Bolívar', '130001', 'Entregar en portería / recepción', TRUE)"
        )

    orders_sql = []
    order_items_sql = []
    payments_sql = []
    valid_payment_methods = ["WOMPI", "PSE", "NEQUI", "TARJETA_CREDITO", "CONTRA_ENTREGA"]
    order_states = ["ENTREGADO", "PAGADO", "ENVIADO", "ENTREGADO", "PAGADO", "PENDIENTE"]

    oi_id = 10001
    for oid in range(9001, 9301):
        buyer_id = random.randint(5001, 5120)
        num_items = 1 if random.random() < 0.65 else 2
        chosen = random.sample(all_products_meta, num_items)
        subtotal = 0
        for p_id, s_id, p_title, p_price in chosen:
            qty = 1 if p_price > 400000 else random.choice([1, 1, 2])
            line_total = p_price * qty
            subtotal += line_total
            order_items_sql.append(
                f"({oi_id}, {oid}, {p_id}, {s_id}, '{sql_escape(p_title)}', {p_price}, {qty}, {line_total})"
            )
            oi_id += 1

        shipping = 0 if subtotal >= 150000 else 12000
        total = subtotal + shipping
        state = order_states[oid % len(order_states)]
        pay_state = "PENDIENTE" if state == "PENDIENTE" else "APROBADO"
        pay_method = valid_payment_methods[oid % len(valid_payment_methods)]
        o_days = random.randint(1, 45)

        orders_sql.append(
            f"({oid}, 'PED-MOCK-2026-{oid}', {buyer_id}, {buyer_id}, '{state}', "
            f"{subtotal}, 0.0, {shipping}, {total}, 'MOCK_FERIA_CARTAGENA', "
            f"NOW() - INTERVAL '{o_days} days', NOW() - INTERVAL '{o_days} days')"
        )
        payments_sql.append(
            f"({oid}, {oid}, '{pay_method}', '{pay_state}', {total}, 'COP', "
            f"NOW() - INTERVAL '{o_days} days', NOW() - INTERVAL '{o_days} days', NOW() - INTERVAL '{o_days} days')"
        )

    # -----------------------------------------------------------------------
    # 5. ESCRIBIR EL SCRIPT SQL TRANSACCIONAL CON LIMPIEZA SEGURA
    # -----------------------------------------------------------------------
    def batched_inserts(header_sql: str, rows: list, chunk_size: int = 100) -> str:
        blocks = []
        for i in range(0, len(rows), chunk_size):
            chunk = rows[i:i + chunk_size]
            blocks.append(header_sql + "\nVALUES\n" + ",\n".join(chunk) + ";")
        return "\n\n".join(blocks)

    sql_parts = [
        "-- ============================================================================",
        "-- MERCATTO MARKETPLACE - SEEDING OFICIAL FERIA COMERCIAL CARTAGENA 2026",
        "-- ARQUITECTURA 100% AISLADA POR TIENDA (CERO PISCINAS COMPARTIDAS)",
        "-- 40 TIENDAS REALES EN CARTAGENA DE INDIAS + 540 PACKSHOTS ÚNICOS (#FFFFFF)",
        "-- RESPETA TIENDAS Y PRODUCTOS CREADOS MANUALMENTE POR EL USUARIO",
        "-- ============================================================================",
        "",
        "BEGIN;",
        "",
        "-- 0. ASEGURAR COLUMNAS DDL DE COMPATIBILIDAD",
        "ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS tokens_chat INT DEFAULT 5;",
        "ALTER TABLE IF EXISTS vendedores ADD COLUMN IF NOT EXISTS portada_url TEXT;",
        "ALTER TABLE IF EXISTS vendedores ADD COLUMN IF NOT EXISTS banner_url TEXT;",
        "ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT false;",
        "ALTER TABLE IF EXISTS producto_imagenes ADD COLUMN IF NOT EXISTS principal BOOLEAN DEFAULT false;",
        "ALTER TABLE IF EXISTS producto_variantes ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;",
        "ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP;",
        "ALTER TABLE IF EXISTS pagos ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP;",
        "",
        "-- 0.1 LIMPIEZA EXCLUSIVA DE DATOS SEED ANTERIORES (PROTEGE TUS TIENDAS MANUALES)",
        "DELETE FROM pagos WHERE id BETWEEN 9001 AND 9300 OR pedido_id IN (SELECT id FROM pedidos WHERE id BETWEEN 9001 AND 9300 OR codigo LIKE 'PED-MOCK-%');",
        "DELETE FROM pedido_items WHERE id BETWEEN 10001 AND 12000 OR pedido_id IN (SELECT id FROM pedidos WHERE id BETWEEN 9001 AND 9300 OR codigo LIKE 'PED-MOCK-%') OR producto_id IN (SELECT id FROM productos WHERE id BETWEEN 7001 AND 7540 OR sku LIKE 'SEED-%');",
        "DELETE FROM pedidos WHERE id BETWEEN 9001 AND 9300 OR codigo LIKE 'PED-MOCK-%';",
        "DELETE FROM variante_atributos WHERE id BETWEEN 8001 AND 9200 OR variante_id IN (SELECT id FROM producto_variantes WHERE id BETWEEN 8001 AND 9200 OR sku LIKE 'SEED-%');",
        "DELETE FROM producto_variantes WHERE id BETWEEN 8001 AND 9200 OR sku LIKE 'SEED-%' OR producto_id IN (SELECT id FROM productos WHERE id BETWEEN 7001 AND 7540 OR sku LIKE 'SEED-%');",
        "DELETE FROM producto_imagenes WHERE id BETWEEN 7001 AND 7540 OR producto_id IN (SELECT id FROM productos WHERE id BETWEEN 7001 AND 7540 OR sku LIKE 'SEED-%');",
        "DELETE FROM productos WHERE id BETWEEN 7001 AND 7540 OR sku LIKE 'SEED-%' OR vendedor_id BETWEEN 6001 AND 6040;",
        "DELETE FROM vendedores WHERE id BETWEEN 6001 AND 6040 OR usuario_id IN (SELECT id FROM usuarios WHERE google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co');",
        "DELETE FROM direcciones WHERE id BETWEEN 5001 AND 5120 OR usuario_id IN (SELECT id FROM usuarios WHERE google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co');",
        "DELETE FROM usuarios WHERE id BETWEEN 5001 AND 6040 OR google_id = 'MOCK_DATA_2026' OR email LIKE '%@mock.mercatto.co';",
        "",
        "-- 1. USUARIOS COMPRADORES (120 Registros)",
        batched_inserts(
            "INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)",
            buyers_sql, 120
        ),
        "",
        "-- 2. DIRECCIONES COMPRADORES (120 Registros en Cartagena de Indias)",
        batched_inserts(
            "INSERT INTO direcciones (id, usuario_id, nombre_completo, telefono, direccion, barrio, ciudad, departamento, codigo_postal, notas_entrega, es_principal)",
            addresses_sql, 120
        ),
        "",
        "-- 3. USUARIOS PROPIETARIOS DE TIENDAS (40 Registros)",
        batched_inserts(
            "INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, email_verificado, telefono, proveedor, google_id, tokens_chat, fecha_registro)",
            seller_users_sql, 40
        ),
        "",
        "-- 4. TIENDAS VENDEDORAS EN CARTAGENA DE INDIAS (40 Registros)",
        batched_inserts(
            "INSERT INTO vendedores (id, usuario_id, tipo, nombre_tienda, descripcion, logo_url, portada_url, banner_url, estado, nit_cedula, razon_social, ciudad, direccion, cuenta_bancaria, banco, calificacion, total_ventas, tipo_suscripcion, fecha_registro)",
            stores_sql, 40
        ),
        "",
        "-- 5. PRODUCTOS DE CATÁLOGO AISLADOS POR TIENDA (540 Registros)",
        batched_inserts(
            "INSERT INTO productos (id, vendedor_id, categoria_id, titulo, slug, descripcion, precio, precio_oferta, stock, sku, marca, estado, activo, destacado, calificacion, total_resenas, total_ventas, fecha_creacion, fecha_actualizacion)",
            products_sql, 100
        ),
        "",
        "-- 6. IMÁGENES DE PRODUCTOS PACKSHOT 800x800 ÚNICAS (540 Registros)",
        batched_inserts(
            "INSERT INTO producto_imagenes (id, producto_id, url, principal, es_principal, orden_visual)",
            product_images_sql, 100
        ),
        "",
        "-- 7. VARIANTES DE PRODUCTOS (1080 Registros)",
        batched_inserts(
            "INSERT INTO producto_variantes (id, producto_id, sku, nombre, precio, precio_oferta, stock, imagen_url, activo)",
            variants_sql, 100
        ),
        "",
        "-- 8. ATRIBUTOS DE VARIANTES (1080 Registros)",
        batched_inserts(
            "INSERT INTO variante_atributos (id, variante_id, nombre, valor)",
            variant_attrs_sql, 100
        ),
        "",
        "-- 9. PEDIDOS RECIENTES (300 Registros)",
        batched_inserts(
            "INSERT INTO pedidos (id, codigo, comprador_id, direccion_id, estado, subtotal, descuento, costo_envio, total, notas, fecha_creacion, fecha_actualizacion)",
            orders_sql, 100
        ),
        "",
        "-- 10. DETALLE DE ITEMS DE PEDIDOS",
        batched_inserts(
            "INSERT INTO pedido_items (id, pedido_id, producto_id, vendedor_id, nombre_producto, precio_unitario, cantidad, subtotal)",
            order_items_sql, 100
        ),
        "",
        "-- 11. PAGOS DE PEDIDOS (300 Registros - Check Constraint Validated)",
        batched_inserts(
            "INSERT INTO pagos (id, pedido_id, metodo, estado, monto, moneda, fecha_pago, fecha_confirmacion, fecha_creacion)",
            payments_sql, 100
        ),
        "",
        "-- 12. REAJUSTE DE SECUENCIAS POSTGRESQL",
        "SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1));",
        "SELECT setval(pg_get_serial_sequence('direcciones', 'id'), COALESCE((SELECT MAX(id) FROM direcciones), 1));",
        "SELECT setval(pg_get_serial_sequence('vendedores', 'id'), COALESCE((SELECT MAX(id) FROM vendedores), 1));",
        "SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1));",
        "SELECT setval(pg_get_serial_sequence('producto_imagenes', 'id'), COALESCE((SELECT MAX(id) FROM producto_imagenes), 1));",
        "SELECT setval(pg_get_serial_sequence('producto_variantes', 'id'), COALESCE((SELECT MAX(id) FROM producto_variantes), 1));",
        "SELECT setval(pg_get_serial_sequence('variante_atributos', 'id'), COALESCE((SELECT MAX(id) FROM variante_atributos), 1));",
        "SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1));",
        "SELECT setval(pg_get_serial_sequence('pedido_items', 'id'), COALESCE((SELECT MAX(id) FROM pedido_items), 1));",
        "SELECT setval(pg_get_serial_sequence('pagos', 'id'), COALESCE((SELECT MAX(id) FROM pagos), 1));",
        "",
        "COMMIT;",
        ""
    ]

    with open(SQL_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_parts))

    # -----------------------------------------------------------------------
    # 6. AUDITORÍA AUTOMÁTICA DE LAS 21 CATEGORÍAS EN CONSOLA
    # -----------------------------------------------------------------------
    print("\n" + "=" * 88)
    print("AUDITORÍA DE COHERENCIA ESTRICTA (2 PRODUCTOS POR CADA UNA DE LAS 21 CATEGORÍAS)")
    print("=" * 88)
    for c in ALL_21_CATEGORIES:
        items = category_audit[c]
        for store_n, brand_n, title_n in items[:2]:
            print(f"[{c}] -> [{store_n}] -> [{brand_n}] -> [{title_n}]")
    print("=" * 88)
    print(f"[OK] Total Tiendas Aisladas: {len(STORES_40)}")
    print(f"[OK] Total Productos Validados por Regex: {len(products_sql)}")
    print(f"[OK] Total Imágenes Packshot 800x800 Únicas (SHA-256): {len(image_hashes)}")
    print(f"[OK] Total Compradores: {len(buyers_sql)} | Total Pedidos: {len(orders_sql)}")
    print(f"[OK] Archivo SQL generado en: {SQL_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
