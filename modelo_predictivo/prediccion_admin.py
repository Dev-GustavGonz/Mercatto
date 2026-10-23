"""
=============================================================================
PROYECTO DE AULA: MERCATTO MARKETPLACE
MÓDULO: MOTOR DE INFERENCIA PREDICTIVA PARA EL ADMINISTRADOR (PLATAFORMA)
Integrantes: Gustavo Gonzalez, Frank Barboza, Samuel Bowden, Carlos Arellano
=============================================================================
Estima para la plataforma Mercatto y el Administrador:
 1. Volumen total de ventas brutas del Marketplace (GMV)
 2. Número total de compras proyectadas
 3. Ganancias de la plataforma divididas en dos fuentes de monetización:
      A) Comisión por venta según el plan de cada tienda/empresa:
           - STARTER: 10% de comisión por venta
           - PRO:      5% de comisión por venta
           - ELITE:    2% de comisión por venta
      B) Ingresos recurrentes por suscripción a planes mensuales de los vendedores:
           - STARTER: $0 COP / mes (Gratis)
           - PRO:     $49.000 COP / mes
           - ELITE:   $99.000 COP / mes
 4. Ganancia Neta Total Mercatto = Total Comisiones + Total Suscripciones Mensuales
 5. Monto total a liquidar a las tiendas = Ventas Brutas - Comisiones
 6. Escenarios predictivos: Conservador (-25%), Esperado (Central ML) y Optimista (+35%)
 7. Simulador interactivo de crecimiento y migración de planes
=============================================================================
"""

import os
import sys
import json
import argparse
import numpy as np

# Reutilizar el cargador de modelos y estimador por tienda de prediccion_tienda
from prediccion_tienda import predecir_tienda, TASAS_COMISION, NOMBRES_PLANES

# Precios mensuales de las membresías de los vendedores (COP)
PRECIOS_MENSUALES_PLAN = {
    'STARTER': 0.0,
    'PRO': 49000.0,
    'ELITE': 99000.0
}

def predecir_administrador(
    tiendas_starter=5,
    tiendas_pro=3,
    tiendas_elite=2,
    ticket_promedio=120000.0,
    productos_promedio_starter=8,
    productos_promedio_pro=25,
    productos_promedio_elite=60,
    mes=10
):
    """
    Calcula la proyección financiera global del Marketplace para el administrador,
    combinando la inferencia ML por plan con las reglas de monetización de comisiones
    y suscripciones mensuales.
    """
    tiendas_starter = max(0, int(tiendas_starter))
    tiendas_pro = max(0, int(tiendas_pro))
    tiendas_elite = max(0, int(tiendas_elite))
    total_tiendas = tiendas_starter + tiendas_pro + tiendas_elite

    if total_tiendas == 0:
        total_tiendas = 1
        tiendas_starter = 1

    # Inferencia ML representativa por categoría de plan
    pred_starter = predecir_tienda(
        plan='STARTER',
        productos_activos=productos_promedio_starter,
        ticket_promedio=ticket_promedio,
        mes=mes
    )
    pred_pro = predecir_tienda(
        plan='PRO',
        productos_activos=productos_promedio_pro,
        ticket_promedio=ticket_promedio,
        mes=mes
    )
    pred_elite = predecir_tienda(
        plan='ELITE',
        productos_activos=productos_promedio_elite,
        ticket_promedio=ticket_promedio,
        mes=mes
    )

    planes_data = {
        'STARTER': {
            'cantidad_tiendas': tiendas_starter,
            'tasa_comision': TASAS_COMISION['STARTER'],
            'porcentaje_comision': 10.0,
            'cuota_mensual': PRECIOS_MENSUALES_PLAN['STARTER'],
            'pred_unitaria': pred_starter
        },
        'PRO': {
            'cantidad_tiendas': tiendas_pro,
            'tasa_comision': TASAS_COMISION['PRO'],
            'porcentaje_comision': 5.0,
            'cuota_mensual': PRECIOS_MENSUALES_PLAN['PRO'],
            'pred_unitaria': pred_pro
        },
        'ELITE': {
            'cantidad_tiendas': tiendas_elite,
            'tasa_comision': TASAS_COMISION['ELITE'],
            'porcentaje_comision': 2.0,
            'cuota_mensual': PRECIOS_MENSUALES_PLAN['ELITE'],
            'pred_unitaria': pred_elite
        }
    }

    # Desglose por plan
    desglose_planes = {}
    ventas_totales_esperadas = 0.0
    compras_totales_esperadas = 0
    comisiones_totales_esperadas = 0.0
    suscripciones_totales = 0.0

    for plan_key, p_info in planes_data.items():
        qty = p_info['cantidad_tiendas']
        ventas_plan = round(p_info['pred_unitaria']['valorTotalVentasEstimado'] * qty, 2)
        compras_plan = int(p_info['pred_unitaria']['comprasEstimadas'] * qty)
        comision_plan = round(ventas_plan * p_info['tasa_comision'], 2)
        suscripcion_plan = round(qty * p_info['cuota_mensual'], 2)
        ganancia_admin_plan = round(comision_plan + suscripcion_plan, 2)
        liquidacion_tiendas_plan = round(ventas_plan - comision_plan, 2)

        desglose_planes[plan_key] = {
            'plan': plan_key,
            'nombre': NOMBRES_PLANES[plan_key],
            'cantidadTiendas': qty,
            'porcentajeComision': p_info['porcentaje_comision'],
            'cuotaMensualPlan': p_info['cuota_mensual'],
            'ventasBrutasEstimadas': ventas_plan,
            'comprasEstimadas': compras_plan,
            'comisionesVentas': comision_plan,
            'ingresosSuscripciones': suscripcion_plan,
            'gananciaTotalPlataforma': ganancia_admin_plan,
            'aLiquidarTiendas': liquidacion_tiendas_plan
        }

        ventas_totales_esperadas += ventas_plan
        compras_totales_esperadas += compras_plan
        comisiones_totales_esperadas += comision_plan
        suscripciones_totales += suscripcion_plan

    ganancia_neta_admin_esperada = round(comisiones_totales_esperadas + suscripciones_totales, 2)
    total_a_liquidar_esperado = round(ventas_totales_esperadas - comisiones_totales_esperadas, 2)

    # -----------------------------------------------------------------------
    # ESCENARIOS PREDICTIVOS: Conservador (-25% en ventas), Base, Optimista (+35%)
    # Las suscripciones mensuales son ingresos fijos recurrentes (MRR)
    # -----------------------------------------------------------------------
    # 1. Conservador
    ventas_conservador = round(ventas_totales_esperadas * 0.75, 2)
    compras_conservador = max(1, int(round(compras_totales_esperadas * 0.75)))
    comisiones_conservador = round(comisiones_totales_esperadas * 0.75, 2)
    ganancia_admin_conservador = round(comisiones_conservador + suscripciones_totales, 2)
    liquidar_conservador = round(ventas_conservador - comisiones_conservador, 2)

    # 2. Optimista
    ventas_optimista = round(ventas_totales_esperadas * 1.35, 2)
    compras_optimista = int(round(compras_totales_esperadas * 1.35))
    comisiones_optimista = round(comisiones_totales_esperadas * 1.35, 2)
    ganancia_admin_optimista = round(comisiones_optimista + suscripciones_totales, 2)
    liquidar_optimista = round(ventas_optimista - comisiones_optimista, 2)

    # Margen porcentual de la plataforma
    margen_plataforma = round((ganancia_neta_admin_esperada / max(1.0, ventas_totales_esperadas)) * 100, 2)

    return {
        'adminInput': {
            'totalTiendas': total_tiendas,
            'tiendasStarter': tiendas_starter,
            'tiendasPro': tiendas_pro,
            'tiendasElite': tiendas_elite,
            'ticketPromedio': ticket_promedio,
            'mes': mes
        },
        'formulaMonetizacion': "Ganancia Plataforma = Comisiones de Venta por Plan (Starter 10%, Pro 5%, Elite 2%) + Suscripciones Mensuales (Pro $49.000, Elite $99.000)",
        # Valores Escenario Esperado (Base ML)
        'ventasTotalesMarketplace': ventas_totales_esperadas,
        'comprasTotalesMarketplace': compras_totales_esperadas,
        'comisionesTotalesVentas': comisiones_totales_esperadas,
        'ingresosTotalesSuscripciones': suscripciones_totales,
        'gananciaNetaAdmin': ganancia_neta_admin_esperada,
        'totalALiquidarTiendas': total_a_liquidar_esperado,
        'margenEfectivoPlataforma': margen_plataforma,
        'desglosePorPlan': desglose_planes,
        'escenarios': {
            'conservador': {
                'descripcion': 'Baja estacionalidad comercial (-25% en ventas)',
                'ventas': ventas_conservador,
                'compras': compras_conservador,
                'comisiones': comisiones_conservador,
                'suscripciones': suscripciones_totales,
                'gananciaAdmin': ganancia_admin_conservador,
                'aLiquidar': liquidar_conservador
            },
            'esperado': {
                'descripcion': 'Proyección central del modelo estadístico ML',
                'ventas': ventas_totales_esperadas,
                'compras': compras_totales_esperadas,
                'comisiones': comisiones_totales_esperadas,
                'suscripciones': suscripciones_totales,
                'gananciaAdmin': ganancia_neta_admin_esperada,
                'aLiquidar': total_a_liquidar_esperado
            },
            'optimista': {
                'descripcion': 'Temporadas comerciales altas (+35% en ventas)',
                'ventas': ventas_optimista,
                'compras': compras_optimista,
                'comisiones': comisiones_optimista,
                'suscripciones': suscripciones_totales,
                'gananciaAdmin': ganancia_admin_optimista,
                'aLiquidar': liquidar_optimista
            }
        }
    }

def main():
    parser = argparse.ArgumentParser(description='Modelo Predictivo de Ganancias para el Administrador Mercatto')
    parser.add_argument('--starter', type=int, default=5, help='Número de tiendas con Plan Starter')
    parser.add_argument('--pro', type=int, default=3, help='Número de tiendas con Plan Pro')
    parser.add_argument('--elite', type=int, default=2, help='Número de tiendas con Plan Elite')
    parser.add_argument('--ticket', type=float, default=120000.0, help='Ticket promedio marketplace en COP')
    parser.add_argument('--mes', type=int, default=10, help='Mes del año (1-12)')
    parser.add_argument('--json', action='store_true', help='Imprimir salida en formato JSON')

    args = parser.parse_args()

    res = predecir_administrador(
        tiendas_starter=args.starter,
        tiendas_pro=args.pro,
        tiendas_elite=args.elite,
        ticket_promedio=args.ticket,
        mes=args.mes
    )

    if args.json:
        print(json.dumps(res, indent=2, ensure_ascii=False))
        return

    inp = res['adminInput']
    print("\n=============================================================================")
    print("      MERCATTO - MODELO PREDICTIVO FINANCIERO PARA EL ADMINISTRADOR          ")
    print("=============================================================================")
    print(f"Ecosistema: {inp['totalTiendas']} Tiendas ({inp['tiendasStarter']} Starter | {inp['tiendasPro']} Pro | {inp['tiendasElite']} Elite)")
    print(f"Ticket Promedio: ${inp['ticketPromedio']:,.0f} COP | Mes: {inp['mes']}\n")

    print("-----------------------------------------------------------------------------")
    print("PROYECCIÓN MENSUAL DEL MARKETPLACE (ESCENARIO ESPERADO / BASE)")
    print("-----------------------------------------------------------------------------")
    print(f"• Ventas brutas totales (GMV):      ${res['ventasTotalesMarketplace']:>14,.0f} COP")
    print(f"• Pedidos totales proyectados:       {res['comprasTotalesMarketplace']:>14,} órdenes")
    print(f"• Comisiones por ventas retenidas:  +${res['comisionesTotalesVentas']:>14,.0f} COP")
    print(f"• Ingresos por planes mensuales:    +${res['ingresosTotalesSuscripciones']:>14,.0f} COP")
    print(f"-----------------------------------------------------------------------------")
    print(f"==> GANANCIA NETA ADMINISTRADOR:     ${res['gananciaNetaAdmin']:>14,.0f} COP (Margen: {res['margenEfectivoPlataforma']}%)")
    print(f"==> A LIQUIDAR A TIENDAS VENDEDORAS: ${res['totalALiquidarTiendas']:>14,.0f} COP")
    print("=============================================================================\n")

    print("DESGLOSE POR TIPO DE PLAN:")
    for p_id, p_data in res['desglosePorPlan'].items():
        print(f" - {p_data['nombre'].upper():<20} ({p_data['cantidadTiendas']} tiendas | {p_data['porcentajeComision']}% com. | ${p_data['cuotaMensualPlan']:,.0f}/mes):")
        print(f"     Ventas: ${p_data['ventasBrutasEstimadas']:,.0f} | Comisiones: ${p_data['comisionesVentas']:,.0f} | Suscripciones: ${p_data['ingresosSuscripciones']:,.0f} | Ganancia: ${p_data['gananciaTotalPlataforma']:,.0f}")

    print("\nESCENARIOS PREDICTIVOS DEL MARKETPLACE:")
    for esc_nom, esc_data in res['escenarios'].items():
        print(f" - {esc_nom.upper():<12}: Ventas: ${esc_data['ventas']:>12,.0f} COP | Comisiones: ${esc_data['comisiones']:>10,.0f} | Suscripciones: ${esc_data['suscripciones']:>8,.0f} | Ganancia Admin: ${esc_data['gananciaAdmin']:>10,.0f} COP")
    print("=============================================================================\n")

if __name__ == '__main__':
    main()
