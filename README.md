# Cotizaciones Tomás Dzul

Aplicación en Next.js para crear cotizaciones de albañilería en español, con tabla editable, autoguardado local y exportación a PDF.

## Requisitos

- Node.js 18+
- npm

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Flujo de uso

1. Editar folio, datos del negocio, datos del cliente y partidas.
2. Agregar o eliminar filas según sea necesario.
3. Ir al final de la página, presionar `Exportar PDF` y en la ventana de impresión elegir `Guardar como PDF`.
4. Compartir el PDF generado por el medio que prefieras.

## Detalles

- Moneda: MXN (`$`) con formato `es-MX`.
- El borrador se guarda automáticamente en `localStorage`.
- Si se usa `Limpiar borrador`, puedes recuperar el estado anterior con `Deshacer limpieza`.
