"""
=============================================================================
PROYECTO DE AULA: MERCATTO MARKETPLACE
MÓDULO: ENTRENAMIENTO Y EVALUACIÓN DEL MODELO PREDICTIVO
Integrantes: Gustavo Gonzalez, Frank Barboza, Samuel Bowden, Carlos Arellano
=============================================================================
Entrena y compara modelos de regresión para estimar:
 1. Número de compras mensuales (compras_mensuales)
 2. Valor total de ventas brutas (valor_total_ventas)

Y aplica la etapa 2 de deducción de comisión del plan:
  resultado (ganancia neta) = valor_total_ventas - comisión(plan)

Métricas calculadas:
 - MAE (Error Absoluto Medio)
 - RMSE (Raíz del Error Cuadrático Medio)
 - R² (Coeficiente de Determinación)
 - MAPE (Error Porcentual Absoluto Medio)
=============================================================================
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

def mape(y_true, y_pred):
    """Calcula el Error Porcentual Absoluto Medio (MAPE)."""
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    # Evitar división por cero
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100.0

def entrenar_y_evaluar():
    dir_actual = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(dir_actual, 'dataset_ventas_mercatto.csv')

    if not os.path.exists(csv_path):
        from generador_dataset import generar_dataset
        df = generar_dataset(ruta_salida=csv_path)
    else:
        df = pd.read_csv(csv_path)

    print(f"[*] Dataset cargado: {len(df)} registros.")

    # Definir variables predictoras (Features)
    feature_cols = [
        'mes',
        'temporada_alta',
        'categoria',
        'plan_suscripcion',
        'productos_activos',
        'visitas_tienda',
        'carritos_creados',
        'reputacion',
        'ticket_promedio'
    ]

    target_col = 'valor_total_ventas'
    target_compras_col = 'compras_mensuales'

    X = df[feature_cols]
    y_ventas = df[target_col]
    y_compras = df[target_compras_col]

    # Columnas numéricas y categóricas
    num_cols = ['mes', 'temporada_alta', 'productos_activos', 'visitas_tienda', 'carritos_creados', 'reputacion', 'ticket_promedio']
    cat_cols = ['categoria', 'plan_suscripcion']

    # Preprocesador
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
        ]
    )

    # Partición Train / Test (80% / 20%)
    X_train, X_test, y_train, y_test, y_compras_train, y_compras_test = train_test_split(
        X, y_ventas, y_compras, test_size=0.20, random_state=42
    )

    print(f"[*] Entrenamiento: {len(X_train)} muestras | Prueba: {len(X_test)} muestras\n")

    # Modelos candidatos a evaluar
    modelos = {
        'Regresión Lineal': LinearRegression(),
        'Ridge Regression': Ridge(alpha=1.0),
        'Random Forest': RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=42)
    }

    resultados_evaluacion = {}
    mejor_modelo = None
    mejor_r2 = -float('inf')
    mejor_pipeline = None

    print("=========================================================================================")
    print(f"{'MODELO':<22} | {'MAE (COP)':<16} | {'RMSE (COP)':<16} | {'R² SCORE':<10} | {'MAPE (%)':<8}")
    print("=========================================================================================")

    for nombre, estimator in modelos.items():
        pipe = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', estimator)
        ])

        # Entrenar en log1p para estabilizar varianzas de valores monetarios
        pipe.fit(X_train, np.log1p(y_train))

        # Predecir en escala original
        pred_log = pipe.predict(X_test)
        y_pred = np.expm1(pred_log)
        y_pred = np.clip(y_pred, a_min=10000, a_max=None)

        # Métricas
        mae_val = mean_absolute_error(y_test, y_pred)
        rmse_val = root_mean_squared_error(y_test, y_pred)
        r2_val = r2_score(y_test, y_pred)
        mape_val = mape(y_test, y_pred)

        resultados_evaluacion[nombre] = {
            'mae': float(mae_val),
            'rmse': float(rmse_val),
            'r2': float(r2_val),
            'mape': float(mape_val)
        }

        print(f"{nombre:<22} | ${mae_val:>14,.0f} | ${rmse_val:>14,.0f} | {r2_val:>9.4f} | {mape_val:>7.2f}%")

        if r2_val > mejor_r2:
            mejor_r2 = r2_val
            mejor_modelo = nombre
            mejor_pipeline = pipe

    print("=========================================================================================\n")
    print(f"[OK] Modelo ganador seleccionado: {mejor_modelo} (R² = {mejor_r2:.4f})")

    # Entrenar también modelo para estimar compras_mensuales
    pipeline_compras = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=80, max_depth=10, random_state=42))
    ])
    pipeline_compras.fit(X_train, y_compras_train)

    # Guardar artefactos
    artefacto_path = os.path.join(dir_actual, 'modelo_ventas.joblib')
    artefacto_compras_path = os.path.join(dir_actual, 'modelo_compras.joblib')
    metricas_path = os.path.join(dir_actual, 'metricas_evaluacion.json')

    joblib.dump(mejor_pipeline, artefacto_path)
    joblib.dump(pipeline_compras, artefacto_compras_path)

    with open(metricas_path, 'w', encoding='utf-8') as f:
        json.dump({
            'mejor_modelo': mejor_modelo,
            'resultados': resultados_evaluacion,
            'features': feature_cols,
            'planes_comision': {
                'STARTER': 10.0,
                'PRO': 5.0,
                'ELITE': 2.0
            }
        }, f, indent=2, ensure_ascii=False)

    print(f"[*] Pipeline de ventas guardado en: {artefacto_path}")
    print(f"[*] Pipeline de compras guardado en: {artefacto_compras_path}")
    print(f"[*] Métricas guardadas en: {metricas_path}")

    return mejor_pipeline, resultados_evaluacion

if __name__ == '__main__':
    entrenar_y_evaluar()
