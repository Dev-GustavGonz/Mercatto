package com.mercatto.config;

import com.mercatto.model.Cupon;
import com.mercatto.model.Usuario;
import com.mercatto.model.Vendedor;
import com.mercatto.repository.CuponRepository;
import com.mercatto.repository.UsuarioRepository;
import com.mercatto.repository.VendedorRepository;
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
            // Asegurar Admin
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

            // Asegurar Vendedor
            Usuario vendedorUser = usuarioRepository.findByEmail("vendedor@mercatto.com").orElseGet(() -> {
                Usuario u = new Usuario();
                u.setEmail("vendedor@mercatto.com");
                u.setNombre("Vendedor Prueba");
                u.setRol(Usuario.Rol.VENDEDOR);
                u.setActivo(true);
                u.setEmailVerificado(true);
                return u;
            });
            vendedorUser.setPassword(passwordEncoder.encode("123456"));
            vendedorUser = usuarioRepository.save(vendedorUser);

            if (vendedorRepository.findByUsuario(vendedorUser).isEmpty()) {
                Vendedor perfilVendedor = new Vendedor();
                perfilVendedor.setUsuario(vendedorUser);
                perfilVendedor.setNombreTienda("Tienda de Prueba");
                perfilVendedor.setTipo(Vendedor.Tipo.PERSONA_NATURAL);
                perfilVendedor.setEstado(Vendedor.Estado.APROBADO);
                perfilVendedor.setTipoSuscripcion(Vendedor.TipoSuscripcion.PRO);
                vendedorRepository.save(perfilVendedor);
            }

            // Asegurar Comprador
            Usuario comprador = usuarioRepository.findByEmail("comprador@mercatto.com").orElseGet(() -> {
                Usuario u = new Usuario();
                u.setEmail("comprador@mercatto.com");
                u.setNombre("Comprador Prueba");
                u.setRol(Usuario.Rol.COMPRADOR);
                u.setActivo(true);
                u.setEmailVerificado(true);
                return u;
            });
            comprador.setPassword(passwordEncoder.encode("123456"));
            comprador.setTokensChat(25);
            usuarioRepository.save(comprador);

            // Asegurar Cupones de Demostración
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

            System.out.println("=========================================");
            System.out.println("USUARIOS Y CUPONES DE PRUEBA ACTIVADOS");
            System.out.println("Admin: admin@mercatto.com / 123456");
            System.out.println("Vendedor: vendedor@mercatto.com / 123456");
            System.out.println("Comprador: comprador@mercatto.com / 123456 (25 Tokens)");
            System.out.println("Cupones listos: 'MERCATTO10' y 'BIENVENIDA'");
            System.out.println("=========================================");
        };
    }
}
