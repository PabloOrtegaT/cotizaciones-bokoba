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

// Saved Quote type for persistent storage
export type SavedQuote = QuoteDraft & {
  id: string;
  savedAt: string;
  totalCentavos: number;
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

// Raw unit options - will be sorted alphabetically with "Sin unidad" at top
const RAW_UNIT_OPTIONS: UnitOption[] = [
  { value: "", label: "Sin unidad" },
  { value: "bulto", label: "Bulto" },
  { value: "caja", label: "Caja" },
  { value: "centimetros", label: "Centimetros" },
  { value: "costal", label: "Costal" },
  { value: "cubeta", label: "Cubeta" },
  { value: "destajo", label: "Destajo" },
  { value: "dia", label: "Dia" },
  { value: "galon", label: "Galon" },
  { value: "hora", label: "Hora" },
  { value: "hoja", label: "Hoja" },
  { value: "jornada", label: "Jornada" },
  { value: "juego", label: "Juego" },
  { value: "kilogramo", label: "Kilogramo" },
  { value: "litro", label: "Litro" },
  { value: "lote", label: "Lote" },
  { value: "mes", label: "Mes" },
  { value: "metro lineal", label: "Metro lineal" },
  { value: "metros", label: "Metros" },
  { value: "metros cuadrados", label: "Metros cuadrados" },
  { value: "metros cubicos", label: "Metros cubicos" },
  { value: "milimetros", label: "Milimetros" },
  { value: "paquete", label: "Paquete" },
  { value: "panel", label: "Panel" },
  { value: "pieza", label: "Pieza" },
  { value: "pies", label: "Pies" },
  { value: "placa", label: "Placa" },
  { value: "pulgadas", label: "Pulgadas" },
  { value: "rollo", label: "Rollo" },
  { value: "saco", label: "Saco" },
  { value: "semana", label: "Semana" },
  { value: "servicio", label: "Servicio" },
  { value: "tonelada", label: "Tonelada" },
  { value: "tramo", label: "Tramo" },
  { value: "unidad", label: "Unidad" },
  { value: "viaje", label: "Viaje" }
];

// Sort alphabetically by label, keeping "Sin unidad" at the top
export const UNIT_OPTIONS: UnitOption[] = [
  RAW_UNIT_OPTIONS[0], // "Sin unidad" first
  ...RAW_UNIT_OPTIONS.slice(1).sort((a, b) => a.label.localeCompare(b.label, "es"))
];

export function getUnitOptions(currentUnit = "") {
  if (!currentUnit.trim()) {
    return UNIT_OPTIONS;
  }

  if (UNIT_OPTIONS.some((option) => option.value === currentUnit)) {
    return UNIT_OPTIONS;
  }

  return [
    { value: currentUnit, label: currentUnit },
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

// Storage key for saved quotes
const SAVED_QUOTES_KEY = "cotizacion_tomas_guardadas_v1";

// Get all saved quotes from localStorage
export function getSavedQuotes(): SavedQuote[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const saved = window.localStorage.getItem(SAVED_QUOTES_KEY);
  if (!saved) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(saved) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    
    return parsed
      .filter((item): item is SavedQuote => {
        if (!item || typeof item !== "object") return false;
        const q = item as Record<string, unknown>;
        return typeof q.id === "string" && typeof q.savedAt === "string";
      })
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
}

// Save a new quote
export function saveQuote(draft: QuoteDraft): SavedQuote {
  const savedQuote: SavedQuote = {
    ...draft,
    id: randomId(),
    savedAt: new Date().toISOString(),
    totalCentavos: getSubtotalCentavos(draft.items)
  };
  
  const existing = getSavedQuotes();
  const updated = [savedQuote, ...existing];
  window.localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(updated));
  
  return savedQuote;
}

// Update an existing saved quote
export function updateSavedQuote(id: string, draft: QuoteDraft): SavedQuote | null {
  const existing = getSavedQuotes();
  const index = existing.findIndex(q => q.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedQuote: SavedQuote = {
    ...draft,
    id,
    savedAt: new Date().toISOString(),
    totalCentavos: getSubtotalCentavos(draft.items)
  };
  
  existing[index] = updatedQuote;
  window.localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(existing));
  
  return updatedQuote;
}

// Delete a saved quote
export function deleteSavedQuote(id: string): boolean {
  const existing = getSavedQuotes();
  const filtered = existing.filter(q => q.id !== id);
  
  if (filtered.length === existing.length) {
    return false;
  }
  
  window.localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(filtered));
  return true;
}

// Load a saved quote as draft
export function loadQuoteAsDraft(savedQuote: SavedQuote): QuoteDraft {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, savedAt: _savedAt, totalCentavos: _totalCentavos, ...draft } = savedQuote;
  return {
    ...draft,
    folio: generateFolio(), // Generate new folio when loading
    fecha: getTodayInputDate()
  };
}

// Duplicate a saved quote
export function duplicateSavedQuote(savedQuote: SavedQuote): SavedQuote {
  const draft = loadQuoteAsDraft(savedQuote);
  draft.folio = `${savedQuote.folio} (Copia)`;
  return saveQuote(draft);
}

// Format date for display
export function formatSavedDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Search quotes by client name or folio
export function searchSavedQuotes(quotes: SavedQuote[], query: string): SavedQuote[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return quotes;
  
  return quotes.filter(q => {
    const searchableText = `${q.clienteNombre} ${q.folio} ${q.nombreNegocio}`.toLowerCase();
    return searchableText.includes(normalizedQuery);
  });
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
