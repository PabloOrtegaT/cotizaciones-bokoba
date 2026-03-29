# Cotizaciones Tomás Dzul - Guía para Agentes

## Resumen del Proyecto

Este es una aplicación web desarrollada con **Next.js 14** para generar cotizaciones de servicios de albañilería (construcción/mampostería). La aplicación permite crear, editar y exportar cotizaciones en formato PDF con cálculo automático de totales, autoguardado local y catálogo de conceptos predefinidos.

**Nombre del proyecto:** `cotizaciones-tomas`  
**Versión:** 0.1.0  
**Tipo:** Aplicación web privada (Next.js App Router)

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.2.32 | Framework React con App Router |
| React | 18.3.1 | Biblioteca UI |
| React DOM | 18.3.1 | Renderizado DOM |
| TypeScript | 5.8.3 | Tipado estático |
| Tailwind CSS | 3.4.18 | Estilos utilitarios |
| PostCSS | 8.5.6 | Procesamiento CSS |
| Autoprefixer | 10.4.21 | Prefijos CSS automáticos |
| ESLint | 8.57.1 | Linting de código |
| clsx | 2.1.1 | Concatenación de clases condicionales |
| tailwind-merge | 2.6.0 | Merge de clases de Tailwind sin conflictos |
| jose | ^5.x | JWT para autenticación |

---

## Estructura del Proyecto

```
cotizaciones-tomas/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── auth/                 # Autenticación
│   │       ├── login/route.ts    # Login endpoint
│   │       └── logout/route.ts   # Logout endpoint
│   ├── components/               # Componentes de la app
│   │   └── navbar.tsx            # Barra de navegación
│   ├── globals.css               # Estilos globales con Tailwind + tema oscuro
│   ├── layout.tsx                # Layout raíz con metadatos
│   ├── lista-de-cotizaciones/    # Página de historial
│   │   └── page.tsx
│   ├── login/                    # Página de login
│   │   └── page.tsx
│   └── page.tsx                  # Página principal (generador de cotizaciones)
├── components/                   # Componentes React
│   └── ui/                       # Componentes UI reutilizables (estilo shadcn)
│       ├── button.tsx            # Botón con variantes
│       ├── card.tsx              # Tarjeta con subcomponentes
│       ├── input.tsx             # Campo de entrada
│       ├── label.tsx             # Etiqueta de formulario
│       ├── select.tsx            # Selector desplegable
│       ├── table.tsx             # Tabla con estilos
│       └── textarea.tsx          # Área de texto multilinea
├── lib/                          # Utilidades y lógica de negocio
│   ├── auth.ts                   # Autenticación (JWT, cookies)
│   ├── utils.ts                  # Funciones utilitarias (cn para clases)
│   └── quote.ts                  # Lógica de cotizaciones (tipos, cálculos, presets)
├── middleware.ts                 # Middleware de autenticación
├── .eslintrc.json                # Configuración ESLint (Next.js + TypeScript)
├── .gitignore                    # Archivos ignorados por Git
├── next.config.mjs               # Configuración Next.js
├── next-env.d.ts                 # Tipos de Next.js
├── package.json                  # Dependencias y scripts
├── postcss.config.js             # Configuración PostCSS
├── tailwind.config.ts            # Configuración Tailwind CSS
└── tsconfig.json                 # Configuración TypeScript
```

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:3000)
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Ejecutar ESLint
npm run lint
```

---

## Convenciones de Código

### Estilo y Formato

- **Idioma:** El código usa nombres en español para dominio de negocio (conceptos de albañilería), pero nombres técnicos en inglés.
- **Comillas:** Dobles para strings (`"texto"`).
- **Punto y coma:** Siempre al final de las sentencias.
- **Indentación:** 2 espacios.
- **Longitud de línea:** No hay límite estricto, pero mantener legibilidad.

### Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `Button.tsx`, `CardHeader` |
| Funciones/variables | camelCase | `generateFolio`, `subtotalCentavos` |
| Tipos/Interfaces | PascalCase | `QuoteDraft`, `QuoteItem` |
| Constantes | UPPER_SNAKE_CASE | `STORAGE_KEY`, `WORK_PRESETS` |
| Props de componentes | PascalCase + Props | `ButtonProps`, `CardProps` |

### Organización de Imports

1. Imports de React/Next.js
2. Imports de componentes UI
3. Imports de utilidades/lib
4. Imports de tipos (con `type`)

Ejemplo:
```typescript
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMXNFromCentavos, type QuoteDraft } from "@/lib/quote";
```

---

## Arquitectura de la Aplicación

### Modelo de Datos

La aplicación maneja cotizaciones con la siguiente estructura:

**QuoteDraft** - Borrador de cotización:
- `folio`: string - Identificador único (formato: COT-YYYYMMDD-HHMM)
- `fecha`: string - Fecha en formato ISO (YYYY-MM-DD)
- `cotizador`: string - Nombre del cotizador
- `nombreNegocio`: string - Nombre del negocio
- `ubicacionNegocio`: string - Ubicación
- `telefonoNegocio`: string - Teléfono del negocio
- `clienteNombre`: string - Nombre del cliente
- `clienteTelefono`: string - Teléfono del cliente
- `notas`: string - Observaciones
- `items`: QuoteItem[] - Líneas de la cotización

**QuoteItem** - Línea de cotización:
- `id`: string - Identificador único
- `concepto`: string - Descripción del trabajo
- `cantidad`: number - Cantidad
- `unidad`: string - Unidad de medida
- `costoUnitarioCentavos`: number - Precio unitario en centavos (para evitar decimales)

### Manejo de Moneda

- Todos los precios se almacenan en **centavos** (entero) para evitar problemas de precisión con floats.
- Conversión: `$1.00 MXN = 100 centavos`
- Funciones clave: `toCentavos()`, `fromCentavos()`, `formatMXNFromCentavos()`

### Presets de Trabajo

El archivo `lib/quote.ts` contiene `WORK_PRESETS`: un catálogo de conceptos de albañilería comunes con unidades y precios predefinidos. Estos permiten autocompletar cuando el usuario escribe un concepto conocido.

### Persistencia

- **localStorage**: Se usa para autoguardado del borrador (`STORAGE_KEY = "cotizacion_tomas_borrador_v1"`).
- El autoguardado ocurre 300ms después de cualquier cambio.
- Existe funcionalidad de "Deshacer limpieza" usando un backup en memoria.

### Exportación a PDF

No se usa librería de PDF. La exportación se realiza mediante:
1. Una sección oculta (`.print-only`) con diseño optimizado para impresión
2. `window.print()` para abrir el diálogo de impresión del navegador
3. El usuario selecciona "Guardar como PDF"

### Autenticación

El sistema usa JWT con cookies HTTP-only:

**Flujo:**
1. Usuario ingresa en `/login` con credenciales (Tomas / bokoba)
2. API valida y genera JWT firmado
3. Cookie HTTP-only se establece con 1 año de duración
4. Middleware verifica JWT en cada petición
5. Logout limpia la cookie

**Archivos clave:**
- `lib/auth.ts` - Funciones de JWT
- `middleware.ts` - Protección de rutas
- `app/api/auth/login/route.ts` - Endpoint de login
- `app/api/auth/logout/route.ts` - Endpoint de logout
- `app/login/page.tsx` - Página de login

### Historial de Cotizaciones

Las cotizaciones guardadas se almacenan en localStorage:
- **Clave:** `cotizacion_tomas_guardadas_v1`
- **Formato:** Array de `SavedQuote` con metadatos
- **Funciones:** `saveQuote()`, `getSavedQuotes()`, `deleteSavedQuote()`, etc.

Accesible en `/lista-de-cotizaciones`:
- Búsqueda en tiempo real
- Duplicar cotización
- Cargar como borrador
- Eliminar permanentemente

---

## Componentes UI

Los componentes están en `components/ui/` y siguen el patrón de **shadcn/ui**:

- Usan `React.forwardRef` para forwarded refs
- Composición mediante subcomponentes (ej: `Card`, `CardHeader`, `CardContent`)
- Clases de Tailwind con `cn()` para merge condicional
- Variantes definidas como objetos const (ej: `variantClasses`, `sizeClasses`)

### Componentes Personalizados

**SearchableSelect** (`components/ui/searchable-select.tsx`)
- Dropdown searchable para reemplazar `<datalist>` en móvil
- Props: `options`, `value`, `onValueChange`, `placeholder`
- Características:
  - Búsqueda en tiempo real (normalizada, ignora acentos)
  - Navegación con teclado (Enter, Escape)
  - Cierre al hacer click fuera
  - Indicador visual de selección
  - Compatible con touch

**Uso:**
```tsx
<SearchableSelect
  options={WORK_PRESETS.map(p => ({ value: p.concepto, label: p.concepto, meta: p.unidad }))}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Buscar concepto..."
/>

### Patrón de Variantes

```typescript
const variantClasses = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  // ...
} as const;
```

---

## Estilos y Temas

### Tema

- **Modo:** Solo tema oscuro (dark mode)
- **Configuración:** Tailwind `darkMode: ["class"]`
- **CSS variables:** Definidas en `:root` en `globals.css` con valores HSL

### Breakpoints Responsivos

- Mobile: < 768px (`md:`)
- Desktop: >= 768px

La tabla de partidas cambia a tarjetas en mobile (`md:hidden` / `hidden md:block`).

### Autocompletado Mobile

El autocompletado de conceptos usa un componente personalizado `SearchableSelect` en móvil:
- **Problema con datalist**: HTML5 `<datalist>` no funciona bien en iOS Safari y Android
- **Solución**: Componente `SearchableSelect` con dropdown personalizado
- **UX mejorada**: 
  - Toque para abrir dropdown
  - Búsqueda en tiempo real
  - Navegación con teclado
  - Cierre al tocar fuera

### Espaciado Mobile

Etiquetas en tarjetas móviles usan padding reducido (`p-1.5` = 6px = 3px por lado):
```tsx
<div className="rounded-md border border-slate-700 bg-slate-900/50 p-1.5">
  <p className="text-[10px] uppercase tracking-wide text-slate-500">Cantidad</p>
```

### Animaciones

- Clase `.reveal-up` para animación de entrada ascendente
- Delay variants: `data-delay="1"`, `"2"`, `"3"`
- Respeto a `prefers-reduced-motion`

### Print Styles

- `.no-print`: Oculta elementos en impresión
- `.print-only`: Muestra solo en impresión
- `.print-borderless`: Elimina bordes y sombras al imprimir

---

## Consideraciones de Seguridad

### Autenticación
- **Sistema:** JWT con cookies HTTP-only
- **Usuario:** Tomas / bokoba (hardcoded para uso interno)
- **Expiración:** 1 año (sin expiración para herramienta interna)
- **Protección:** Middleware protege todas las rutas excepto `/login`
- **Logout:** Limpia la cookie de autenticación

### Datos
- Datos sensibles del cliente se almacenan solo en localStorage del navegador.
- No hay base de datos externa - todo es local al navegador.
- Validación de inputs numéricos con `sanitizePositiveNumber()` para evitar valores negativos.
- Normalización de datos cargados de localStorage con `normalizeDraft()` para prevenir errores de corrupción.

### Recomendaciones para Producción en Vercel
Para persistencia de datos más robusta en Vercel:
- **Vercel KV** (Redis) - Ideal para datos simples, sesiones, cache
- **Vercel Postgres** - Para datos relacionales complejos
- **Upstash Redis** - Alternativa con free tier generoso

---

## Guía para Contribuciones

### Agregar Nuevos Presets de Trabajo

Editar `lib/quote.ts` y agregar a `WORK_PRESETS`:

```typescript
{ 
  concepto: "Nombre del trabajo", 
  unidad: "unidad", 
  costoUnitarioCentavos: 50000  // $500.00 MXN
}
```

Para precios variables (que el usuario debe ingresar):
```typescript
{ 
  concepto: "Nombre del trabajo", 
  manualPricing: true 
}
```

### Agregar Nuevas Unidades de Medida

Editar `RAW_UNIT_OPTIONS` en `lib/quote.ts`:

```typescript
{ value: "nueva_unidad", label: "Nueva Unidad" }
```

Las unidades se ordenan automáticamente alfabéticamente (excepto "Sin unidad" que siempre va primero).

### Unidades Disponibles (Ordenadas Alfabéticamente)

- Sin unidad
- Bulto, Caja, Centimetros, Costal, Cubeta
- Destajo, Dia
- Galon
- Hora, Hoja
- Jornada, Juego
- Kilogramo
- Litro, Lote
- Mes, Metro lineal, Metros, Metros cuadrados, Metros cubicos, Milimetros
- Paquete, Panel, Pieza, Pies, Placa, Pulgadas
- Rollo
- Saco, Semana, Servicio
- Tonelada, Tramo
- Unidad
- Viaje

### Modificar Estilos

- **Tema/colores:** `app/globals.css` (CSS variables)
- **Configuración Tailwind:** `tailwind.config.ts`
- **Componentes específicos:** Archivos en `components/ui/`

---

## Solución de Problemas Comunes

### El borrador no se carga
- Verificar que `localStorage` no esté deshabilitado en el navegador.
- Los datos corruptos se reemplazan automáticamente con un borrador por defecto.

### Los precios no se formatean correctamente
- Asegurar que los precios estén en centavos (multiplicar por 100).
- Usar `formatMXNFromCentavos()` para mostrar al usuario.

### Problemas de impresión PDF
- Verificar que no haya elementos `.no-print` bloqueando contenido.
- Revisar estilos `@media print` en `globals.css`.

---

## Dependencias del Sistema

- **Node.js:** 18+
- **npm:** Incluido con Node.js
- **Navegadores soportados:** Chrome, Firefox, Safari, Edge (últimas 2 versiones)
