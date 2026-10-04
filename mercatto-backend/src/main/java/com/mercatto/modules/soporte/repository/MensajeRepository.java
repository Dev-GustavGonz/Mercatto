package com.mercatto.modules.soporte.repository;

import com.mercatto.modules.soporte.model.Mensaje;
import com.mercatto.modules.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    
    // Todos los mensajes donde el usuario es remitente o destinatario, ordenados por fecha
    List<Mensaje> findByRemitenteOrDestinatarioOrderByFechaEnvioDesc(Usuario remitente, Usuario destinatario);
    
    // Obtener conversacion especifica entre dos usuarios
    @Query("SELECT m FROM Mensaje m WHERE (m.remitente = :u1 AND m.destinatario = :u2) OR (m.remitente = :u2 AND m.destinatario = :u1) ORDER BY m.fechaEnvio ASC")
    List<Mensaje> obtenerConversacion(Usuario u1, Usuario u2);
    
    // Todos los mensajes para moderación del Admin
    List<Mensaje> findAllByOrderByFechaEnvioDesc();
    
    // Contar mensajes no leidos
    long countByDestinatarioAndLeidoFalse(Usuario destinatario);
}
