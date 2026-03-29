export type QuoteItem = {
  id: string;
  concepto: string;
  cantidad: number;
  unidad: string;
  costoUnitarioCentavos: number;
};

export type UnitOption = {
  value: string;
  label: string;
};

export type WorkPreset = {
  concepto: string;
  unidad?: string;
  costoUnitarioCentavos?: number;
  manualPricing?: boolean;
};

export type QuoteDraft = {
  folio: string;
  fecha: string;
  cotizador: string;
  nombreNegocio: string;
  ubicacionNegocio: string;
  telefonoNegocio: string;
  clienteNombre: string;
  clienteTelefono: string;
  notas: string;
  items: QuoteItem[];
};

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getTodayInputDate(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateFolio(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `COT-${year}${month}${day}-${hours}${minutes}`;
}

export function createEmptyItem(): QuoteItem {
  return {
    id: randomId(),
    concepto: "",
    cantidad: 1,
    unidad: "",
    costoUnitarioCentavos: 0
  };
}

export const UNIT_OPTIONS: UnitOption[] = [
  { value: "", label: "Sin unidad" },
  { value: "metro lineal", label: "Metro lineal" },
  { value: "metros", label: "Metros" },
  { value: "metros cuadrados", label: "Metros cuadrados" },
  { value: "metros cubicos", label: "Metros cubicos" },
  { value: "centimetros", label: "Centimetros" },
  { value: "milimetros", label: "Milimetros" },
  { value: "pulgadas", label: "Pulgadas" },
  { value: "pies", label: "Pies" },
  { value: "lote", label: "Lote" },
  { value: "pieza", label: "Pieza" },
  { value: "unidad", label: "Unidad" },
  { value: "juego", label: "Juego" },
  { value: "tramo", label: "Tramo" },
  { value: "rollo", label: "Rollo" },
  { value: "hoja", label: "Hoja" },
  { value: "placa", label: "Placa" },
  { value: "panel", label: "Panel" },
  { value: "caja", label: "Caja" },
  { value: "paquete", label: "Paquete" },
  { value: "bulto", label: "Bulto" },
  { value: "saco", label: "Saco" },
  { value: "costal", label: "Costal" },
  { value: "cubeta", label: "Cubeta" },
  { value: "litro", label: "Litro" },
  { value: "galon", label: "Galon" },
  { value: "kilogramo", label: "Kilogramo" },
  { value: "tonelada", label: "Tonelada" },
  { value: "viaje", label: "Viaje" },
  { value: "hora", label: "Hora" },
  { value: "dia", label: "Dia" },
  { value: "jornada", label: "Jornada" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "servicio", label: "Servicio" },
  { value: "destajo", label: "Destajo" }
];

export function getUnitOptions(currentUnit = "") {
  if (!currentUnit.trim()) {
    return UNIT_OPTIONS;
  }

  if (UNIT_OPTIONS.some((option) => option.value === currentUnit)) {
    return UNIT_OPTIONS;
  }

  return [
    { value: currentUnit, label: `${currentUnit} (actual)` },
    ...UNIT_OPTIONS
  ];
}

export const WORK_PRESETS: WorkPreset[] = [
  { concepto: "Cimentacion", unidad: "metro lineal", costoUnitarioCentavos: 30000 },
  { concepto: "Dados de 30x30", unidad: "pieza", costoUnitarioCentavos: 5000 },
  { concepto: "Castillos", unidad: "metro lineal", costoUnitarioCentavos: 13000 },
  { concepto: "Cadena cimentacion", unidad: "metro lineal", costoUnitarioCentavos: 11000 },
  { concepto: "Cadena nivelacion", unidad: "metro lineal", costoUnitarioCentavos: 16000 },
  { concepto: "Techado con viga y bovedilla", unidad: "metros cuadrados", costoUnitarioCentavos: 80000 },
  { concepto: "Pretil", unidad: "metro lineal", costoUnitarioCentavos: 10000 },
  { concepto: "Media cana", unidad: "metro lineal", costoUnitarioCentavos: 8000 },
  {
    concepto: "Dados de 60x60 para columna de 25x25",
    unidad: "pieza",
    costoUnitarioCentavos: 100000
  },
  { concepto: "Columna con Armex de 25x25", unidad: "pieza", costoUnitarioCentavos: 110000 },
  {
    concepto: "Columna con armado cabilla 25x25",
    unidad: "pieza",
    costoUnitarioCentavos: 220000
  },
  { concepto: "Trabe armada de 25x25", unidad: "metro lineal", costoUnitarioCentavos: 55000 },
  { concepto: "Trabe armada de 30x30", unidad: "metro lineal", costoUnitarioCentavos: 65000 },
  { concepto: "Bloqueo planta baja", unidad: "metros cuadrados", costoUnitarioCentavos: 13000 },
  { concepto: "Bloqueo planta alta", unidad: "metros cuadrados", costoUnitarioCentavos: 19000 },
  { concepto: "Repellado a tres capas", unidad: "metros cuadrados", costoUnitarioCentavos: 13000 },
  { concepto: "Masilla directa", unidad: "metros cuadrados", costoUnitarioCentavos: 5000 },
  { concepto: "Rich", unidad: "metros cuadrados", costoUnitarioCentavos: 5000 },
  { concepto: "Ahogados", unidad: "pieza", costoUnitarioCentavos: 12000 },
  { concepto: "Simbras", unidad: "pieza", costoUnitarioCentavos: 35000 },
  { concepto: "Perfilaciones", unidad: "pieza", costoUnitarioCentavos: 45000 },
  { concepto: "Mesetas", manualPricing: true },
  { concepto: "Mochetas", manualPricing: true },
  { concepto: "Piso rustico", unidad: "metros cuadrados", costoUnitarioCentavos: 18000 },
  { concepto: "Piso estampado", unidad: "metros cuadrados", costoUnitarioCentavos: 25000 },
  { concepto: "Chukum", unidad: "metros cuadrados", costoUnitarioCentavos: 19000 },
  { concepto: "Terraceo", unidad: "metros cuadrados", costoUnitarioCentavos: 4000 }
];

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function findWorkPreset(value: string) {
  const normalizedValue = normalizeSearchText(value);

  if (!normalizedValue) {
    return null;
  }

  return WORK_PRESETS.find((preset) => normalizeSearchText(preset.concepto) === normalizedValue) ?? null;
}

export function createDefaultDraft(date = new Date()): QuoteDraft {
  return {
    folio: generateFolio(date),
    fecha: getTodayInputDate(date),
    cotizador: "Tomás Dzul - Bokobá",
    nombreNegocio: "Bokobá Construcciones",
    ubicacionNegocio: "Bokobá, Yucatán",
    telefonoNegocio: "",
    clienteNombre: "",
    clienteTelefono: "",
    notas: "",
    items: [
      {
        id: randomId(),
        concepto: "Levantado de muro de block",
        cantidad: 12,
        unidad: "metros cuadrados",
        costoUnitarioCentavos: 42000
      },
      {
        id: randomId(),
        concepto: "Aplanado fino en interior",
        cantidad: 12,
        unidad: "metros cuadrados",
        costoUnitarioCentavos: 18000
      },
      {
        id: randomId(),
        concepto: "Suministro de mortero",
        cantidad: 8,
        unidad: "bulto",
        costoUnitarioCentavos: 13000
      }
    ]
  };
}

export function formatMXNFromCentavos(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value / 100);
}

export function toCentavos(value: string) {
  const clean = value.replace(/[^\d.,-]/g, "").replace(/,/g, "");
  const parsed = Number.parseFloat(clean);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed * 100);
}

export function fromCentavos(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  return (value / 100).toFixed(2);
}

export function sanitizePositiveNumber(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

export function getLineTotalCentavos(item: QuoteItem) {
  return Math.round(item.cantidad * item.costoUnitarioCentavos);
}

export function getSubtotalCentavos(items: QuoteItem[]) {
  return items.reduce((acc, item) => acc + getLineTotalCentavos(item), 0);
}

type UnknownRecord = Record<string, unknown>;

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizeDraft(payload: unknown) {
  const fallback = createDefaultDraft();
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate = payload as UnknownRecord;
  const normalizedItems = Array.isArray(candidate.items)
    ? candidate.items
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const raw = item as UnknownRecord;
          return {
            id: safeString(raw.id, randomId()),
            concepto: safeString(raw.concepto),
            cantidad: safeNumber(raw.cantidad, 0),
            unidad: safeString(raw.unidad).trim(),
            costoUnitarioCentavos: safeNumber(raw.costoUnitarioCentavos, 0)
          } as QuoteItem;
        })
        .filter((item): item is QuoteItem => item !== null)
    : [];

  return {
    folio: safeString(candidate.folio, fallback.folio),
    fecha: safeString(candidate.fecha, fallback.fecha),
    cotizador: safeString(candidate.cotizador, fallback.cotizador),
    nombreNegocio: safeString(candidate.nombreNegocio, fallback.nombreNegocio),
    ubicacionNegocio: safeString(candidate.ubicacionNegocio, fallback.ubicacionNegocio),
    telefonoNegocio: safeString(candidate.telefonoNegocio, fallback.telefonoNegocio),
    clienteNombre: safeString(candidate.clienteNombre),
    clienteTelefono: safeString(candidate.clienteTelefono),
    notas: safeString(candidate.notas),
    items: normalizedItems.length > 0 ? normalizedItems : fallback.items
  } as QuoteDraft;
}
