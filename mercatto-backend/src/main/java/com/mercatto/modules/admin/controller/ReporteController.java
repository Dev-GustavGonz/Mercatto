package com.mercatto.modules.admin.controller;

import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.admin.model.Reporte;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.admin.repository.ReporteRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired private ReporteRepository reporteRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    @PostMapping
    public ResponseEntity<Reporte> crear(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Reporte r = new Reporte();
        r.setReportante(usuario);
        
        if (body.containsKey("motivo") && body.get("motivo") != null) {
            try {
                r.setMotivo(Reporte.MotivoReporte.valueOf(body.get("motivo").toString().toUpperCase()));
            } catch (Exception e) {
                r.setMotivo(Reporte.MotivoReporte.OTRO);
            }
        }
        r.setDescripcion((String) body.get("descripcion"));

        if (body.containsKey("productoId") && body.get("productoId") != null) {
            Long pId = Long.valueOf(body.get("productoId").toString());
            Producto p = productoRepo.findById(pId).orElse(null);
            r.setProducto(p);
            if (p != null) r.setVendedor(p.getVendedor());
        }

        return ResponseEntity.status(201).body(reporteRepo.save(r));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Reporte>> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "15") int tamano) {
        return ResponseEntity.ok(reporteRepo.findAll(PageRequest.of(pagina, tamano)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Reporte r = reporteRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado"));
        if (body.containsKey("estado")) {
            r.setEstado(Reporte.EstadoReporte.valueOf(body.get("estado").toUpperCase()));
        }
        if (body.containsKey("resolucionAdmin") || body.containsKey("respuestaAdmin")) {
            String resolucion = body.getOrDefault("resolucionAdmin", body.get("respuestaAdmin"));
            r.setResolucionAdmin(resolucion);
        }
        return ResponseEntity.ok(reporteRepo.save(r));
    }
}
