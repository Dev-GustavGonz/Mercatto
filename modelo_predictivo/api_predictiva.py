"""
=============================================================================
PROYECTO DE AULA: MERCATTO MARKETPLACE
API REST PREDICTIVA EN PYTHON (FLASK)
Integrantes: Gustavo Gonzalez, Frank Barboza, Samuel Bowden, Carlos Arellano
=============================================================================
Expone endpoints REST para que el frontend de Mercatto y el backend Spring Boot
consulten el modelo predictivo de Machine Learning y la regla de negocio:
  resultado = valor - porcentaje
=============================================================================
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from prediccion_tienda import predecir_tienda

app = Flask(__name__)
CORS(app) # Habilita llamadas desde React en Vite

DIR_ACTUAL = os.path.dirname(os.path.abspath(__file__))
METRICAS_PATH = os.path.join(DIR_ACTUAL, 'metricas_evaluacion.json')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'servicio': 'Mercatto Python Predictive AI',
        'version': '1.0.0',
        'integrantes': [
            'Gustavo Gonzalez',
            'Frank Barboza',
            'Samuel Bowden',
            'Carlos Arellano'
        ]
    })

@app.route('/api/metricas', methods=['GET'])
def metricas():
    if os.path.exists(METRICAS_PATH):
        with open(METRICAS_PATH, 'r', encoding='utf-8') as f:
            datos = json.load(f)
        return jsonify(datos)
    return jsonify({'error': 'Métricas aún no generadas'}), 404

@app.route('/api/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
    else:
        data = request.args.to_dict()

    plan = str(data.get('plan', data.get('plan_suscripcion', 'STARTER'))).upper()
    try:
        productos = int(data.get('productos', data.get('productos_activos', 10)))
    except (ValueError, TypeError):
        productos = 10

    try:
        ticket = float(data.get('ticket', data.get('ticket_promedio', 120000.0)))
    except (ValueError, TypeError):
        ticket = 120000.0

    visitas = data.get('visitas')
    if visitas is not None:
        try:
            visitas = int(visitas)
        except (ValueError, TypeError):
            visitas = None

    categoria = str(data.get('categoria', 'Tecnología y Electrónica'))
    try:
        mes = int(data.get('mes', 10))
    except (ValueError, TypeError):
        mes = 10

    try:
        reputacion = float(data.get('reputacion', 5.0))
    except (ValueError, TypeError):
        reputacion = 5.0

    resultado = predecir_tienda(
        plan=plan,
        productos_activos=productos,
        ticket_promedio=ticket,
        visitas=visitas,
        categoria=categoria,
        mes=mes,
        reputacion=reputacion
    )

    return jsonify(resultado)

if __name__ == '__main__':
    puerto = int(os.environ.get('PORT', 5001))
    print(f"[*] Servidor API predictiva Mercatto escuchando en http://localhost:{puerto}")
    app.run(host='0.0.0.0', port=puerto, debug=False)
