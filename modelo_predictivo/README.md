# Modelo Predictivo de Ganancias para Tiendas Mercatto 📈🤖

**Proyecto de Aula:** Mercatto: Marketplace Multiproducto  
**Integrantes:** Gustavo Gonzalez, Frank Barboza, Samuel Bowden, Carlos Arellano  
**Entrega:** Noviembre 2026  

---

## 1. Problema a Resolver y Justificación
Mercatto es un marketplace multiproducto donde los vendedores publican artículos en vitrina y pagan una comisión porcentual por cada compra concretada. Dependiendo del plan de suscripción que la tienda tenga contratado, la tasa de comisión cambia:
* **Plan Starter (Gratis):** 10% de comisión por venta
* **Plan Profesional ($49.000 COP/mes):** Solo 5% de comisión por venta
* **Plan Elite Premium ($99.000 COP/mes):** Solo 2% de comisión por venta

Antes de este desarrollo, las tiendas no contaban con una herramienta de datos para anticipar cuánto dinero esperan facturar en el mes y cuál será su **ganancia neta real** tras descontar la comisión del plan contratado.

---

## 2. Formulación Matemática del Modelo (Dos Etapas)

### Etapa 1: Predicción de Demanda y Ventas Brutas (Machine Learning)
Se utiliza un ensamble supervisado **Random Forest Regressor** (seleccionado tras competir contra Regresión Lineal, Ridge y Gradient Boosting) para proyectar:
1. **$N$ (Compras estimadas):** Número de pedidos confirmados del mes.
2. **$\hat{V}$ (Valor total de ventas brutas estimadas):** Proyección monetaria en pesos colombianos ($COP$) en función de:
   * Volumen de catálogo ($productos\_activos$)
   * Tráfico y exposición ($visitas$, $carritos\_creados$)
   * Ticket promedio histórico ($ticket\_promedio$)
   * Estacionalidad comercial en Colombia (Día de la Madre, Prima de mitad de año, Black Friday, Navidad)
   * Calificación y reputación de la tienda

### Etapa 2: Deducción de Comisión según el Plan de la Tienda
A partir de la estimación de ventas brutas ($\hat{V}$) y la tasa de comisión porcentual del plan contratado ($P_{\text{plan}}$), se calcula la ganancia neta esperada aplicando estrictamente la regla del negocio:

$$\text{Comisión Retenida} = \hat{V} \times \left(\frac{P_{\text{plan}}}{100}\right)$$

$$\mathbf{\text{Resultado (Ganancia Neta Esperada)}} = \mathbf{\text{Valor}} - \mathbf{\text{Porcentaje}}$$

$$\mathbf{\text{Ganancia Neta}} = \hat{V} - \text{Comisión Retenida}$$

### Ejemplo Ilustrativo:
Para una tienda con $\hat{V} = \$ 1.744.974\text{ COP}$ estimados en el mes:
* **Con Plan Starter ($10\%$):**  
  $\text{Comisión} = \$ 1.744.974 \times 0.10 = \$ 174.497\text{ COP}$  
  $\text{Resultado} = \$ 1.744.974 - \$ 174.497 = \mathbf{\$ 1.570.477\text{ COP}}$
* **Con Plan Profesional ($5\%$):**  
  $\text{Comisión} = \$ 1.744.974 \times 0.05 = \$ 87.249\text{ COP}$  
  $\text{Resultado} = \$ 1.744.974 - \$ 87.249 = \mathbf{\$ 1.657.726\text{ COP}}$  
  *(Ahorro en comisiones: $+\$ 87.249\text{ COP extra de ganancia})$*
* **Con Plan Elite ($2\%$):**  
  $\text{Comisión} = \$ 1.744.974 \times 0.02 = \$ 34.900\text{ COP}$  
  $\text{Resultado} = \$ 1.744.974 - \$ 34.900 = \mathbf{\$ 1.710.075\text{ COP}}$  
  *(Ahorro en comisiones: $+\$ 139.598\text{ COP extra de ganancia})$*

---

## 3. Escenarios Predictivos
Para facilitar la planeación financiera y dimensionamiento de inventario de cada tienda, el modelo genera 3 escenarios:
1. **Conservador ($-25\%$):** Proyección prudente ante meses de baja demanda o etapas iniciales de la tienda.
2. **Esperado (Base):** Predicción central del modelo de Machine Learning considerando condiciones estándar de mercado.
3. **Optimista ($+35\%$):** Proyección con campañas de mercadeo activas, alta exposición o temporadas altas de comercio.

---

## 4. Estructura de Archivos del Módulo Python

```
modelo_predictivo/
├── generador_dataset.py        # Genera el historial simulado de 36 meses en CSV
├── dataset_ventas_mercatto.csv # Dataset con 2.500 registros mensuales
├── entrenar_modelo.py          # Entrenamiento, comparación de algoritmos y métricas
├── modelo_ventas.joblib        # Pipeline serializado de Random Forest
├── modelo_compras.joblib       # Pipeline serializado para estimar número de pedidos
├── metricas_evaluacion.json    # MAE, RMSE, R² y MAPE de cada modelo
├── prediccion_tienda.py        # Función de inferencia y CLI para predecir
├── api_predictiva.py           # Servidor microservicio REST con Flask (puerto 5001)
└── README.md                   # Documentación metodológica completa
```

---

## 5. Resultados de Evaluación de Modelos (Métricas)

| Modelo Evaluado | MAE (COP) | RMSE (COP) | $R^2$ Score | MAPE (%) |
| :--- | :---: | :---: | :---: | :---: |
| **Random Forest Regressor** (Ganador) | **\$ 6.920.455** | **\$ 17.195.815** | **0.8887** | **26.89%** |
| Gradient Boosting Regressor | \$ 7.179.994 | \$ 17.760.903 | 0.8813 | 26.19% |
| Ridge Regression | \$ 17.684.723 | \$ 71.052.975 | -0.8997 | 74.28% |
| Regresión Lineal Clásica | \$ 17.768.666 | \$ 71.552.818 | -0.9265 | 74.28% |

---

## 6. Instrucciones de Ejecución

### A. Ejecutar predicción desde consola (CLI):
```bash
python prediccion_tienda.py --plan STARTER --productos 8 --ticket 120000
```

Con salida en JSON estructurado:
```bash
python prediccion_tienda.py --plan PRO --productos 25 --ticket 85000 --json
```

### B. Re-entrenar los modelos con nuevos datos:
```bash
python entrenar_modelo.py
```

### C. Iniciar el microservicio API REST:
```bash
python api_predictiva.py
```
* Endpoints disponibles:
  * `GET /health`
  * `GET /api/metricas`
  * `POST /api/predict` con payload `{"plan": "PRO", "productos": 15, "ticket": 90000}`
