package com.mercatto.modules.soporte.controller;

import com.mercatto.dto.request.MensajeRequest;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.soporte.model.Mensaje;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.soporte.repository.MensajeRepository;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    @Autowired private MensajeRepository mensajeRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private VendedorRepository vendedorRepo;
    @Autowired private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<Mensaje> enviarMensaje(
            @Valid @RequestBody MensajeRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Usuario remitente = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Usuario destinatario = usuarioRepo.findById(req.getDestinatarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Destinatario no encontrado"));

        Producto producto = null;
        if (req.getProductoId() != null) {
            producto = productoRepo.findById(req.getProductoId()).orElse(null);
        }

        // --- LÓGICA DE NEGOCIO: TOKENS Y SUSCRIPCIONES ---
        
        // Si el remitente es un COMPRADOR, cobramos un Token
        if (remitente.getRol() == Usuario.Rol.COMPRADOR) {
            if (remitente.getTokensChat() == null || remitente.getTokensChat() <= 0) {
                throw new BadRequestException("No tienes tokens suficientes para enviar este mensaje. Recarga tu saldo de tokens para chatear.");
            }
            
            // Descontar token al comprador
            remitente.setTokensChat(remitente.getTokensChat() - 1);
            usuarioRepo.save(remitente);
        }

        // Crear y guardar mensaje
        Mensaje m = new Mensaje();
        m.setRemitente(remitente);
        m.setDestinatario(destinatario);
        m.setProducto(producto);
        m.setContenido(req.getContenido());
        
        Mensaje guardado = mensajeRepo.save(m);

        // --- EMISIÓN EN TIEMPO REAL VÍA WEBSOCKET (STOMP) ---
        try {
            // Canal del destinatario (notificación y nuevo mensaje en su chat)
            messagingTemplate.convertAndSend("/topic/mensajes/" + destinatario.getId(), guardado);
            // Canal del remitente (para sincronización multi-pestaña)
            messagingTemplate.convertAndSend("/topic/mensajes/" + remitente.getId(), guardado);
            // Canal global de supervisión para el Super Admin
            messagingTemplate.convertAndSend("/topic/mensajes/admin", guardado);
        } catch (Exception ex) {
            // No bloquear la respuesta HTTP si el socket tiene algún fallo de transporte temporal
            System.err.println("Aviso: No se pudo emitir mensaje por WebSocket: " + ex.getMessage());
        }

        return ResponseEntity.ok(guardado);
    }

    @GetMapping("/conversacion/{otroUsuarioId}")
    public ResponseEntity<List<Mensaje>> obtenerConversacion(
            @PathVariable Long otroUsuarioId,
            @RequestParam(required = false) Long remitenteId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Usuario yo = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Usuario otro = usuarioRepo.findById(otroUsuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Mensaje> conversacion;
        
        // Si el usuario es ADMIN y viene un remitenteId específico (auditoría entre dos usuarios de la plataforma)
        if (yo.getRol() == Usuario.Rol.ADMIN && remitenteId != null) {
            Usuario u1 = usuarioRepo.findById(remitenteId).orElse(yo);
            conversacion = mensajeRepo.obtenerConversacion(u1, otro);
        } else {
            conversacion = mensajeRepo.obtenerConversacion(yo, otro);
            // Marcar como leídos los que yo recibí
            for (Mensaje m : conversacion) {
                if (m.getDestinatario().getId().equals(yo.getId()) && !m.isLeido()) {
                    m.setLeido(true);
                    mensajeRepo.save(m);
                }
            }
        }

        return ResponseEntity.ok(conversacion);
    }

    @GetMapping("/contactos")
    public ResponseEntity<List<Map<String, Object>>> obtenerContactos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario yo = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        
        // Si es ADMIN, recopila todos los mensajes del marketplace para supervisión y moderación
        List<Mensaje> listaMensajes = (yo.getRol() == Usuario.Rol.ADMIN)
                ? mensajeRepo.findAllByOrderByFechaEnvioDesc()
                : mensajeRepo.findByRemitenteOrDestinatarioOrderByFechaEnvioDesc(yo, yo);

        // Agrupar contactos
        Map<String, Map<String, Object>> contactos = new HashMap<>();

        for (Mensaje m : listaMensajes) {
            Usuario otro;
            String key;
            
            if (yo.getRol() == Usuario.Rol.ADMIN) {
                // En modo admin, la clave representa la conversación entre el par (u1, u2)
                long idMin = Math.min(m.getRemitente().getId(), m.getDestinatario().getId());
                long idMax = Math.max(m.getRemitente().getId(), m.getDestinatario().getId());
                key = idMin + "_" + idMax;
                otro = m.getRemitente();
            } else {
                otro = m.getRemitente().getId().equals(yo.getId()) ? m.getDestinatario() : m.getRemitente();
                key = otro.getId().toString();
            }
            
            if (!contactos.containsKey(key)) {
                Map<String, Object> info = new HashMap<>();
                Map<String, Object> uMap = new HashMap<>();
                
                if (yo.getRol() == Usuario.Rol.ADMIN) {
                    uMap.put("id", m.getDestinatario().getId()); // ID del destinatario
                    uMap.put("nombre", m.getRemitente().getNombre() + " y " + m.getDestinatario().getNombre());
                    uMap.put("email", m.getDestinatario().getEmail());
                    uMap.put("rol", "SUPERVISION");
                    uMap.put("fotoPerfil", null);
                } else {
                    uMap.put("id", otro.getId());
                    uMap.put("nombre", otro.getNombre());
                    uMap.put("email", otro.getEmail());
                    uMap.put("rol", otro.getRol() != null ? otro.getRol().name() : "COMPRADOR");
                    uMap.put("fotoPerfil", otro.getFotoPerfil());
                }
                
                info.put("usuario", uMap);
                info.put("remitenteId", m.getRemitente().getId());
                info.put("destinatarioId", m.getDestinatario().getId());
                info.put("remitenteNombre", m.getRemitente().getNombre());
                info.put("destinatarioNombre", m.getDestinatario().getNombre());
                info.put("ultimoMensaje", m.getContenido());
                info.put("fechaUltimoMensaje", m.getFechaEnvio());
                
                // Contar no leídos
                long noLeidos = listaMensajes.stream()
                        .filter(msg -> msg.getRemitente().getId().equals(otro.getId()) && msg.getDestinatario().getId().equals(yo.getId()) && !msg.isLeido())
                        .count();
                info.put("noLeidos", noLeidos);
                contactos.put(key, info);
            }
        }

        // Convertir mapa a lista y ordenar por fecha más reciente
        List<Map<String, Object>> result = new ArrayList<>(contactos.values());
        result.sort((a, b) -> ((LocalDateTime) b.get("fechaUltimoMensaje")).compareTo((LocalDateTime) a.get("fechaUltimoMensaje")));

        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/tokens/saldo")
    public ResponseEntity<Map<String, Object>> obtenerSaldoTokens(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario yo = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        int saldo = yo.getTokensChat() != null ? yo.getTokensChat() : 0;
        return ResponseEntity.ok(Map.of(
            "tokensRestantes", saldo,
            "email", yo.getEmail()
        ));
    }
    
    @PostMapping("/tokens/recargar")
    public ResponseEntity<Map<String, Object>> recargarTokens(
            @RequestParam(required = false, defaultValue = "10") Integer cantidad,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario yo = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        int actual = yo.getTokensChat() != null ? yo.getTokensChat() : 0;
        yo.setTokensChat(actual + cantidad);
        usuarioRepo.save(yo);
        
        Map<String, Object> response = new HashMap<>();
        response.put("exito", true);
        response.put("mensaje", "¡Recarga exitosa! Has añadido " + cantidad + " tokens a tu cuenta.");
        response.put("tokensRestantes", yo.getTokensChat());
        return ResponseEntity.ok(response);
    }
}
