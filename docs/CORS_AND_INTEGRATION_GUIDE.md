# 🌐 Guía de Integración Frontend y Resolución de CORS (Cross-Origin Resource Sharing)

> **Documento de Arquitectura, Troubleshooting y Referencia Técnica para Desarrolladores.**  
> **Proyecto:** PresupuestosInteligentes API  
> **Autor:** Jose Miguel Sanmartin  

---

## 📋 Resumen Ejecutivo

Al conectar un cliente web frontend (por ejemplo, una aplicación SPA en React con Vite alojada en `http://localhost:5173` o `http://localhost:5174`) con la API backend alojada en otro dominio (como `https://presupuestosinteligentes.onrender.com` o `http://localhost:3000`), el navegador web ejecuta un mecanismo de seguridad obligatorio conocido como **CORS**.

Este documento detalla el error experimentado, su causa raíz en la estructura del proyecto, la solución implementada en NestJS y las directrices para futuros equipos y desarrolladores que consuman la API.

---

## 🛑 El Error Observado

En la consola de herramientas de desarrollo del navegador (DevTools / Console / Network), se manifestaba el siguiente error al intentar iniciar sesión (`POST /auth/login`):

```text
Access to fetch at 'https://presupuestosinteligentes.onrender.com/auth/login' from origin 'http://localhost:5174' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
api.ts:25 POST https://presupuestosinteligentes.onrender.com/auth/login net::ERR_FAILED
```

Al inspeccionar la pestaña de **Network**, la petición de tipo `OPTIONS` (Preflight) devolvía un código HTTP `404 Not Found` con el mensaje:
```json
{
  "message": "Cannot OPTIONS /auth/login",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 🔍 ¿Por qué ocurre esto? (Mecanismo CORS y Preflight)

1. **Restricción de Mismo Origen (Same-Origin Policy)**:  
   Los navegadores prohíben que una aplicación en un origen (`http://localhost:5174`) acceda a recursos de otro origen (`https://presupuestosinteligentes.onrender.com`) a menos que el servidor destinatario envíe explícitamente encabezados de autorización `Access-Control-Allow-*`.

2. **Petición Preflight (`OPTIONS`)**:  
   Cualquier petición que:
   - Use métodos distintos a `GET` o `POST simple` (por ejemplo, `PUT`, `PATCH`, `DELETE`, o `POST` con encabezados personalizados).
   - Envíe el encabezado `Content-Type: application/json`.
   - Envíe encabezados de autenticación como `Authorization: Bearer <token>`.
   
   Obliga al navegador a enviar primero una petición preliminar `OPTIONS` preguntando al servidor: *¿Permites que `http://localhost:5174` me envíe un POST con JSON y Authorization?*

3. **Fallo en el Servidor**:  
   Si el servidor backend no tiene habilitado el middleware de CORS, no sabe responder a la petición `OPTIONS` y devuelve `404 Not Found` sin el encabezado `Access-Control-Allow-Origin`. En consecuencia, el navegador cancela la petición real antes de que se ejecute.

---

## 🧩 Causa Raíz Específica en este Repositorio

En este proyecto existían dos carpetas en el historial:
- `api/`: Estructura inicial básica generada al principio del desarrollo.
- `api-nest/`: **La aplicación real y completa**, que contiene los módulos de Autenticación, Usuarios, Categorías, Transacciones, Presupuestos Inteligentes y Prisma ORM.

**Qué sucedió:**
1. El servicio en la nube (Render) está compilando y ejecutando el proyecto ubicado en `api-nest`.
2. Inicialmente se configuró `app.enableCors(...)` únicamente en `api/src/main.ts`.
3. Al no estar presente en `api-nest/src/main.ts`, el backend en producción no tenía CORS activo, provocando el bloqueo del frontend.

---

## ✅ Solución Implementada en el Backend (NestJS)

En el archivo principal del servidor activo:
📁 **`api-nest/src/main.ts`** (y homologado en `api/src/main.ts`)

Se configuró el middleware de CORS inmediatamente después de crear la instancia de NestJS:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚀 CONFIGURACIÓN PROFESIONAL DE CORS
  app.enableCors({
    origin: [
      // Puertos locales estándar de desarrollo (Vite, Next.js, Angular, React)
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      // Expresiones regulares para permitir cualquier puerto local dinámico
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
    ],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 204, // Responde inmediatamente con HTTP 204 (No Content) a OPTIONS
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ... configuración de Swagger y listen
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

### Explicación de los Parámetros:
* **`origin`**: Permite los orígenes frontend explícitos y utiliza expresiones regulares (`/^http:\/\/localhost:\d+$/`) para que ningún puerto local de Vite (sea 5173, 5174, 5175, etc.) sea rechazado.
* **`methods`**: Autoriza todas las operaciones REST necesarias (`GET`, `POST`, `PATCH`, `DELETE`, y crucialmente `OPTIONS`).
* **`allowedHeaders`**: Permite enviar `Content-Type: application/json` y el token `Authorization: Bearer ...`.
* **`credentials: true`**: Permite el intercambio seguro de credenciales y encabezados de autorización.
* **`optionsSuccessStatus: 204`**: Garantiza que navegadores legados o modernos reciban un código exitoso sin cuerpo en el preflight.

---

## 💻 Guía para Desarrolladores Frontend (Cómo Consumir la API)

### 1. Variables de Entorno en el Frontend

En tu proyecto cliente (ej. `presupuestos-inteligentes-web`), configura tu `.env`:

```env
# Opción A: Conectarse a la API local en desarrollo
VITE_API_URL=http://localhost:3000
VITE_DATA_SOURCE=api

# Opción B: Conectarse a la API en producción (Render)
# VITE_API_URL=https://presupuestosinteligentes.onrender.com
# VITE_DATA_SOURCE=api
```

### 2. Estructura Estándar de Petición HTTP (`fetch`)

Asegúrate de formatear tus llamadas con los encabezados requeridos:

```typescript
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Manejar token expirado (redirigir al login)
      localStorage.removeItem('access_token');
      throw new Error('Sesión expirada o no autorizada');
    }
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
```

---

## 🚀 Despliegue de Nuevos Dominios Frontend en Producción

Cuando el equipo de frontend despliegue la aplicación en plataformas como **Vercel**, **Netlify**, **Cloudflare Pages** o un dominio corporativo (por ejemplo `https://presupuestos.tudominio.com`):

1. **Editar `api-nest/src/main.ts`**:
   Agrega el dominio a la lista de orígenes o haz uso de una variable de entorno:

   ```typescript
   const allowedOrigins: (string | RegExp)[] = [
     'http://localhost:5173',
     'http://localhost:5174',
     /^http:\/\/localhost:\d+$/,
     /^http:\/\/127\.0\.0\.1:\d+$/,
     'https://presupuestos-inteligentes.vercel.app', // Ejemplo Vercel
     'https://mi-dominio-produccion.com',
   ];

   // Si existe una variable de entorno en Render:
   if (process.env.FRONTEND_URL) {
     allowedOrigins.push(process.env.FRONTEND_URL);
   }

   app.enableCors({
     origin: allowedOrigins,
     credentials: true,
     optionsSuccessStatus: 204,
   });
   ```

2. **Configurar la variable en Render**:
   En el panel de Render Dashboard -> *Environment* -> Agrega:
   - Clave: `FRONTEND_URL`
   - Valor: `https://tu-frontend.vercel.app`

---

## 🧪 Checklist de Verificación y Diagnóstico Rápido

Si algún desarrollador vuelve a experimentar problemas de conexión:

| Paso | Verificación | Comando / Acción |
| :--- | :--- | :--- |
| **1** | Verificar que la API responda a OPTIONS | En terminal: `curl -i -X OPTIONS "https://presupuestosinteligentes.onrender.com/auth/login" -H "Origin: http://localhost:5173"` |
| **2** | Comprobar encabezado de respuesta | Debe incluir: `access-control-allow-origin: http://localhost:5173` y código `HTTP/1.1 204 No Content` o `200 OK`. |
| **3** | Validar URL en el frontend | Asegúrate de que `VITE_API_URL` no tenga barra final `/` al final de la URL base. |
| **4** | Comprobar estado del backend | Visitar `https://presupuestosinteligentes.onrender.com/` (debe retornar `status: ok`). |
| **5** | Swagger UI | Acceder a `https://presupuestosinteligentes.onrender.com/docs` para verificar que la ruta existe y está operativa. |
