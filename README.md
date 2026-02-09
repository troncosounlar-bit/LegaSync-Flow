# LegaSync: Enterprise Intelligence Platform 🚀
**Sistema CRM de alta criticidad para la gestión integral de clientes y procesos financieros.**

LegaSync es una solución híbrida de vanguardia que actúa como puente técnico entre sistemas de cálculo legacy (Vanilla JS) y arquitecturas modernas. Este proyecto demuestra una implementación avanzada de **Angular 18**, gestión de datos relacionales en tiempo real y una experiencia de usuario (UX) diseñada para entornos corporativos de alta demanda.

---

## 🎯 Excelencia Técnica (Architecture Decisions)

Este proyecto fue desarrollado bajo una filosofía de **"Modernización Progresiva y Reactividad Pura"**:

* **Hybrid Reactive Core:** Integración de un motor de cálculo fiscal legacy mediante un puente reactivo que utiliza **Angular Signals** para asegurar que los datos del pasado convivan con el rendimiento del futuro.
* **Inteligencia Proactiva (LegaSync Insights):** Implementación de lógica de negocio en el frontend que detecta automáticamente capital en riesgo, salud financiera y niveles de automatización mediante `computed signals`.
* **Zoneless-Ready Architecture:** Aprovechamiento de las últimas capacidades de **Angular 18** para una detección de cambios eficiente y un bundle optimizado.
* **Estrategia de Persistencia:** Arquitectura orientada a servicios con **Supabase (PostgreSQL)**, implementando actualizaciones optimistas en la interfaz para una sensación de latencia cero.
* **UI Dinámica & Kanban:** Implementación manual de un Pipeline de ventas utilizando **Angular CDK Drag & Drop**, permitiendo una gestión visual de leads con persistencia automática en base de datos.
* **Enterprise Security:** Protección de infraestructura mediante variables de entorno y segregación de servicios en una arquitectura **Core/Features**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | Angular 18 (Signals, Control Flow, CDK) |
| **Reactividad** | Signals & RxJS Observables |
| **Backend/DB** | Supabase (PostgreSQL, Real-time JSONB storage) |
| **Legacy Engine** | JavaScript (ES6) Tax-Calculator Bridge |
| **Reportes** | jsPDF (Enterprise Document Generation) |
| **Estilos** | SCSS (BEM, Glassmorphism, CSS Variables) |
| **Bundling** | Vite (Angular CLI Optimized) |

---

## 🚀 Funcionalidades Destacadas

### 1. LegaSync Elite CRM & Pipeline
* **Pipeline de Ventas Pro:** Tablero Kanban interactivo para el seguimiento de leads desde "Prospecto" hasta "Ganado/Perdido".
* **Activity Timeline:** Historial cronológico automatizado que registra cada interacción, cambio de estado o nota del cliente mediante logs JSONB en PostgreSQL.
* **Seguimiento Inteligente:** Módulo de notas con persistencia asíncrona y sistema de priorización (Baja/Media/Alta) por cuenta corporativa.

### 2. Gestión Financiera & Invoicing
* **LegaSync Invoicing:** Sistema de administración de facturas con filtrado multimoneda y estados de cobro.
* **Subscription Engine:** Módulo avanzado de gestión de abonos recurrentes con cálculo automático de ingresos mensuales (MRR).
* **Control de Cashflow:** Registro de gastos operativos vinculados a clientes para el cálculo del margen de beneficio neto en tiempo real.
* **Exportación Profesional:** Generador de reportes financieros en PDF con diseño corporativo "LegaSync" para balances de cuenta.

### 3. Inteligencia de Negocio
* **Panel de Control de Riesgo:** Sistema de alertas inteligentes con estética **Glassmorphism** que detecta facturas con más de 15 días de mora.
* **Acción de Comando (Quick Filter):** Botón de gestión proactiva que filtra instantáneamente el historial para aislar y resolver deudas críticas.

---

## 📂 Estructura del Proyecto (Enterprise Architecture)
La arquitectura del proyecto ha sido organizada para garantizar escalabilidad y separación de intereses (SoC):


LEGACY-SYNC-APP/
├── .angular/                      # Caché de compilación del framework
├── .vscode/                        # Configuraciones del entorno de desarrollo
├── node_modules/                   # Dependencias del proyecto
├── public/                         # Archivos estáticos públicos
│   ├── Loguito1.png                 # Icono de la plataforma
│   └── Loguito9.png                 # Icono de la pestaña
├── src/
│   ├── app/
│   │   ├── core/                   # Singleton Services & Global Models
│   │   │   ├── guards/             # Definición de interfaces de datos
│   │   │   │   └── auth.guard.ts
│   │   │   ├── models/             # Definición de interfaces de datos
│   │   │   │   ├── customer.model.ts
│   │   │   │   ├── expense.model.ts
│   │   │   │   ├── invoice.model.ts
│   │   │   │   └── subscription.model.ts
│   │   │   ├── services/           # Lógica de comunicación con APIs y Supabase
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── batch-invoice.service.ts
│   │   │   │   ├── customer.service.ts
│   │   │   │   ├── exchange.service.ts
│   │   │   │   ├── expense.service.spec.ts
│   │   │   │   ├── expense.service.ts
│   │   │   │   ├── export.service.spec.ts
│   │   │   │   ├── export.service.ts
│   │   │   │   ├── invoice.service.spec.ts
│   │   │   │   ├── invoice.service.ts
│   │   │   │   ├── statistics.service.ts
│   │   │   │   └── subscription.service.ts
│   │   │   └── supabase.client.ts
│   │   ├── features/               # Módulos Funcionales (Smart Components)
│   │   │   ├── auth/          # Gestión de Cuentas Corporativas
│   │   │   │   ├── auth.component.html
│   │   │   │   ├── auth.component.scss
│   │   │   │   ├── auth.component.spec.ts
│   │   │   │   └── auth.component.ts
│   │   │   ├── customers/          # Gestión de Cuentas Corporativas
│   │   │   │   ├── customers.component.html
│   │   │   │   ├── customers.component.scss
│   │   │   │   ├── customers.component.spec.ts
│   │   │   │   └── customers.component.ts
│   │   │   ├── dashboard/          # Panel de Sincronización Pro (Hybrid Core)
│   │   │   │   │   └──components/
│   │   │   │   │       └──subscription-manager
│   │   │   │   │           ├──subscription-manager.component.html
│   │   │   │   │           ├──subscription-manager.component.scss
│   │   │   │   │           └──subscription-manager.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   ├── dashboard.component.scss
│   │   │   │   ├── dashboard.component.spec.ts
│   │   │   │   └── dashboard.component.ts
│   │   │   └── invoices/           # Administración de Facturación LegaSync
│   │   │       ├── invoices.component.html
│   │   │       ├── invoices.component.scss
│   │   │       ├── invoices.component.spec.ts
│   │   │       └── invoices.component.ts
│   │   ├── app.component.html      # Layout con navegación lateral
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts           # Configuración global de la aplicación
│   │   ├── app.routes.ts           # Definición de rutas y navegación avanzada
│   │   ├── assets/scripts/         # Motor de cálculo Legacy (tax-calculator.js)
│   │   ├── environment/            # Configuración de variables de entorno
│   │   │   └── environment.ts
│   │   ├── index.html
│   │   └── main.ts                 # Bootstrap de la aplicación
├── .editorconfig                   # Configuración de estilo de código
├── .env                            # Secretos y llaves privadas (Protegido)
├── .gitignore                      # Archivos excluidos del control de versiones
├── angular.json                    # Configuración del CLI de Angular
├── MIGRATION.md                    # Estrategia técnica de modernización
├── package-lock.json               # Árbol de dependencias bloqueado
├── package.json                    # Definición de scripts y dependencias
├── README.md                       # Documentación central del sistema
├── ROADMAP.md                      # Plan de evolución y estados de fase
├── tsconfig.app.json               # Configuración TypeScript para la app
├── tsconfig.json                   # Configuración base de TypeScript
└── tsconfig.spec.json              # Configuración TypeScript para pruebas

## 📈 Roadmap del Proyecto

### 🟩 Etapa 1: Cimientos (100% Completado)
* [x] Setup de Angular 18 y arquitectura Core/Features.
* [x] Puente reactivo con el motor legacy (Vanilla JS).
* [x] Conexión robusta con Supabase PostgreSQL.

### 🟨 Etapa 2: CRM & Pipeline (100% Completado)
* [x] Implementación de Pipeline Kanban con Angular CDK.
* [x] Sistema de notas y Activity Log dinámico (JSONB).
* [x] Interfaz de usuario "LegaSync Pro" con Side Drawers y Glassmorphism.

### 🟦 Etapa 3: Finanzas & Reportes (100% Completado)
* [x] Exportación documental de facturas a PDF (jsPDF).
* [x] Registro de gastos y cálculo de margen de ganancia neto.
* [x] Monitor de suscripciones y abonos recurrentes (Fase 5/6).

### 🚀 Etapa 4: Despliegue & Pulido (En progreso)
* [ ] Optimización de Core Web Vitals y Lazy Loading.
* [ ] Despliegue CI/CD en plataforma Cloud (Vercel/Netlify).


⚙️ Instalación y Configuración
Clonar repositorio:

Bash
git clone [tu-url-de-repo]
Instalar dependencias:

Bash
npm install
Variables de Entorno: Configura tus credenciales de Supabase en el archivo .env y src/app/environment/environment.ts.

Lanzar entorno de desarrollo:

Bash
npm start