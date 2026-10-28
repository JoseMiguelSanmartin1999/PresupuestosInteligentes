# 📡 Catálogo Completo de Endpoints - PresupuestosInteligentes API

Documento de referencia para el consumo e integración de la API REST de **Presupuestos Inteligentes**.

* **Base URL Local:** `http://localhost:3000`
* **Base URL Producción:** `https://presupuestosinteligentes.onrender.com`
* **Documentación Interactiva:** `/docs` (Swagger UI)

---

## 📋 Tabla Resumen de Todos los Endpoints

| # | Método | Ruta | Auth Requerido | ¿Qué hace? |
| :-: | :--- | :--- | :---: | :--- |
| **1** | `GET` | `/` | No | Verifica el estado del servicio y la conectividad activa con PostgreSQL. |
| **2** | `GET` | `/docs` | No | Interfaz visual interactiva Swagger UI para probar endpoints. |
| **3** | `POST` | `/auth/register` | No | Registra un nuevo usuario con contraseña cifrada (bcrypt). |
| **4** | `POST` | `/auth/login` | No | Autentica al usuario y entrega un token JWT Bearer (validez 15m). |
| **5** | `GET` | `/users/me` | **Sí (Bearer)** | Obtiene la información del perfil del usuario autenticado. |
| **6** | `POST` | `/categories` | **Sí (Bearer)** | Crea una nueva categoría personalizada (`INCOME` o `EXPENSE`). |
| **7** | `GET` | `/categories` | **Sí (Bearer)** | Lista todas las categorías creadas por el usuario autenticado. |
| **8** | `PATCH` | `/categories/:id` | **Sí (Bearer)** | Actualiza nombre, tipo o color hex de una categoría existente. |
| **9** | `DELETE` | `/categories/:id` | **Sí (Bearer)** | Elimina una categoría del usuario. |
| **10** | `POST` | `/transactions` | **Sí (Bearer)** | Registra un nuevo movimiento financiero (ingreso o gasto). |
| **11** | `GET` | `/transactions` | **Sí (Bearer)** | Lista movimientos paginados con filtros opcionales de fecha, tipo y categoría. |
| **12** | `GET` | `/transactions/summary/:year/:month` | **Sí (Bearer)** | Obtiene el sumario mensual (ingresos, gastos totales y balance neto). |
| **13** | `PATCH` | `/transactions/:id` | **Sí (Bearer)** | Modifica parcialmente un movimiento (monto, tipo, descripción, fecha o categoría). |
| **14** | `DELETE` | `/transactions/:id` | **Sí (Bearer)** | Elimina permanentemente una transacción del usuario. |
| **15** | `POST` | `/budgets/generate` | **Sí (Bearer)** | Genera propuesta inteligente de presupuesto mensual calculando histórico de gastos. |
| **16** | `POST` | `/budgets/approve` | **Sí (Bearer)** | Guarda y aprueba transaccionalmente los límites por categoría para un mes y año. |
| **17** | `GET` | `/budgets/:year/:month` | **Sí (Bearer)** | Monitorea el progreso de ejecución del presupuesto (`ON_TRACK`, `NEAR_LIMIT`, `EXCEEDED`). |

---

## 🔒 Encabezado de Autenticación
Todos los endpoints marcados con **Sí (Bearer)** requieren enviar el encabezado HTTP:
```http
Authorization: Bearer <tu_jwt_token>
```

---

## 🔍 Detalle por Módulos y Parámetros

### 1. Sistema & Salud

#### `GET /`
* **Descripción:** Comprueba que la aplicación NestJS esté viva y que la base de datos PostgreSQL responda adecuadamente.
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-27T23:20:00.000Z",
    "database": "connected"
  }
  ```

#### `GET /docs`
* **Descripción:** Interfaz interactiva de OpenAPI/Swagger UI con esquemas de validación y documentación de prueba en vivo.

---

### 2. Autenticación (`/auth`)

#### `POST /auth/register`
* **Descripción:** Registra un nuevo usuario en la base de datos.
* **Body (JSON):**
  | Campo | Tipo | Requerido | Validaciones | Ejemplo |
  | :--- | :--- | :---: | :--- | :--- |
  | `name` | `string` | Sí | 2 a 100 caracteres | `"Jose Sanmartin"` |
  | `email` | `string` | Sí | Email válido | `"jose@ejemplo.com"` |
  | `password` | `string` | Sí | Mínimo 10 caracteres | `"MiClaveSegura123!"` |
* **Respuestas:**
  * `201 Created`: Usuario creado exitosamente. Retorna `{ id, name, email, createdAt }`.
  * `409 Conflict`: Ya existe un usuario registrado con ese email.

#### `POST /auth/login`
* **Descripción:** Valida credenciales y genera un token JWT.
* **Body (JSON):**
  | Campo | Tipo | Requerido | Ejemplo |
  | :--- | :--- | :---: | :--- |
  | `email` | `string` | Sí | `"jose@ejemplo.com"` |
  | `password` | `string` | Sí | `"MiClaveSegura123!"` |
* **Respuestas:**
  * `200 OK`:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
    ```
  * `401 Unauthorized`: Credenciales inválidas.

---

### 3. Usuarios (`/users`)

#### `GET /users/me`
* **Descripción:** Retorna la información del usuario autenticado a partir del JWT.
* **Respuestas:**
  * `200 OK`:
    ```json
    {
      "id": "cmv123abc456",
      "name": "Jose Sanmartin",
      "email": "jose@ejemplo.com",
      "createdAt": "2026-10-25T14:30:00.000Z"
    }
    ```
  * `401 Unauthorized`: Token faltante o expirado.

---

### 4. Categorías (`/categories`)

#### `POST /categories`
* **Descripción:** Crea una categoría para organizar transacciones.
* **Body (JSON):**
  | Campo | Tipo | Requerido | Ejemplo | Descripción |
  | :--- | :--- | :---: | :--- | :--- |
  | `name` | `string` | Sí | `"Alimentación"` | Nombre de la categoría (máx 50 car.) |
  | `type` | `enum` | Sí | `"EXPENSE"` | `"INCOME"` o `"EXPENSE"` |
  | `color` | `string` | No | `"#F97316"` | Color hexadecimal (por defecto `#64748b`) |
* **Respuestas:** `201 Created`, `409 Conflict` (ya existe una categoría con ese nombre y tipo para el usuario).

#### `GET /categories`
* **Descripción:** Lista todas las categorías del usuario, ordenadas por tipo (`INCOME` primero, luego `EXPENSE`) y por nombre alfabéticamente.
* **Respuestas:** `200 OK` (Array de categorías).

#### `PATCH /categories/:id`
* **Descripción:** Actualiza parcialmente una categoría existente.
* **Path Params:** `id` (ID de la categoría).
* **Body (JSON):** `{ name?: string, type?: TransactionType, color?: string }`.
* **Respuestas:** `200 OK`, `404 Not Found`.

#### `DELETE /categories/:id`
* **Descripción:** Elimina una categoría del usuario.
* **Path Params:** `id` (ID de la categoría).
* **Respuestas:**
  * `200 OK`: `{ "message": "Categoría eliminada correctamente" }`
  * `404 Not Found`: Categoría no encontrada.

---

### 5. Transacciones (`/transactions`)

#### `POST /transactions`
* **Descripción:** Registra un nuevo movimiento monetario.
* **Body (JSON):**
  | Campo | Tipo | Requerido | Ejemplo | Descripción |
  | :--- | :--- | :---: | :--- | :--- |
  | `amount` | `number` | Sí | `45.50` | Importe monetario (mín. 0.01, 2 decimales) |
  | `type` | `enum` | Sí | `"EXPENSE"` | `"INCOME"` o `"EXPENSE"` |
  | `description` | `string` | No | `"Almuerzo trabajo"` | Concepto (máx 250 car.) |
  | `date` | `string` | No | `"2026-10-25T14:30:00.000Z"` | Formato ISO 8601 (por defecto fecha actual) |
  | `categoryId` | `string` | No | `"cmvobefa90001..."` | ID de categoría (debe coincidir con el `type`) |
* **Respuestas:** `201 Created`, `400 Bad Request` (categoría no existe o no corresponde al tipo).

#### `GET /transactions`
* **Descripción:** Lista movimientos con paginación y filtros opcionales.
* **Query Parameters:**
  | Parámetro | Tipo | Requerido | Default | Ejemplo | Descripción |
  | :--- | :--- | :---: | :---: | :--- | :--- |
  | `from` | `string` (ISO) | No | — | `2026-10-01` | Fecha inicial del rango |
  | `to` | `string` (ISO) | No | — | `2026-10-31` | Fecha final del rango |
  | `type` | `enum` | No | — | `"EXPENSE"` | `"INCOME"` o `"EXPENSE"` |
  | `categoryId` | `string` | No | — | `"cmv123..."` | ID de la categoría |
  | `page` | `number` | No | `1` | `1` | Número de página ($\ge 1$) |
  | `limit` | `number` | No | `20` | `20` | Elementos por página (1 a 100) |
* **Respuestas:**
  * `200 OK`:
    ```json
    {
      "data": [
        {
          "id": "cmv123abc456",
          "amount": "45.50",
          "type": "EXPENSE",
          "description": "Almuerzo de trabajo",
          "date": "2026-10-25T14:30:00.000Z",
          "createdAt": "2026-10-25T14:30:00.000Z",
          "updatedAt": "2026-10-25T14:30:00.000Z",
          "userId": "usr_123",
          "categoryId": "cat_456",
          "category": {
            "id": "cat_456",
            "name": "Alimentación",
            "type": "EXPENSE",
            "color": "#F97316"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "totalPages": 1
      }
    }
    ```

#### `GET /transactions/summary/:year/:month`
* **Descripción:** Retorna el acumulado mensual de ingresos, gastos y balance.
* **Path Params:** `year` (año, ej. 2026), `month` (mes del 1 al 12).
* **Respuestas:**
  * `200 OK`:
    ```json
    {
      "year": 2026,
      "month": 10,
      "totalIncome": "1500.00",
      "totalExpenses": "820.50",
      "balance": "679.50"
    }
    ```

#### `PATCH /transactions/:id`
* **Descripción:** Modifica parcialmente campos específicos de un movimiento. Si cambia el `type` o `categoryId`, valida la consistencia del tipo de categoría.
* **Path Params:** `id` (ID de la transacción).
* **Body (JSON):**
  ```json
  {
    "amount"?: 50.00,
    "type"?: "EXPENSE",
    "description"?: "Almuerzo ejecutivo",
    "date"?: "2026-10-25T15:00:00.000Z",
    "categoryId"?: "cat_456" // o null para desasignar
  }
  ```
* **Respuestas:** `200 OK` (retorna la transacción actualizada con su categoría), `400 Bad Request`, `404 Not Found`.

#### `DELETE /transactions/:id`
* **Descripción:** Elimina la transacción indicada.
* **Path Params:** `id` (ID de la transacción).
* **Respuestas:**
  * `200 OK`: `{ "message": "Transacción eliminada correctamente" }`
  * `404 Not Found`: `{ "statusCode": 404, "message": "Transacción no encontrada" }`

---

### 6. Presupuestos Inteligentes (`/budgets`)

#### `POST /budgets/generate`
* **Descripción:** Analiza los últimos 3 meses de transacciones o el ingreso mensual provisto para calcular una distribución inteligente de límites por categoría, descontando ahorro y gastos fijos.
* **Body (JSON):**
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
* **Respuestas (`201 Created`):**
  ```json
  {
    "status": "WITHIN_INCOME",
    "period": { "year": 2026, "month": 10, "historyMonths": 3 },
    "summary": {
      "monthlyIncome": 1200,
      "savingsGoalPercent": 10,
      "savingsAmount": 120,
      "fixedExpensesTotal": 345,
      "historicalVariableSpend": 520,
      "variableBudgetTotal": 735,
      "plannedTotal": 1065,
      "remainingAmount": 135
    },
    "fixedExpenses": [...],
    "categories": [
      { "categoryId": "cat_alim", "amount": 250 },
      { "categoryId": "cat_transp", "amount": 100 }
    ],
    "warnings": [],
    "requiresReview": false
  }
  ```

#### `POST /budgets/approve`
* **Descripción:** Guarda de forma transaccional los presupuestos mensuales aprobados por el usuario para un periodo determinado.
* **Body (JSON):**
  ```json
  {
    "year": 2026,
    "month": 10,
    "categories": [
      { "categoryId": "cat_alim", "amount": 250 },
      { "categoryId": "cat_transp", "amount": 100 }
    ]
  }
  ```
* **Respuestas:** `201 Created` (Presupuesto registrado), `400 Bad Request` (categorías repetidas o no existentes).

#### `GET /budgets/:year/:month`
* **Descripción:** Monitorea en tiempo real el cumplimiento del presupuesto, calculando cuánto se ha gastado respecto al límite aprobado y asignando el estado de cada categoría.
* **Path Params:** `year` (año), `month` (mes).
* **Respuestas (`200 OK`):**
  ```json
  {
    "period": { "year": 2026, "month": 10 },
    "hasBudget": true,
    "summary": {
      "totalBudget": 350,
      "totalSpent": 185.50,
      "remaining": 164.50,
      "usagePercent": 53.0,
      "categoriesCount": 2,
      "exceededCategories": 0
    },
    "categories": [
      {
        "categoryId": "cat_alim",
        "category": "Alimentación",
        "budget": 250,
        "spent": 120,
        "remaining": 130,
        "usagePercent": 48.0,
        "status": "ON_TRACK"
      }
    ]
  }
  ```
* **Estados de categoría (`status`):**
  * `ON_TRACK`: Consumo menor al 80%.
  * `NEAR_LIMIT`: Consumo entre 80% y 100%.
  * `EXCEEDED`: Consumo superior al 100% del límite aprobado.
