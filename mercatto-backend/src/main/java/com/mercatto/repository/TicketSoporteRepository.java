package com.mercatto.repository;

import com.mercatto.model.TicketSoporte;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketSoporteRepository extends JpaRepository<TicketSoporte, Long> {
    Page<TicketSoporte> findByEstado(TicketSoporte.EstadoTicket estado, Pageable pageable);
    long countByEstado(TicketSoporte.EstadoTicket estado);
}
