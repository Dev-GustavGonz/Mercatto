package com.mercatto.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    private static final Logger log = LoggerFactory.getLogger(MailConfig.class);

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:realmercatto@gmail.com}")
    private String username;

    @Value("${spring.mail.password:dkbqehynobdnxuag}")
    private String password;

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        String safeHost = host != null && !host.isBlank() ? host.trim() : "smtp.gmail.com";
        mailSender.setHost(safeHost);

        int effectivePort = port > 0 ? port : 587;
        // Gmail SMTP solo escucha en 587 (STARTTLS) y 465 (SSL). El puerto 2525 lo rechaza.
        if ("smtp.gmail.com".equalsIgnoreCase(safeHost) && effectivePort == 2525) {
            log.warn("Gmail (smtp.gmail.com) NO soporta el puerto 2525. Ajustando automáticamente a puerto 587 (STARTTLS).");
            effectivePort = 587;
        }

        mailSender.setPort(effectivePort);
        mailSender.setUsername(username != null ? username.trim() : "realmercatto@gmail.com");
        mailSender.setPassword(password != null ? password.trim() : "dkbqehynobdnxuag");
        mailSender.setDefaultEncoding("UTF-8");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.connectiontimeout", "8000");
        props.put("mail.smtp.timeout", "8000");
        props.put("mail.smtp.writetimeout", "8000");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");

        if (effectivePort == 465) {
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.socketFactory.fallback", "false");
            log.info("Configurado JavaMailSender con SSL en puerto 465 para host {}", mailSender.getHost());
        } else {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            log.info("Configurado JavaMailSender con STARTTLS en puerto {} para host {}", mailSender.getPort(), mailSender.getHost());
        }

        return mailSender;
    }
}
