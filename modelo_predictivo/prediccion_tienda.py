"""
=============================================================================
PROYECTO DE AULA: MERCATTO MARKETPLACE
MÓDULO: MOTOR DE INFERENCIA PREDICTIVA PARA TIENDAS
Integrantes: Gustavo Gonzalez, Frank Barboza, Samuel Bowden, Carlos Arellano
=============================================================================
Estima para cualquier tienda:
 1. Número de compras estimadas del mes
 2. Valor total de ventas brutas estimadas (COP)
 3. Deducción de comisión según el plan contratado:
      resultado = valor_total_ventas - (valor_total_ventas * porcentaje_plan)
 4. Escenarios: Conservador, Esperado y Optimista
 5. Análisis comparativo entre planes (Starter 10%, Pro 5%, Elite 2%)
=============================================================================
"""

import os
import sys
import json
import argparse

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
import joblib
import numpy as np
import pandas as pd

DIR_ACTUAL = os.path.dirname(os.path.abspath(__file__))
MODELO_VENTAS_PATH = os.path.join(DIR_ACTUAL, 'modelo_ventas.joblib')
MODELO_COMPRAS_PATH = os.path.join(DIR_ACTUAL, 'modelo_compras.joblib')

TASAS_COMISION = {
    'STARTER': 0.10,  # 10% de comisión por venta
    'PRO': 0.05,      # 5% de comisión por venta
    'ELITE': 0.02     # 2% de comisión por venta
}

NOMBRES_PLANES = {
    'STARTER': 'Plan Starter',
    'PRO': 'Plan Profesional',
    'ELITE': 'Plan Elite Premium'
}

_modelo_ventas = None
_modelo_compras = None

def cargar_modelos():
    global _modelo_ventas, _modelo_compras
    if _modelo_ventas is None:
        if not os.path.exists(MODELO_VENTAS_PATH):
            from entrenar_modelo import entrenar_y_evaluar
            entrenar_y_evaluar()
        _modelo_ventas = joblib.load(MODELO_VENTAS_PATH)
        _modelo_compras = joblib.load(MODELO_COMPRAS_PATH)
    return _modelo_ventas, _modelo_compras

def predecir_tienda(
    plan='STARTER',
    productos_activos=10,
    ticket_promedio=120000.0,
    visitas=None,
    categoria='Tecnología y Electrónica',
    mes=10,
    reputacion=5.0
):
    """
    Realiza la predicción de ventas y calcula la ganancia neta según el plan:
      resultado = valor - porcentaje
    """
    pipe_ventas, pipe_compras = cargar_modelos()

    plan = plan.upper()
    if plan not in TASAS_COMISION:
        plan = 'STARTER'

    tasa_actual = TASAS_COMISION[plan]

    # Temporada alta comercial en Colombia
    es_temporada_alta = 1 if mes in [5, 6, 7, 11, 12] else 0

    # Estimación de visitas si no se proveen
    if visitas is None or visitas <= 0:
        factor_exp = 1.0 if plan == 'STARTER' else (1.4 if plan == 'PRO' else 1.9)
        visitas = int((productos_activos * 55 + 250) * factor_exp)

    carritos = int(visitas * 0.09)

    fila_input = pd.DataFrame([{
        'mes': mes,
        'temporada_alta': es_temporada_alta,
        'categoria': categoria,
        'plan_suscripcion': plan,
        'productos_activos': productos_activos,
        'visitas_tienda': visitas,
        'carritos_creados': carritos,
        'reputacion': reputacion,
        'ticket_promedio': ticket_promedio
    }])

    # -----------------------------------------------------------------------
    # ETAPA 1: PREDICCIÓN CON MODELO MACHINE LEARNING (RANDOM FOREST)
    # -----------------------------------------------------------------------
    pred_log = pipe_ventas.predict(fila_input)[0]
    valor_esperado = float(np.expm1(pred_log))
    valor_esperado = round(max(50000.0, valor_esperado), 2)

    compras_esperadas = int(round(float(pipe_compras.predict(fila_input)[0])))
    compras_esperadas = max(1, compras_esperadas)

    # -----------------------------------------------------------------------
    # ETAPA 2: APLICACIÓN DE LA REGLA DE NEGOCIO (resultado = valor - porcentaje)
    # -----------------------------------------------------------------------
    comision_esperada = round(valor_esperado * tasa_actual, 2)
    ganancia_neta_esperada = round(valor_esperado - comision_esperada, 2)

    # -----------------------------------------------------------------------
    # ESCENARIOS PREDICTIVOS: Conservador (-25%), Esperado (Base), Optimista (+35%)
    # -----------------------------------------------------------------------
    # 1. Conservador
    valor_conservador = round(valor_esperado * 0.75, 2)
    compras_conservador = max(1, int(round(compras_esperadas * 0.75)))
    comision_conservador = round(valor_conservador * tasa_actual, 2)
    neto_conservador = round(valor_conservador - comision_conservador, 2)

    # 2. Optimista
    valor_optimista = round(valor_esperado * 1.35, 2)
    compras_optimista = int(round(compras_esperadas * 1.35))
    comision_optimista = round(valor_optimista * tasa_actual, 2)
    neto_optimista = round(valor_optimista - comision_optimista, 2)

    # -----------------------------------------------------------------------
    # COMPARATIVA ENTRE PLANES (Starter 10%, Pro 5%, Elite 2%)
    # -----------------------------------------------------------------------
    comparativa = {}
    comision_starter_base = round(valor_esperado * TASAS_COMISION['STARTER'], 2)

    for p_id, p_tasa in TASAS_COMISION.items():
        comis = round(valor_esperado * p_tasa, 2)
        neto = round(valor_esperado - comis, 2) # resultado = valor - porcentaje
        ahorro = round(comision_starter_base - comis, 2)

        comparativa[p_id] = {
            'planId': p_id,
            'nombre': NOMBRES_PLANES[p_id],
            'porcentajeComision': round(p_tasa * 100, 1),
            'comisionRetenida': comis,
            'gananciaNeta': neto,
            'ahorroFrenteStarter': max(0.0, ahorro),
            'esPlanActual': (p_id == plan)
        }

    return {
        'tiendaInput': {
            'planContratado': plan,
            'porcentajeComision': round(tasa_actual * 100, 1),
            'productosActivos': productos_activos,
            'visitasEstimadas': visitas,
            'ticketPromedio': ticket_promedio,
            'categoria': categoria,
            'mes': mes
        },
        'formulaAplicada': f"Ganancia Neta = Valor Ventas ({valor_esperado:,.0f} COP) - Comisión {tasa_actual*100:.0f}% ({comision_esperada:,.0f} COP)",
        # Valores principales escenario Esperado
        'comprasEstimadas': compras_esperadas,
        'valorTotalVentasEstimado': valor_esperado,
        'comisionRetenida': comision_esperada,
        'gananciaNetaEsperada': ganancia_neta_esperada, # resultado = valor - porcentaje
        'escenarios': {
            'conservador': {
                'descripcion': 'Temporada baja o inicio de catálogo',
                'compras': compras_conservador,
                'valorVentas': valor_conservador,
                'comision': comision_conservador,
                'gananciaNeta': neto_conservador
            },
            'esperado': {
                'descripcion': 'Proyección central estándar del modelo ML',
                'compras': compras_esperadas,
                'valorVentas': valor_esperado,
                'comision': comision_esperada,
                'gananciaNeta': ganancia_neta_esperada
            },
            'optimista': {
                'descripcion': 'Temporada alta o campañas promocionales activas',
                'compras': compras_optimista,
                'valorVentas': valor_optimista,
                'comision': comision_optimista,
                'gananciaNeta': neto_optimista
            }
        },
        'comparativaPlanes': comparativa
    }

def main():
    parser = argparse.ArgumentParser(description='Modelo Predictivo de Ganancias para Tiendas Mercatto')
    parser.add_argument('--plan', type=str, default='STARTER', choices=['STARTER', 'PRO', 'ELITE'], help='Plan contratado por la tienda')
    parser.add_argument('--productos', type=int, default=10, help='Cantidad de productos activos en catálogo')
    parser.add_argument('--ticket', type=float, default=120000.0, help='Ticket promedio estimado en COP')
    parser.add_argument('--visitas', type=int, default=None, help='Visitas estimadas a la tienda')
    parser.add_argument('--categoria', type=str, default='Tecnología y Electrónica', help='Categoría principal de la tienda')
    parser.add_argument('--mes', type=int, default=10, help='Mes del año (1-12)')
    parser.add_argument('--json', action='store_true', help='Imprimir salida en formato JSON')

    args = parser.parse_args()

    res = predecir_tienda(
        plan=args.plan,
        productos_activos=args.productos,
        ticket_promedio=args.ticket,
        visitas=args.visitas,
        categoria=args.categoria,
        mes=args.mes
    )

    if args.json:
        print(json.dumps(res, indent=2, ensure_ascii=False))
        return

    inp = res['tiendaInput']
    print("\n=============================================================================")
    print("        MERCATTO - MODELO PREDICTIVO DE GANANCIAS PARA TIENDAS               ")
    print("=============================================================================")
    print(f"Tienda con {inp['productosActivos']} productos en '{inp['categoria']}'")
    print(f"Plan suscrito: {inp['planContratado']} (Comisión: {inp['porcentajeComision']}%)")
    print(f"Ticket Promedio: ${inp['ticketPromedio']:,.0f} COP | Visitas: {inp['visitasEstimadas']:,}\n")

    print("-----------------------------------------------------------------------------")
    print("PROYECCIÓN MENSUAL (ESCENARIO ESPERADO / BASE)")
    print("-----------------------------------------------------------------------------")
    print(f"• Compras estimadas del mes:         {res['comprasEstimadas']:,} pedidos")
    print(f"• Valor total de ventas brutas:     ${res['valorTotalVentasEstimado']:>14,.0f} COP")
    print(f"• Retención Mercatto ({inp['porcentajeComision']}%):           -${res['comisionRetenida']:>14,.0f} COP")
    print(f"-----------------------------------------------------------------------------")
    print(f"==> RESULTADO (GANANCIA NETA):        ${res['gananciaNetaEsperada']:>14,.0f} COP")
    print(f"   [Fórmula: resultado = valor (${res['valorTotalVentasEstimado']:,.0f}) - {inp['porcentajeComision']}%]")
    print("=============================================================================\n")

    print("ESCENARIOS PREDICTIVOS:")
    for esc_nom, esc_data in res['escenarios'].items():
        print(f" - {esc_nom.upper():<12}: {esc_data['compras']:>3} pedidos | Ventas: ${esc_data['valorVentas']:>11,.0f} COP | Ganancia Neta: ${esc_data['gananciaNeta']:>11,.0f} COP")

    print("\nCOMPARATIVA POR PLAN (¿Cuánto ganas al cambiar de plan?):")
    for p_id, p_info in res['comparativaPlanes'].items():
        marca = " (ACTUAL)" if p_info['esPlanActual'] else ""
        print(f" - {p_info['nombre']}{marca} ({p_info['porcentajeComision']}% com.): Ganancia Neta = ${p_info['gananciaNeta']:,.0f} COP | Ahorro = +${p_info['ahorroFrenteStarter']:,.0f} COP")
    print("=============================================================================\n")

if __name__ == '__main__':
    main()
