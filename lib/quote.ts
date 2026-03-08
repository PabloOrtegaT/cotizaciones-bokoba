export type QuoteItem = {
  id: string;
  concepto: string;
  cantidad: number;
  unidad: string;
  costoUnitarioCentavos: number;
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
    unidad: "m2",
    costoUnitarioCentavos: 0
  };
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
        unidad: "m2",
        costoUnitarioCentavos: 42000
      },
      {
        id: randomId(),
        concepto: "Aplanado fino en interior",
        cantidad: 12,
        unidad: "m2",
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
            unidad: safeString(raw.unidad, "m2"),
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
