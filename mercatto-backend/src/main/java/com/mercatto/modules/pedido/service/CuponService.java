package com.mercatto.modules.pedido.service;

import com.mercatto.dto.request.CuponRequest;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.pedido.model.Cupon;
import com.mercatto.modules.pedido.repository.CuponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CuponService {

    @Autowired private CuponRepository cuponRepo;

    public List<Cupon> listarTodos() {
        return cuponRepo.findAll();
    }

    public Cupon validarCupon(String codigo, Double subtotal) {
        Cupon cupon = cuponRepo.findByCodigoIgnoreCaseAndActivoTrue(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Cupón '" + codigo + "' no válido o expirado"));

        if (!cupon.esValidoParaMonto(subtotal)) {
            throw new BadRequestException("El cupón no aplica para el monto actual (mínimo: $" + cupon.getMontoMinimo() + ")");
        }
        return cupon;
    }

    @Transactional
    public Cupon crear(CuponRequest req) {
        if (cuponRepo.existsByCodigoIgnoreCase(req.getCodigo())) {
            throw new BadRequestException("Ya existe un cupón con el código: " + req.getCodigo().toUpperCase());
        }

        Cupon cupon = new Cupon();
        cupon.setCodigo(req.getCodigo().toUpperCase().trim());
        if (req.getTipo() != null) {
            try {
                cupon.setTipo(Cupon.TipoCupon.valueOf(req.getTipo().toUpperCase()));
            } catch (Exception e) {
                cupon.setTipo(Cupon.TipoCupon.PORCENTAJE);
            }
        }
        cupon.setValor(req.getValor());
        cupon.setMontoMinimo(req.getMontoMinimo() != null ? req.getMontoMinimo() : 0.0);
        cupon.setDescuentoMaximo(req.getDescuentoMaximo());
        cupon.setUsosMaximos(req.getUsosMaximos());
        cupon.setFechaInicio(req.getFechaInicio());
        cupon.setFechaFin(req.getFechaFin());
        cupon.setActivo(req.isActivo());

        return cuponRepo.save(cupon);
    }

    @Transactional
    public void eliminar(Long id) {
        Cupon c = cuponRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cupón no encontrado"));
        cuponRepo.delete(c);
    }
}
