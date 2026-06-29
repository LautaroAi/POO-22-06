# Implementación de Desafíos Arquitectónicos con TypeScript

## Alumno: Lautaro Rivieri

**Resumen**: Este repositorio contiene la implementación en TypeScript de cinco desafíos contemporáneos de ingeniería de software. La solución se fundamenta en la aplicación rigurosa de los principios **SOLID** y el uso estratégico de **Patrones de Diseño** (GoF) para transformar lógicas monolíticas y altamente acopladas en arquitecturas modulares, escalables y preparadas para entornos distribuidos.

---

## Visión General de los Desafíos

| Desafío | Dominio | Patrón Principal | Principio SOLID Clave |
| :--- | :--- | :--- | :--- |
| **1. Gilded Rose** | Refactorización de legado | Strategy + Factory | Abierto/Cerrado (OCP) |
| **2. Máquina Expendedora** | Control transaccional | State + Singleton | Responsabilidad Única (SRP) |
| **3. Estacionamiento** | Asignación de recursos | Facade + Strategy + Abstract Factory | Sustitución de Liskov (LSP) |
| **4. Reserva de Viajes (Uber)** | Sistemas distribuidos y Tiempo Real | Observer + State + Strategy | Inversión de Dependencias (DIP) |
| **5. Orquestación de Agentes IA** | Sistemas Multiagente | Command + State + Orchestrator | Segregación de Interfaces (ISP) |

---

## Detalle de Implementaciones

### 1. Refactorización Gilded Rose (Kata)
- **Problema**: Mantenimiento de un monolito condicional (antipatrón) para gestionar la degradación de artículos.
- **Solución**: 
  - Encapsulamos la lógica de actualización en estrategias independientes (`NormalStrategy`, `AgedBrieStrategy`, `ConjuredStrategy`).
  - Centralizamos la instanciación mediante una **Factory**, permitiendo añadir nuevos tipos de artículos (como *Conjured*) sin modificar el núcleo del sistema.
- **Resultado**: Código cerrado a la modificación pero abierto a la extensión (OCP), eliminando condicionales anidados.

### 2. Máquina Expendedora (Vending Machine)
- **Problema**: Gestión de estados (Idle, Ready, Dispense) y prevención de condiciones de carrera en transacciones.
- **Solución**:
  - Implementación del patrón **State** para delegar comportamientos (inserción, selección, dispensación) según el contexto.
  - Uso de **Singleton** en el contexto principal para garantizar una única instancia del controlador.
- **Resultado**: Atomicidad transaccional asegurada y eliminación de lógica de validación dispersa (SRP).

### 3. Sistema de Gestión de Estacionamiento
- **Problema**: Asignación eficiente de plazas (complejidad O(1)), cálculo de tarifas dinámicas y concurrencia.
- **Solución**:
  - **Facade** (`ParkingLot`) para abstraer la complejidad subyacente.
  - **Strategy** para inyectar algoritmos de precios intercambiables (tarifa plana vs. dinámica).
  - Uso de **HashMap** segmentado por tamaño de vehículo para búsqueda instantánea de espacios libres.
- **Resultado**: Alto rendimiento y facilidad para añadir nuevos tipos de vehículos (LSP).

### 4. Sistema de Reserva de Viajes (Cab Booking)
- **Problema**: Emparejamiento geoespacial en tiempo real, actualización de telemetría y orquestación de viajes.
- **Solución**:
  - **Observer**: Simulación de notificaciones de ubicación a pasajeros suscritos.
  - **State**: Máquina de estados finitos para el ciclo de vida del viaje (`REQUESTED` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED`).
  - **Strategy**: Cálculo de tarifas con factores de aumento (surge pricing).
- **Resultado**: Infraestructura desacoplada y preparada para escalar a microservicios (DIP).

### 5. Orquestación de Agentes de IA (Agentic AI)
- **Problema**: Coordinación de agentes autónomos con herramientas externas y persistencia de memoria.
- **Solución**:
  - **Command**: Abstracción de herramientas (`DatabaseQueryTool`, `APICallTool`) para garantizar guardarraíles (Tool Gatekeeping).
  - **State**: Gestión de memoria persistente y snapshots para rebobinar estados.
  - **Orquestadores**: Implementación de patrones avanzados: *Secuencial*, *Handoff* (Cadena de Responsabilidad), *Concurrente* y *Debate*.
- **Resultado**: Arquitectura robusta que maneja flujos no deterministas sin perder trazabilidad.

---

## Principios Transversales Aplicados

- **Alta Cohesión y Bajo Acoplamiento**: Cada clase tiene una única razón para cambiar, delegando responsabilidades específicas.
- **Inyección de Dependencias**: Las estrategias y herramientas se inyectan externamente, facilitando las pruebas unitarias (mocking).
- **Inmutabilidad Controlada**: Los objetos de transferencia (`Ticket`, `Item`) se gestionan para evitar efectos secundarios no deseados.

---

## Tecnologías y Estándares

- **Lenguaje**: TypeScript (tipado estático y programación orientada a objetos pura).
- **Paradigma**: POO con énfasis en herencia, polimorfismo y encapsulamiento.
- **Entorno**: Diseñado para Node.js, aunque las abstracciones son transportables a cualquier ecosistema OOP (Java, C#, Python).

---

## Conclusión

Este proyecto demuestra que la aplicación metódica de patrones de diseño no es una mera formalidad académica, sino un pilar fundamental para mitigar la deuda técnica en sistemas empresariales. Desde la refactorización de código legado hasta la orquestación de inteligencia artificial distribuida, la orientación a objetos y los principios SOLID proporcionan la base determinista necesaria para garantizar la fiabilidad, mantenibilidad y evolución tecnológica a largo plazo.

### [**Subir ⬆**](#implementación-de-desafíos-arquitectónicos-con-typescript)