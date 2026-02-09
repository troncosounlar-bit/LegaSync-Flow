# 🏗️ Estrategia de Migración: Legacy a Microservicios

Este documento detalla la hoja de ruta técnica para transicionar la lógica financiera actual hacia una arquitectura moderna y escalable.

## 1. Estado Actual
* **Motor:** Vanilla JS inyectado globalmente.
* **Riesgo:** Falta de tipado, dificultad para pruebas unitarias aisladas y acoplamiento al DOM.

## 2. Propuesta de Evolución
### Opción A: Refactorización a TypeScript (Angular Core)
* Transpolar `calculateLegacyTax` a un servicio de Angular puro.
* **Ventaja:** Eliminación de archivos externos y tipado estricto inmediato.

### Opción B: Externalización a Backend (Go / Java)
* Mover la lógica de impuestos a un microservicio.
* **Ventaja:** Centralización de reglas de negocio para múltiples clientes (Web, Mobile, Desktop).

## 3. Plan de Mitigación de Riesgos
1.  **Paralelismo:** Mantener el motor legacy mientras se ejecutan pruebas "Shadow" con el nuevo motor.
2.  **Validación:** Los resultados de ambos motores deben coincidir en un 100% antes de la desconexión definitiva.