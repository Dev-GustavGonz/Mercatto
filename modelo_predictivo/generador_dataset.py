"""
=============================================================================
PROYECTO DE AULA: MERCATTO MARKETPLACE
MÓDULO: GENERADOR DE DATOS SIMULADOS PARA MODELO PREDICTIVO
Integrantes: Gustavo Gonzalez, Frank Barboza, Samuel Bowden, Carlos Arellano
=============================================================================
Genera un historial simulado de 36 meses (2023 - 2026) con estacionalidad,
variación por categoría, volumen de catálogo y tasas de comisión según el
plan contratado por cada tienda:
 - Plan STARTER: 10% de comisión por venta
 - Plan PROFESIONAL: 5% de comisión por venta
 - Plan ELITE PREMIUM: 2% de comisión por venta

Regla de cálculo de ganancia neta esperada:
  resultado = valor_total_ventas - (valor_total_ventas * porcentaje_comision)
=============================================================================
"""

import numpy as np
import pandas as pd
import os

def generar_dataset(n_muestras=2500, semilla=42, ruta_salida=None):
    np.random.seed(semilla)

    planes = ['STARTER', 'PRO', 'ELITE']
    prob_planes = [0.55, 0.32, 0.13] # Más tiendas inician en Starter
    comisiones_plan = {
        'STARTER': 0.10,   # 10% de comisión
        'PRO': 0.05,       # 5% de comisión
        'ELITE': 0.02      # 2% de comisión
    }

    categorias = [
        'Tecnología y Electrónica',
        'Moda y Ropa',
        'Hogar y Muebles',
        'Deportes y Fitness',
        'Belleza y Cuidado Personal',
        'Herramientas e Industria'
    ]

    # Factores de ticket promedio y volumen por categoría (en COP)
    ticket_base_cat = {
        'Tecnología y Electrónica': (350000, 1800000),
        'Moda y Ropa': (45000, 220000),
        'Hogar y Muebles': (85000, 850000),
        'Deportes y Fitness': (60000, 450000),
        'Belleza y Cuidado Personal': (30000, 190000),
        'Herramientas e Industria': (90000, 950000)
    }

    registros = []

    for i in range(n_muestras):
        mes = np.random.randint(1, 13)
        anio = np.random.choice([2023, 2024, 2025, 2026], p=[0.25, 0.30, 0.30, 0.15])
        
        # Estacionalidad comercial en Colombia:
        # Mayo: Día de la Madre (1.30)
        # Junio/Julio: Prima mitad de año (1.20)
        # Noviembre: Black Friday / Cyberlunes (1.45)
        # Diciembre: Navidad y fin de año (1.65)
        # Enero: Cuesta de enero (0.80)
        factores_mes = {
            1: 0.80, 2: 0.90, 3: 0.95, 4: 1.00,
            5: 1.30, 6: 1.20, 7: 1.15, 8: 1.00,
            9: 1.05, 10: 1.10, 11: 1.45, 12: 1.65
        }
        factor_estacional = factores_mes[mes]
        es_temporada_alta = 1 if mes in [5, 6, 7, 11, 12] else 0

        plan = np.random.choice(planes, p=prob_planes)
        tasa_comision = comisiones_plan[plan]
        categoria = np.random.choice(categorias)

        # Límites de catálogo según el plan contratado
        if plan == 'STARTER':
            productos_activos = np.random.randint(1, 11)   # Hasta 10 productos
            factor_exposicion = 1.0
        elif plan == 'PRO':
            productos_activos = np.random.randint(8, 51)   # Hasta 50 productos
            factor_exposicion = 1.35                       # Mayor visibilidad
        else: # ELITE
            productos_activos = np.random.randint(25, 180) # Catálogo ilimitado
            factor_exposicion = 1.85                       # Prioridad máxima

        reputacion = np.round(np.random.normal(4.7, 0.3), 1)
        reputacion = float(np.clip(reputacion, 3.0, 5.0))

        # Visitas a la tienda influenciadas por catálogo y exposición
        visitas_base = np.random.exponential(scale=600) + (productos_activos * 45)
        visitas = int(visitas_base * factor_exposicion * factor_estacional)
        visitas = max(50, visitas)

        # Conversión promedio en e-commerce (1.5% a 4.0%)
        tasa_conversion = np.random.uniform(0.015, 0.038) * (reputacion / 5.0)
        carritos = int(visitas * np.random.uniform(0.06, 0.14))
        
        # Compras estimadas (número de pedidos del mes)
        compras_estimadas = int(visitas * tasa_conversion)
        compras_estimadas = max(1, compras_estimadas)

        # Ticket promedio según categoría
        rango_min, rango_max = ticket_base_cat[categoria]
        ticket_promedio = float(np.random.uniform(rango_min, rango_max))
        # Redondear a cientos de pesos colombianos
        ticket_promedio = round(ticket_promedio / 1000) * 1000

        # -------------------------------------------------------------------
        # ETAPA 1: VARIABLE OBJETIVO PRINCIPAL (Valor total de ventas)
        # -------------------------------------------------------------------
        ruido_ventas = np.random.normal(1.0, 0.05)
        valor_total_ventas = round(compras_estimadas * ticket_promedio * ruido_ventas, 2)
        valor_total_ventas = max(50000.0, valor_total_ventas)

        # -------------------------------------------------------------------
        # ETAPA 2: REGLA DE NEGOCIO Y GANANCIA NETA DE LA TIENDA
        # resultado = valor - porcentaje
        # -------------------------------------------------------------------
        comision_mercatto = round(valor_total_ventas * tasa_comision, 2)
        ganancia_neta_tienda = round(valor_total_ventas - comision_mercatto, 2)

        registros.append({
            'anio': anio,
            'mes': mes,
            'temporada_alta': es_temporada_alta,
            'categoria': categoria,
            'plan_suscripcion': plan,
            'porcentaje_comision': round(tasa_comision * 100, 1),
            'productos_activos': productos_activos,
            'visitas_tienda': visitas,
            'carritos_creados': carritos,
            'reputacion': reputacion,
            'ticket_promedio': ticket_promedio,
            'compras_mensuales': compras_estimadas,
            'valor_total_ventas': valor_total_ventas,
            'comision_mercatto': comision_mercatto,
            'ganancia_neta_tienda': ganancia_neta_tienda
        })

    df = pd.DataFrame(registros)

    if ruta_salida is None:
        ruta_salida = os.path.join(os.path.dirname(__file__), 'dataset_ventas_mercatto.csv')

    df.to_csv(ruta_salida, index=False, encoding='utf-8')
    print(f"[OK] Dataset generado exitosamente: {ruta_salida}")
    print(f"     Total registros: {len(df)}")
    print(f"     Columnas: {list(df.columns)}")
    print(f"     Resumen de Ventas (COP): Min={df['valor_total_ventas'].min():,.0f} | "
          f"Mediana={df['valor_total_ventas'].median():,.0f} | "
          f"Max={df['valor_total_ventas'].max():,.0f}")
    return df

if __name__ == '__main__':
    generar_dataset()
