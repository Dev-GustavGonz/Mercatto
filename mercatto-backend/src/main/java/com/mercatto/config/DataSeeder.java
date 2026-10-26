package com.mercatto.config;

import com.mercatto.modules.pedido.model.Cupon;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.pedido.repository.CuponRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, 
                                      VendedorRepository vendedorRepository,
                                      CuponRepository cuponRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            // Asegurar Admin inicial
            Usuario admin = usuarioRepository.findByEmail("admin@mercatto.com").orElseGet(() -> {
                Usuario u = new Usuario();
                u.setEmail("admin@mercatto.com");
                u.setNombre("Administrador");
                u.setRol(Usuario.Rol.ADMIN);
                u.setActivo(true);
                u.setEmailVerificado(true);
                return u;
            });
            admin.setPassword(passwordEncoder.encode("123456"));
            usuarioRepository.save(admin);

            // Eliminar usuarios y tiendas de prueba previos de la base de datos
            usuarioRepository.findByEmail("vendedor@mercatto.com").ifPresent(v -> {
                vendedorRepository.findByUsuario(v).ifPresent(vendedorRepository::delete);
                usuarioRepository.delete(v);
            });
            usuarioRepository.findByEmail("comprador@mercatto.com").ifPresent(usuarioRepository::delete);

            // Asegurar Cupones del Marketplace
            if (cuponRepository.findByCodigoIgnoreCaseAndActivoTrue("MERCATTO10").isEmpty()) {
                Cupon c1 = new Cupon();
                c1.setCodigo("MERCATTO10");
                c1.setDescripcion("10% de descuento en tu compra");
                c1.setTipo(Cupon.TipoCupon.PORCENTAJE);
                c1.setValor(10.0);
                c1.setMontoMinimo(30000.0);
                c1.setDescuentoMaximo(50000.0);
                c1.setActivo(true);
                cuponRepository.save(c1);
            }

            if (cuponRepository.findByCodigoIgnoreCaseAndActivoTrue("BIENVENIDA").isEmpty()) {
                Cupon c2 = new Cupon();
                c2.setCodigo("BIENVENIDA");
                c2.setDescripcion("$20.000 COP de regalo en compras mayores a $100.000");
                c2.setTipo(Cupon.TipoCupon.MONTO_FIJO);
                c2.setValor(20000.0);
                c2.setMontoMinimo(100000.0);
                c2.setActivo(true);
                cuponRepository.save(c2);
            }
        };
    }
}
