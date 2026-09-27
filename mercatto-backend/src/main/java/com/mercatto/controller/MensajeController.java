package com.mercatto.controller;

import com.mercatto.dto.request.MensajeRequest;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.model.Mensaje;
import com.mercatto.model.Producto;
import com.mercatto.model.Usuario;
import com.mercatto.model.Vendedor;
import com.mercatto.repository.MensajeRepository;
import com.mercatto.repository.ProductoRepository;
import com.mercatto.repository.UsuarioRepository;
import com.mercatto.repository.VendedorRepository;
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
            if (remitente.getTokensChat() <= 0) {
                throw new BadRequestException("No tienes tokens suficientes para enviar este mensaje. Recarga tu saldo.");
            }
            
            // Verificar si el destinatario (Vendedor) tiene suscripción activa para recibir mensajes
            Vendedor vendedorDestino = vendedorRepo.findByUsuarioId(destinatario.getId()).orElse(null);
            if (vendedorDestino != null) {
                if (vendedorDestino.getTipoSuscripcion() == Vendedor.TipoSuscripcion.STARTER || 
                   (vendedorDestino.getFechaExpiracionSuscripcion() != null && vendedorDestino.getFechaExpiracionSuscripcion().isBefore(LocalDateTime.now()))) {
                    throw new BadRequestException("Este vendedor no tiene habilitada la mensajería actualmente.");
                }
            }

            // Descontar token
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
        return ResponseEntity.ok(guardado);
    }

    @GetMapping("/conversacion/{otroUsuarioId}")
    public ResponseEntity<List<Mensaje>> obtenerConversacion(
            @PathVariable Long otroUsuarioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Usuario yo = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Usuario otro = usuarioRepo.findById(otroUsuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Mensaje> conversacion = mensajeRepo.obtenerConversacion(yo, otro);
        
        // Marcar como leídos los que yo recibí
        boolean actualizados = false;
        for (Mensaje m : conversacion) {
            if (m.getDestinatario().getId().equals(yo.getId()) && !m.isLeido()) {
                m.setLeido(true);
                mensajeRepo.save(m);
                actualizados = true;
            }
        }

        return ResponseEntity.ok(conversacion);
    }

    @GetMapping("/contactos")
    public ResponseEntity<List<Map<String, Object>>> obtenerContactos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario yo = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        List<Mensaje> todosMisMensajes = mensajeRepo.findByRemitenteOrDestinatarioOrderByFechaEnvioDesc(yo, yo);

        // Agrupar por el otro usuario
        Map<Long, Map<String, Object>> contactos = new HashMap<>();

        for (Mensaje m : todosMisMensajes) {
            Usuario otro = m.getRemitente().getId().equals(yo.getId()) ? m.getDestinatario() : m.getRemitente();
            
            if (!contactos.containsKey(otro.getId())) {
                Map<String, Object> info = new HashMap<>();
                info.put("usuario", otro);
                info.put("ultimoMensaje", m.getContenido());
                info.put("fechaUltimoMensaje", m.getFechaEnvio());
                // Contar no leídos de esta persona hacia mi
                long noLeidos = todosMisMensajes.stream()
                        .filter(msg -> msg.getRemitente().getId().equals(otro.getId()) && msg.getDestinatario().getId().equals(yo.getId()) && !msg.isLeido())
                        .count();
                info.put("noLeidos", noLeidos);
                contactos.put(otro.getId(), info);
            }
        }

        // Convertir mapa a lista y ordenar por fecha (el hashmap no garantiza orden)
        List<Map<String, Object>> result = new ArrayList<>(contactos.values());
        result.sort((a, b) -> ((LocalDateTime) b.get("fechaUltimoMensaje")).compareTo((LocalDateTime) a.get("fechaUltimoMensaje")));

        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/tokens/recargar")
    public ResponseEntity<Map<String, String>> recargarTokens(
            @RequestParam Integer cantidad,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario yo = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        // Simulamos la compra exitosa
        yo.setTokensChat(yo.getTokensChat() + cantidad);
        usuarioRepo.save(yo);
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Has recargado " + cantidad + " tokens exitosamente.");
        response.put("tokensRestantes", yo.getTokensChat().toString());
        return ResponseEntity.ok(response);
    }
}
