import { Client } from '@stomp/stompjs'

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = false
    this.subscriptions = new Map()
  }

  conectar(onConnectCallback = null) {
    if (this.client && this.client.active) {
      if (onConnectCallback) onConnectCallback()
      return
    }

    // Usa WebSocket nativo del navegador (estándar moderno, sin dependencias de Node ni global is not defined)
    const brokerURL = 'ws://localhost:8080/ws-chat'

    this.client = new Client({
      brokerURL: brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true
        if (onConnectCallback) onConnectCallback()
      },
      onDisconnect: () => {
        this.connected = false
      },
      onStompError: (frame) => {
        console.warn('STOMP info:', frame?.headers?.message || frame)
      },
      onWebSocketError: (event) => {
        console.warn('WebSocket connection note:', event)
      }
    })

    this.client.activate()
  }

  suscribir(topic, onMessageCallback) {
    if (!this.client) {
      this.conectar(() => this.suscribir(topic, onMessageCallback))
      return () => {}
    }

    if (!this.connected) {
      const checkConnect = setInterval(() => {
        if (this.connected && this.client) {
          clearInterval(checkConnect)
          this.suscribir(topic, onMessageCallback)
        }
      }, 300)
      return () => clearInterval(checkConnect)
    }

    const sub = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body)
        onMessageCallback(payload)
      } catch (e) {
        onMessageCallback(message.body)
      }
    })

    this.subscriptions.set(topic, sub)

    return () => {
      try {
        sub.unsubscribe()
        this.subscriptions.delete(topic)
      } catch (e) {
        // silencioso
      }
    }
  }

  desconectar() {
    if (this.client) {
      this.client.deactivate()
      this.connected = false
      this.client = null
    }
  }
}

export const wsService = new WebSocketService()
export default wsService
