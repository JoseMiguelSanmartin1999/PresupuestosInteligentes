# 💰 PresupuestosInteligentes API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  <strong>API REST profesional de finanzas personales y generación inteligente de presupuestos.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-12.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-ESM%20NodeNext-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 📌 Tabla de Contenidos

1. [Acerca del Proyecto](#-acerca-del-proyecto)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Modelo de Datos (Prisma & DB)](#-modelo-de-datos-prisma--db)
6. [Instalación y Configuración Local](#-instalación-y-configuración-local)
7. [Documentación Swagger (OpenAPI)](#-documentación-swagger-openapi)
8. [Catálogo de Endpoints de la API](#-catálogo-de-endpoints-de-la-api)
9. [Guía Paso a Paso para Subir a Git / GitHub](#-guía-paso-a-paso-para-subir-a-git--github)
10. [Autor y Créditos](#-autor-y-créditos)

---

## 📖 Acerca del Proyecto

**PresupuestosInteligentes** es una plataforma backend diseñada para ayudar a las personas a tomar el control real de sus finanzas mediante un **motor algorítmico de presupuestos inteligentes**.

A diferencia de las hojas de cálculo tradicionales o aplicaciones estáticas, el sistema:
1. **Analiza el historial real de consumos**: Evalúa los últimos 3 meses de gastos clasificados por categoría.
2. **Prioriza metas de ahorro y costos fijos**: Resta primero el porcentaje de ahorro deseado (ej. 10%) y los gastos fijos obligatorios (arriendo, servicios).
3. **Escala y ajusta inteligentemente el gasto variable**: Si el gasto histórico supera la capacidad disponible, calcula un factor de escala proporcional para recomendar topes realistas y prevenir déficit financiero.
4. **Monitorea en tiempo real**: Compara los gastos ejecutados contra el presupuesto aprobado para clasificar cada categoría en `ON_TRACK` (en orden), `NEAR_LIMIT` (≥80% consumido) o `EXCEEDED` (excedido).

---

## ⚡ Características Principales

- 🔐 **Autenticación Robusta**: Registro e inicio de sesión con contraseñas encriptadas con `bcrypt` (12 rondas de salt) y tokens `JWT Bearer` con expiración configurable.
- 👤 **Gestión de Perfil de Usuario**: Consulta de información protegida por guardias de Passport.
- 🏷️ **Categorías Personalizadas**: Organización flexible con tipos (`INCOME`, `EXPENSE`), colores hexadecimales e índices únicos por usuario.
- 💸 **Control de Transacciones**: Registro de ingresos y gastos con validación de categorías, rango de fechas, paginación y sumarios mensuales agregados.
- 🧠 **Motor de Presupuesto Predictivo y Aprobación**:
  - Generación de propuestas (`POST /budgets/generate`).
  - Aprobación transaccional con upsert seguro (`POST /budgets/approve`).
  - Seguimiento del cumplimiento mensual con alertas de desvío (`GET /budgets/:year/:month`).
- 📄 **Documentación Interactiva Swagger**: Interfaz visual para pruebas de endpoints en `/docs`.
- 🛡️ **Validación Estricta de Datos**: DTOs con `class-validator` y `class-transformer` con limpieza de payloads desconocidos (`whitelist` y `forbidNonWhitelisted`).

---

## 🛠 Stack Tecnológico

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Backend Framework** | [NestJS 12](https://nestjs.com/) | Arquitectura modular basada en TypeScript con inyección de dependencias. |
| **Lenguaje** | [TypeScript 6](https://www.typescriptlang.org/) | Compilado bajo especificación ECMAScript Nativa (**ESM NodeNext**). |
| **ORM** | [Prisma 6.19](https://www.prisma.io/) | Modelado de datos seguro, migraciones y cliente tipado con soporte a Decimales. |
| **Base de Datos** | [PostgreSQL](https://www.postgresql.org/) | Base de datos relacional robusta con soporte para TiDB Cloud / AWS RDS. |
| **Autenticación** | Passport JWT & Bcrypt | Seguridad basada en tokens JSON Web Token sin estado. |
| **Documentación** | Swagger OpenAPI | Interfaz web interactiva autogenerada para consumo de clientes web y móviles. |
| **Testing** | [Vitest](https://vitest.dev/) | Entorno de pruebas unitarias y e2e ultrarrápido con soporte ESM. |

---

## 📂 Estructura del Proyecto

El código fuente del servidor reside en la carpeta `api-nest/`:

```text
PresupuestosInteligentes/
├── .gitignore                   # Exclusiones globales de Git (ignora .env, node_modules, etc.)
├── .npmrc                       # Configuración de resolución de paquetes npm (legacy-peer-deps)
├── README.md                    # Documentación principal del repositorio
└── api-nest/                    # Proyecto Backend NestJS
    ├── .env                     # Variables de entorno locales (NO se sube a Git)
    ├── .env.example             # Plantilla pública de variables requeridas
    ├── prisma/
    │   └── schema.prisma        # Definición de modelos relacionales de la BD
    ├── prisma.config.ts         # Configuración del CLI de Prisma
    ├── src/
    │   ├── main.ts              # Punto de entrada de la aplicación y Swagger setup
    │   ├── app.module.ts        # Módulo raíz de la aplicación
    │   ├── auth/                # Módulo de Autenticación (JWT, Login, Registro, Guards)
    │   │   ├── dto/             # LoginDto, RegisterDto
    │   │   ├── guards/          # JwtAuthGuard
    │   │   └── strategies/      # JwtStrategy (Passport)
    │   ├── users/               # Perfil de usuario y consultas de cuenta
    │   ├── categories/          # Gestión de categorías de ingresos y gastos
    │   ├── transactions/        # Registro, filtros, paginación y sumarios
    │   ├── budgets/             # Algoritmo inteligente de presupuestos y seguimiento
    │   │   └── dto/             # GenerateBudgetDto, ApproveBudgetDto
    │   ├── reports/             # Módulo preparado para analítica y reportería
    │   └── prisma/              # Módulo y servicio global de conexión a base de datos
    ├── test/                    # Pruebas End-to-End
    └── tsconfig.json            # Configuración TypeScript NodeNext / ESM
```

---

## 🗄 Modelo de Datos (Prisma & DB)

El esquema relacional implementa integridad referencial y borrado en cascada para proteger los datos financieros del usuario:

```mermaid
erDiagram
    User ||--o{ Category : "crea"
    User ||--o{ Transaction : "registra"
    User ||--o{ Budget : "planifica"
    Category ||--o{ Transaction : "clasifica"
    Category ||--o{ Budget : "limita"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }

    Category {
        string id PK
        string name
        enum type "INCOME | EXPENSE"
        string color
        string userId FK
        datetime createdAt
    }

    Transaction {
        string id PK
        decimal amount
        enum type "INCOME | EXPENSE"
        string description
        datetime date
        string userId FK
        string categoryId FK
        datetime createdAt
        datetime updatedAt
    }

    Budget {
        string id PK
        decimal amount
        int month
        int year
        string userId FK
        string categoryId FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## 🚀 Instalación y Configuración Local

### 1. Prerrequisitos
- **Node.js**: `v22.x` o superior.
- **npm**: `v10.x` o superior.
- Una base de datos PostgreSQL activa (local o en la nube como TiDB Cloud, Supabase, Neon o AWS RDS).

### 2. Clonar el Repositorio
```bash
git clone https://github.com/JoseMiguelSanmartin1999/PresupuestosInteligentes.git
cd PresupuestosInteligentes
```

### 3. Configurar Variables de Entorno
Dirígete a la carpeta `api-nest`:
```bash
cd api-nest
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales reales:
```env
PORT=3000
NODE_ENV=development

# Cadena de conexión a PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@servidor:5432/presupuestos_inteligentes?sslmode=require"

# Secreto JWT (genera uno seguro con: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_SECRET="tu_jwt_secret_largo_y_seguro"
JWT_EXPIRES_IN="15m"
```

### 4. Instalar Dependencias
```bash
npm install
```
*(Gracias al archivo `.npmrc` configurado, las dependencias pares se resolverán de manera confiable).*

### 5. Sincronizar Base de Datos con Prisma
Aplica el esquema y genera el cliente tipado:
```bash
# Empujar el esquema a la base de datos
npx prisma db push

# Generar el cliente de Prisma
npx prisma generate
```

### 6. Ejecutar en Modo Desarrollo
```bash
npm run start:dev
```
La aplicación iniciará en: **`http://localhost:3000`**

---

## 📑 Documentación Swagger (OpenAPI)

Una vez iniciado el servidor, puedes explorar y probar interactivamente todos los endpoints en:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

Para probar rutas protegidas en Swagger:
1. Haz una petición a `POST /auth/login`.
2. Copia el `accessToken` devuelto.
3. Haz clic en el botón superior derecho **Authorize 🔓** en Swagger.
4. Pega el token y confirma. ¡Todas las peticiones subsiguientes enviarán el encabezado `Authorization: Bearer <token>`!

---

## 📡 Catálogo de Endpoints de la API

Todos los endpoints (excepto `/`, `/docs` y `/auth/*`) requieren el encabezado:
```http
Authorization: Bearer <tu_jwt_token>
```

### 1. Sistema & Salud
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Comprueba estado del servicio y conectividad activa con PostgreSQL. |
| `GET` | `/docs` | Interfaz interactiva Swagger UI. |

---

### 2. Autenticación (`/auth`)
| Método | Ruta | Payload | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | `{ "name": "...", "email": "...", "password": "..." }` | Registra un nuevo usuario con contraseña cifrada (mín. 10 chars). |
| `POST` | `/auth/login` | `{ "email": "...", "password": "..." }` | Inicia sesión y retorna token JWT Bearer (validez 15m). |

---

### 3. Usuarios (`/users`)
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/users/me` | Obtiene el perfil del usuario autenticado (`id`, `name`, `email`, `createdAt`). |

---

### 4. Categorías (`/categories`)
| Método | Ruta | Payload | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/categories` | `{ "name": "Alimentación", "type": "EXPENSE", "color": "#F97316" }` | Crea una categoría (`INCOME` o `EXPENSE`). |
| `GET` | `/categories` | *Ninguno* | Lista las categorías del usuario ordenadas por tipo y nombre. |
| `PATCH` | `/categories/:id` | `{ "name"?: "...", "color"?: "..." }` | Actualiza propiedades de una categoría existente. |
| `DELETE` | `/categories/:id` | *Ninguno* | Elimina una categoría del usuario. |

---

### 5. Transacciones (`/transactions`)
| Método | Ruta | Parámetros / Payload | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/transactions` | `{ "amount": 25.50, "type": "EXPENSE", "description": "Almuerzo", "categoryId": "..." }` | Registra un movimiento financiero. |
| `GET` | `/transactions` | Query params: `from`, `to`, `type`, `categoryId`, `page`, `limit` | Lista movimientos paginados con filtros de fecha y tipo. |
| `GET` | `/transactions/summary/:year/:month` | Parámetros de ruta: `year` (ej. 2026), `month` (ej. 10) | Sumario mensual agregado: ingresos totales, gastos totales y balance neto. |
| `DELETE` | `/transactions/:id` | *Ninguno* | Elimina una transacción. |

---

### 6. Presupuestos Inteligentes (`/budgets`)

#### A. Generar Propuesta de Presupuesto
`POST /budgets/generate`

Calcula la propuesta basada en tu historial de gastos de los últimos 3 meses o tu ingreso estimado:

```json
{
  "monthlyIncome": 1200,
  "savingsGoalPercent": 10,
  "fixedExpenses": [
    { "name": "Arriendo", "amount": 300 },
    { "name": "Internet y Servicios", "amount": 45 }
  ]
}
```

*Respuesta:*
```json
{
  "status": "WITHIN_INCOME",
  "period": { "year": 2026, "month": 10, "historyMonths": 3 },
  "summary": {
    "monthlyIncome": 1200,
    "savingsAmount": 120,
    "fixedExpensesTotal": 345,
    "variableBudgetTotal": 400,
    "remainingAmount": 335
  },
  "categories": [
    { "categoryId": "cmvo...", "name": "Alimentación", "proposedAmount": 200 }
  ],
  "warnings": []
}
```

#### B. Aprobar Presupuesto
`POST /budgets/approve`

Guarda formalmente los topes mensuales aprobados para cada categoría:

```json
{
  "year": 2026,
  "month": 10,
  "categories": [
    { "categoryId": "cmvo...", "amount": 200 }
  ]
}
```

#### C. Seguimiento y Ejecución en Tiempo Real
`GET /budgets/:year/:month`

Monitorea el dinero gastado vs el límite aprobado para alertar sobre desvíos:

```json
{
  "period": { "year": 2026, "month": 10 },
  "summary": {
    "totalBudget": 200,
    "totalSpent": 45.5,
    "remaining": 154.5,
    "usagePercent": 22.75,
    "exceededCategories": 0
  },
  "categories": [
    {
      "category": "Alimentación",
      "budget": 200,
      "spent": 45.5,
      "remaining": 154.5,
      "usagePercent": 22.75,
      "status": "ON_TRACK"
    }
  ]
}
```

---

## 🚀 Guía Paso a Paso para Subir a Git / GitHub

El proyecto está configurado para que todo el código del backend (`api-nest`), configuraciones y documentación se sincronicen de manera limpia y segura (sin incluir contraseñas ni `node_modules`).

### Paso 1: Abrir la terminal en la raíz del proyecto
Asegúrate de estar en `c:\Users\VICTUS\Documents\Proyectos\PresupuestosInteligentes`:
```powershell
cd c:\Users\VICTUS\Documents\Proyectos\PresupuestosInteligentes
```

### Paso 2: Verificar el estado de los archivos
```powershell
git status
```
> [!NOTE]
> Verás que `.env` y `node_modules` están protegidos por [.gitignore](file:///.gitignore). Solo se agregarán los archivos fuente y de configuración.

### Paso 3: Agregar los archivos al área de preparación (stage)
```powershell
git add .
```

### Paso 4: Crear el commit con un mensaje descriptivo
Siguiendo la convención de *Conventional Commits*:
```powershell
git commit -m "feat: implement smart budget api with auth, transactions, prisma orm and swagger docs"
```

### Paso 5: Asegurar la rama principal `main` y verificar el repositorio remoto
```powershell
git branch -M main
git remote -v
```
*(Debe apuntar a `https://github.com/JoseMiguelSanmartin1999/PresupuestosInteligentes.git`)*.

### Paso 6: Subir los cambios a GitHub
```powershell
git push -u origin main
```

¡Listo! Tu repositorio en GitHub reflejará toda la estructura con su README profesional.

---

## 👨‍💻 Autor y Créditos

Este proyecto fue desarrollado y estructurado con altos estándares de ingeniería de software por:

* **Autor**: **Jose Miguel Sanmartin**
* **GitHub**: [@JoseMiguelSanmartin1999](https://github.com/JoseMiguelSanmartin1999)
* **Proyecto**: [PresupuestosInteligentes](https://github.com/JoseMiguelSanmartin1999/PresupuestosInteligentes)

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente manteniendo la atribución original.