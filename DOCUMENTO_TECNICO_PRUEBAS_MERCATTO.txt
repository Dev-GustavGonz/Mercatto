# INFORME T?CNICO DE CALIDAD Y PRUEBAS DE SOFTWARE
## PROYECTO: MERCATTO (E-COMMERCE SYSTEM)
**Tema:** Implementaci?n de Pruebas Unitarias y de Regresi?n en el Servicio de Pedidos (PedidoService.java)
**Frameworks:** Spring Boot, JUnit 5, Mockito, Maven, GitHub Actions
**Fecha de Sustentaci?n:** 04 de Noviembre de 2026

---

## DISTRIBUCI?N INDIVIDUAL DE INTEGRANTES (EVALUACI?N 1 A 4)

| Integrante | Rol de Sustentaci?n | Alcance T?cnico Evaluado |
|---|---|---|
| **Integrante 1** | Contextualizaci?n Te?rica y Alcance | Definici?n de Pruebas Unitarias, Pir?mide de Cohn y Aislamiento de Mocks |
| **Integrante 2** | Dise?o Metodol?gico de Casos | Matriz de Pruebas, Casos L?mite y Criterios de Aceptaci?n |
| **Integrante 3** | Implementaci?n T?cnica en C?digo | Patr?n AAA (Arrange-Act-Assert), Inyecci?n de Mocks y Aserciones con JUnit 5 |
| **Integrante 4** | An?lisis de M?tricas y CI/CD | Tiempos de Ejecuci?n, Cobertura, Detecci?n de Bugs y Pipeline en GitHub Actions |

---

## 1. INTRODUCCI?N Y ARQUITECTURA DE MERCATTO
Mercatto es una plataforma de comercio electr?nico desarrollada con una arquitectura desacoplada:
- **Backend:** Microservicio en Spring Boot (Java 17) con persistencia relacional en PostgreSQL (Supabase).
- **Frontend:** SPA interactiva en React / Node.js.
- **Anal?tica:** Modelo predictivo en Python para recomendaciones de demanda y precios.
- **Integraciones Cr?ticas:** Pasarelas de pago externas (Wompi y Stripe) y servicio de mensajer?a transaccional (EmailService).

Dado que el flujo de compra es el coraz?n del negocio, cualquier error en el c?lculo de totales, reserva de inventario o validaci?n de pagos causa p?rdidas financieras y fallos en producci?n.

---

## 2. CLASIFICACI?N DE PRUEBAS Y PIR?MIDE DE COHN
De acuerdo con la Pir?mide de Automatizaci?n de Mike Cohn:
1. **Base (Pruebas Unitarias):** Pruebas r?pidas (milisegundos), aisladas y deterministas sobre la capa de servicios (Service Layer), evaluando algoritmos de negocio sin dependencias externas.
2. **Capa Media (Integraci?n y API):** Verificaci?n de controladores REST (MockMvc) y comunicaci?n con bases de datos en memoria (H2/Testcontainers).
3. **Cima (Pruebas E2E / UI):** Simulaci?n del usuario final en el navegador.

**Decisi?n en Mercatto:** Se priorizaron pruebas unitarias en `PedidoService` para blindar la l?gica de negocio antes de integraciones externas.

---

## 3. INTEGRANTE 1: FUNDAMENTACI?N TE?RICA, ALCANCE Y AISLAMIENTO
### 3.1 Componente Cr?tico: PedidoService.java
Orquesta 12 dependencias clave: `PedidoRepository`, `ProductoRepository`, `VarianteRepository`, `CuponRepository`, `PagoRepository`, `EmailService`, entre otras.

### 3.2 Principio de Aislamiento con Mocks (Principios F.I.R.S.T.)
Para cumplir con los principios F.I.R.S.T. (Fast, Independent, Repeatable, Self-validating, Timely), se utiliz? **Mockito** para:
- No escribir en PostgreSQL (Supabase) ni descontar stock real en la base de datos de producci?n.
- No disparar llamadas de red hacia las APIs de Stripe o Wompi (evitando cobros accidentales o timeouts).
- Asegurar que la prueba se ejecute en cualquier m?quina sin necesidad de levantar contenedores Docker.

### 3.3 Pregunta de Defensa para Integrante 1:
- **Pregunta:** ?Por qu? usar mocks en vez de probar directo contra la base de datos PostgreSQL (Supabase)?
- **Respuesta:** Porque una prueba unitaria debe ser determinista, ejecutarse en menos de 200 ms y probar ?nicamente la l?gica de Java. Si dependi?ramos de PostgreSQL (Supabase), un fallo de conexi?n o datos previos alterar?a el resultado sin que el c?digo de la aplicaci?n tenga un bug.

---

## 4. INTEGRANTE 2: DISE?O DE ESCENARIOS Y MATRIZ DE PRUEBAS
Se aplicaron t?cnicas formales de **Partici?n de Equivalencia** y **An?lisis de Valores L?mite** sobre el m?todo `crearPedidoInvitado(PedidoRequest)`:

| ID | Escenario | T?cnica | Entrada / Estado Simulado | Salida / Aserci?n Esperada |
|---|---|---|---|---|
| **TC-01** | Compra Exitosa (Happy Path) | Partici?n V?lida | Email v?lido, Variante ID=1 (Stock=10, Cant=2) | Retorna `PedidoResponse` con estado `PENDIENTE` |
| **TC-02** | Quiebre de Stock (Caso L?mite) | Valor L?mite | Variante ID=1 (Stock=2, Solicitado=5) | Lanza `BadRequestException: Stock insuficiente` |
| **TC-03** | Email Vac?o o Espacios | Entrada Inv?lida | `emailInvitado = '   '` (espacios en blanco) | Lanza `BadRequestException` inmediata |
| **TC-04** | Cup?n Inexistente | Excepci?n Negocio | `codigoCupon = 'NO_EXISTE'` (Repo retorna empty) | Lanza `ResourceNotFoundException` |

### 4.1 Pregunta de Defensa para Integrante 2:
- **Pregunta:** ?Por qu? probar casos negativos si el formulario web del frontend ya valida que el email no est? vac?o?
- **Respuesta:** Por el principio de **Defensa en Profundidad (Defense in Depth)**. El frontend es vulnerable a ser omitido por herramientas como Postman, curl o scripts maliciosos. El backend debe garantizar la integridad de sus datos de forma aut?noma.

---

## 5. INTEGRANTE 3: IMPLEMENTACI?N T?CNICA EN C?DIGO (JUNIT 5 + MOCKITO)
Implementaci?n estructurada bajo el patr?n **AAA (Arrange, Act, Assert)**:

```java
@ExtendWith(MockitoExtension.class)
public class PedidoServiceTest {

    @Mock private PedidoRepository pedidoRepo;
    @Mock private VarianteRepository varianteRepo;
    @Mock private EmailService emailService;

    @InjectMocks
    private PedidoService pedidoService;

    @Test
    @DisplayName("TC-03: Debe rechazar la orden si el email de invitado contiene solo espacios")
    void deberiaLanzarExcepcionCuandoEmailInvitadoEsInvalido() {
        // 1. ARRANGE (Preparar escenario con entrada defectuosa)
        PedidoRequest req = new PedidoRequest();
        req.setEmailInvitado("   "); // Cadena con espacios

        // 2. ACT & 3. ASSERT (Verificar disparo de excepci?n esperada)
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            pedidoService.crearPedidoInvitado(req);
        });

        // Verificaci?n de comportamiento: NUNCA se debi? persistir en la base de datos
        verify(pedidoRepo, never()).save(any());
        verifyNoInteractions(emailService);
    }
}
```

### 5.1 Desglose de Elementos Clave:
- `@ExtendWith(MockitoExtension.class)`: Inicializa Mockito sin sobrecosto de Spring.
- `@Mock` vs `@InjectMocks`: `@Mock` crea los dobles virtuales; `@InjectMocks` crea la instancia real inyect?ndole los dobles.
- `assertThrows(...)`: Comprueba que se lance la excepci?n correcta de dominio.
- `verify(pedidoRepo, never()).save(...)`: Aserci?n de comportamiento que certifica que no hubo escrituras espurias.

### 5.2 Pregunta de Defensa para Integrante 3:
- **Pregunta:** ?Cu?l es la diferencia entre `@SpringBootTest` y `@ExtendWith(MockitoExtension.class)`?
- **Respuesta:** `@SpringBootTest` arranca el contenedor completo de Spring (servlets, inyecci?n completa, perfiles), demorando de 5 a 15 segundos. `@ExtendWith(MockitoExtension.class)` es prueba unitaria pura que corre en menos de 150 milisegundos con m?nimo consumo de memoria.

---

## 6. INTEGRANTE 4: M?TRICAS, HALLAZGOS Y AUTOMATIZACI?N CI/CD
### 6.1 M?tricas de Ejecuci?n
- **Tiempo total:** 138 milisegundos.
- **Tasa de ?xito:** 100% (4 pruebas ejecutadas, 0 fallos, 0 errores).
- **Cobertura en m?todo evaluado:** 92% de cobertura de instrucciones (JaCoCo).

### 6.2 Defecto Real Descubierto y Solucionado en Mercatto
Al dise?ar el caso **TC-03**, se detect? que el c?digo original solo verificaba:
`if (req.getEmailInvitado() == null)`
Por lo tanto, si el cliente enviaba espacios en blanco `"   "`, la orden continuaba y fallaba de forma imprevista al intentar enviar el correo o generar la factura. Gracias al test, se refactoriz? a:
`if (req.getEmailInvitado() == null || req.getEmailInvitado().trim().isEmpty())`
Evitando ?rdenes corruptas antes de producci?n.

### 6.3 Integraci?n Continua (GitHub Actions)
En el pipeline de despliegue a Azure (`.github/workflows/deploy-azure.yml`), el paso de prueba (`mvn clean test`) act?a como un **Quality Gate**. Si un desarrollador sube c?digo que altera el comportamiento de `PedidoService`, el pipeline se cancela y evita el despliegue autom?tico.

### 6.4 Pregunta de Defensa para Integrante 4:
- **Pregunta:** ?Si alcanzamos 100% de cobertura, garantizamos que el software no tiene fallos?
- **Respuesta:** No. La cobertura mide qu? l?neas se ejecutaron, pero no eval?a si se contemplaron todos los casos de negocio posibles ni la correcci?n sem?ntica. Como formul? Edsger Dijkstra: "Las pruebas demuestran la presencia de errores, nunca su ausencia".

---

## 7. CONCLUSIONES
1. Las pruebas unitarias con dobles de prueba (Mockito) blindan el n?cleo transaccional sin incurrir en costos ni dependencias de pasarelas de pago reales.
2. El dise?o basado en casos l?mite (valores frontera) previene vulnerabilidades de validaci?n en la capa de servicios.
3. La automatizaci?n en CI/CD convierte la calidad en un requisito ineludible y no en una tarea manual tard?a.
