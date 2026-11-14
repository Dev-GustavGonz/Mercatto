#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetches the 6 manual stores, 21 categories, and 32 manual products directly from the live Azure API
in parallel (~2 seconds), combines them with the 540 seed products (exact DB schema),
and writes mercatto-frontend/src/data/catalogSnapshot.json for 0ms instant loading
across all 21 categories and Home page.
"""

import os
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from store_definitions_40 import STORES_40

API_BASE = "https://mercatto-backend-api-g6fyeqc5fmfjhbhg.brazilsouth-01.azurewebsites.net/api"
PROJECT_ROOT = r"c:\Users\gjgh2\Downloads\mercatto"
OUT_DIR = os.path.join(PROJECT_ROOT, "mercatto-frontend", "src", "data")
os.makedirs(OUT_DIR, exist_ok=True)


def api_get(path: str):
    req = urllib.request.Request(
        API_BASE + path,
        headers={"Accept-Language": "es", "User-Agent": "Mozilla/5.0"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    # Clean up temporary test jpgs
    for fn in ("test_cafe.jpg", "test_iphone.jpg", "test_nevera.jpg", "test_nike.jpg", "test_taladro.jpg"):
        p = os.path.join(PROJECT_ROOT, "scripts", fn)
        if os.path.exists(p):
            os.remove(p)

    print("Fetching /tiendas and /categorias/todas from live API...")
    tiendas = api_get("/tiendas")
    categorias = api_get("/categorias/todas")

    manual_stores = [t for t in tiendas if int(t.get("id", 99999)) < 5000]
    seed_stores_by_id = {int(t["id"]): t for t in tiendas if int(t.get("id", 0)) >= 5000}
    print(f"Found {len(manual_stores)} manual stores and {len(seed_stores_by_id)} seed stores, {len(categorias)} categories.")

    # Map category name (normalized) -> live category object
    import unicodedata
    def norm(s):
        return "".join(
            c for c in unicodedata.normalize("NFD", (s or "").lower().strip())
            if unicodedata.category(c) != "Mn"
        )

    cat_by_norm = {norm(c["nombre"]): c for c in categorias}

    # Fetch manual products from each manual store in parallel
    def fetch_store_prods(store_obj):
        sid = store_obj["id"]
        data = api_get(f"/tiendas/{sid}/productos?pagina=0&tamano=50")
        return data.get("content", []) if isinstance(data, dict) else data

    manual_products = []
    with ThreadPoolExecutor(max_workers=6) as ex:
        for prods in ex.map(fetch_store_prods, manual_stores):
            manual_products.extend(prods)

    print(f"Fetched {len(manual_products)} manual products from the 6 manual stores in parallel!")

    # Build the 540 seed products matching the exact ProductoResponse structure in the live DB
    seed_products = []
    pid = 7001
    vid = 8001
    for idx, sdef in enumerate(STORES_40):
        raw_id = sdef["id"]
        sid = raw_id if raw_id >= 6000 else 6000 + raw_id
        live_store = seed_stores_by_id.get(sid, {})
        plan_val = sdef.get("plan", sdef.get("tier", "STARTER"))
        vendedor_dto = {
            "id": sid,
            "nombreTienda": live_store.get("nombreTienda") or sdef["store_name"],
            "slug": live_store.get("slug") or sdef["slug"],
            "logoUrl": live_store.get("logoUrl") or f"/images/stores/logos/{sdef['slug']}.png",
            "calificacion": live_store.get("calificacion") or 4.9,
            "verificado": True,
            "plan": plan_val,
            "tipoSuscripcion": plan_val,
        }

        for p_idx, prod in enumerate(sdef["products"]):
            if isinstance(prod, dict):
                title = prod["title"]
                brand = prod["brand"]
                cat_name = prod["category"]
                price = float(prod["price"])
                attr_name = prod.get("attr_name", "Presentación")
                attr_vals = prod.get("attr_vals", ["Estándar"])
            else:
                title, brand, cat_name, price, attr_name, attr_vals = (
                    prod[0], prod[1], prod[2], float(prod[3]), prod[4], prod[5]
                )

            c_obj = cat_by_norm.get(norm(cat_name)) or categorias[0]
            cat_dto = {
                "id": c_obj["id"],
                "nombre": c_obj["nombre"],
                "slug": c_obj.get("slug", ""),
                "icono": c_obj.get("icono"),
            }

            has_offer = (pid % 3 == 0)
            offer_price = round(price * 0.90, -2) if has_offer else None
            is_featured = (plan_val == "ELITE") or (plan_val == "PRO" and p_idx < 4)
            img_url = f"/images/products/seed-{pid}.webp"

            variantes = []
            for v_i, val in enumerate(attr_vals[:2]):
                variantes.append({
                    "id": vid,
                    "nombre": f"{attr_name}: {val}",
                    "sku": f"VAR-{pid}-{v_i+1}",
                    "precio": price,
                    "precioOferta": offer_price,
                    "stock": 15 + ((pid + v_i * 5) % 30),
                    "imagenUrl": img_url,
                    "atributos": {attr_name: val},
                })
                vid += 1

            seed_products.append({
                "id": pid,
                "titulo": title,
                "slug": f"seed-prod-{pid}",
                "descripcion": f"{title} original marca {brand}. Disponible para entrega inmediata en Cartagena de Indias con garantía oficial de {vendedor_dto['nombreTienda']}.",
                "precio": price,
                "precioOferta": offer_price,
                "stock": 25 + (pid % 40),
                "sku": f"SEED-PROD-{pid}",
                "marca": brand,
                "estado": "NUEVO",
                "calificacion": round(4.6 + ((pid % 5) * 0.08), 1),
                "totalResenas": 8 + (pid % 35),
                "totalVentas": 12 + (pid % 65),
                "activo": True,
                "destacado": is_featured,
                "imagenPrincipal": img_url,
                "imagenes": [
                    {
                        "id": pid,
                        "url": img_url,
                        "publicId": f"seed-img-{pid}",
                        "principal": True,
                        "ordenVisual": 0,
                    }
                ],
                "variantes": variantes,
                "categoria": cat_dto,
                "vendedor": vendedor_dto,
                "fechaCreacion": "2026-10-15T12:00:00",
            })
            pid += 1

    snapshot = {
        "manualStores": manual_stores,
        "allStores": tiendas,
        "categories": categorias,
        "manualProducts": manual_products,
        "seedProducts": seed_products,
    }

    out_file = os.path.join(OUT_DIR, "catalogSnapshot.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, separators=(",", ":"))

    print(f"SUCCESS: Wrote {out_file} ({os.path.getsize(out_file) // 1024} KB)")
    print(f"  manualStores: {len(manual_stores)}")
    print(f"  manualProducts: {len(manual_products)}")
    print(f"  seedProducts: {len(seed_products)}")
    print(f"  totalProducts: {len(manual_products) + len(seed_products)}")


if __name__ == "__main__":
    main()
