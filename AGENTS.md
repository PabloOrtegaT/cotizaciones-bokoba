# Cotizaciones Tomás Dzul - Guía para Agentes

**Stack:** Next.js 14 + React 18 + TypeScript + Tailwind CSS + ESLint

## Comandos

```bash
# Desarrollo
npm run dev          # Servidor dev en http://localhost:3000

# Producción
npm run build        # Build estático
npm start            # Servidor de producción

# Linting
npm run lint         # Ejecutar ESLint
npx eslint . --fix   # Auto-fix problemas
```

**Nota:** No hay tests configurados. Para agregar tests, usar `jest` o `vitest` + `@testing-library/react`.

## Estructura

```
app/                    # Next.js App Router
├── page.tsx           # Página principal (generador)
├── layout.tsx         # Layout raíz
├── login/page.tsx     # Login
├── lista-de-cotizaciones/page.tsx  # Historial
└── api/auth/          # Endpoints de autenticación

components/ui/         # Componentes UI (estilo shadcn)
├── button.tsx, card.tsx, input.tsx, etc.

lib/
├── quote.ts           # Lógica de cotizaciones
├── auth.ts            # JWT y autenticación
└── utils.ts           # cn() para clases Tailwind
```

## Convenciones de Código

### Estilo
- **Idioma:** Español para dominio de negocio, inglés para técnicos
- **Comillas:** Dobles (`"texto"`)
- **Punto y coma:** Siempre
- **Indentación:** 2 espacios
- **TypeScript:** Strict mode activado

### Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `Button.tsx`, `CardHeader` |
| Funciones/variables | camelCase | `generateFolio`, `saveQuote` |
| Tipos/Interfaces | PascalCase | `QuoteDraft`, `QuoteItem` |
| Constantes | UPPER_SNAKE_CASE | `STORAGE_KEY`, `WORK_PRESETS` |

### Imports

Orden:
1. React/Next.js
2. Componentes UI
3. Utilidades (`@/lib/*`)
4. Tipos (con `type`)

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatMXNFromCentavos, type QuoteDraft } from "@/lib/quote";
```

### Tipos

- Usar `type` en lugar de `interface` para consistencia
- Tipos en `lib/quote.ts` para datos de negocio
- Props de componentes: `ButtonProps`, `CardProps`

```typescript
export type QuoteItem = {
  id: string;
  concepto: string;
  cantidad: number;
  unidad: string;
  costoUnitarioCentavos: number;
};
```

### Componentes

- Usar `React.forwardRef` para forwarded refs
- Composición con subcomponentes (Card → CardHeader, CardContent)
- Clases con `cn()` para merge condicional
- Variantes como objetos `as const`

```typescript
const variantClasses = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("base-classes", variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

### Moneda

- Almacenar en **centavos** (enteros) para evitar floats
- Funciones: `toCentavos()`, `fromCentavos()`, `formatMXNFromCentavos()`
- `$1.00 MXN = 100 centavos`

### Persistencia

- localStorage para autoguardado
- Claves: `"cotizacion_tomas_borrador_v1"`, `"cotizacion_tomas_guardadas_v1"`

### Autenticación

- JWT con cookies HTTP-only
- Middleware en `middleware.ts`
- Usuario: Tomas / bokoba
- Rutas protegidas excepto `/login`

## Reglas de Diseño

- **Tema:** Solo dark mode
- **Responsivo:** Mobile-first (`md:` breakpoint)
- **UI:** Estilo shadcn/ui con Tailwind
- **PDF:** `window.print()` con sección `.print-only`

## ESLint

Configuración mínima:
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

Siempre correr `npm run lint` antes de terminar cambios.

## Seguridad

- Nunca loguear secrets
- Validar inputs numéricos con `sanitizePositiveNumber()`
- Datos solo en localStorage (sin backend persistente)
- JWT con expiración de 1 año para uso interno

## Agregar Nuevos Presets

Editar `lib/quote.ts`:

```typescript
{
  concepto: "Nombre del trabajo",
  unidad: "unidad",
  costoUnitarioCentavos: 50000  // $500.00
}
```

Para precios variables: `manualPricing: true`
