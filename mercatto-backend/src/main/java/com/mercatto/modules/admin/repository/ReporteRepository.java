package com.mercatto.modules.admin.repository;

import com.mercatto.modules.admin.model.Reporte;
import com.mercatto.modules.usuario.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    Page<Reporte> findByReportanteOrderByFechaCreacionDesc(Usuario reportante, Pageable pageable);
    Page<Reporte> findByEstadoOrderByFechaCreacionDesc(Reporte.EstadoReporte estado, Pageable pageable);
    long countByEstado(Reporte.EstadoReporte estado);
}
