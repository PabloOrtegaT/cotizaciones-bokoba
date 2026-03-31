"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/app/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createDefaultDraft,
  createEmptyItem,
  findWorkPreset,
  formatMXNFromCentavos,
  fromCentavos,
  generateFolio,
  getUnitOptions,
  getLineTotalCentavos,
  getSubtotalCentavos,
  getTodayInputDate,
  normalizeDraft,
  sanitizePositiveNumber,
  saveQuote,
  toCentavos,
  UNIT_OPTIONS,
  WORK_PRESETS,
  type QuoteDraft,
  type QuoteItem,
  type WorkPreset
} from "@/lib/quote";

const STORAGE_KEY = "cotizacion_tomas_borrador_v1";
const CONCEPT_AUTOCOMPLETE_ID = "conceptos-albanileria";

function formatCantidad(value: number) {
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  return value.toFixed(2);
}

function formatCantidadConUnidad(cantidad: number, unidad: string) {
  const cantidadFormateada = formatCantidad(cantidad);
  return unidad ? `${cantidadFormateada} ${unidad}` : cantidadFormateada;
}

function cloneDraftValue(value: QuoteDraft): QuoteDraft {
  return JSON.parse(JSON.stringify(value)) as QuoteDraft;
}

function formatCurrentTime() {
  return new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatWorkPresetMeta(preset: WorkPreset) {
  if (preset.manualPricing) {
    return "Precio variable";
  }

  const parts: string[] = [];

  if (preset.unidad) {
    parts.push(preset.unidad);
  }

  if (typeof preset.costoUnitarioCentavos === "number") {
    parts.push(formatMXNFromCentavos(preset.costoUnitarioCentavos));
  }

  return parts.join(" | ");
}

type ConceptAutocompleteFieldProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

function ConceptAutocompleteField({ id, value, onValueChange, className }: ConceptAutocompleteFieldProps) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder="Escribe o selecciona un concepto..."
      list={CONCEPT_AUTOCOMPLETE_ID}
      autoComplete="off"
      className={className}
    />
  );
}

type UnitSelectFieldProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

function UnitSelectField({ id, value, onValueChange, className }: UnitSelectFieldProps) {
  const options = getUnitOptions(value);

  return (
    <SearchableSelect
      id={id}
      options={options.map((opt) => ({
        value: opt.value,
        label: opt.label
      }))}
      value={value}
      onValueChange={onValueChange}
      placeholder="Seleccionar unidad..."
      allowFreeText={true}
      className={className}
    />
  );
}

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 animate-in slide-in-from-right ${
            toast.type === "success"
              ? "border border-emerald-500/30 bg-emerald-950/90 text-emerald-100"
              : toast.type === "error"
              ? "border border-red-500/30 bg-red-950/90 text-red-100"
              : "border border-slate-600 bg-slate-900/95 text-slate-100"
          }`}
        >
          {toast.type === "success" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" x2="9" y1="9" y2="15" />
              <line x1="9" x2="15" y1="9" y2="15" />
            </svg>
          )}
          {toast.type === "info" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="16" y2="12" />
              <line x1="12" x2="12.01" y1="8" y2="8" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 text-current opacity-60 hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [ultimoAutoguardado, setUltimoAutoguardado] = useState("");
  const [backupDraft, setBackupDraft] = useState<QuoteDraft | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(STORAGE_KEY);
    if (!savedDraft) {
      setDraft(createDefaultDraft());
      return;
    }

    try {
      setDraft(normalizeDraft(JSON.parse(savedDraft)));
    } catch {
      setDraft(createDefaultDraft());
    }
  }, []);

  useEffect(() => {
    if (!draft) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setUltimoAutoguardado(formatCurrentTime());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [draft]);

  const subtotalCentavos = useMemo(() => {
    if (!draft) {
      return 0;
    }
    return getSubtotalCentavos(draft.items);
  }, [draft]);

  const editingItem = useMemo(() => {
    if (!draft || !editingItemId) {
      return null;
    }
    return draft.items.find((item) => item.id === editingItemId) ?? null;
  }, [draft, editingItemId]);

  const updateField = <K extends keyof QuoteDraft>(field: K, value: QuoteDraft[K]) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      const updatedDraft = {
        ...current,
        [field]: value
      } as QuoteDraft;
      return {
        ...updatedDraft
      };
    });
  };

  const updateItem = <K extends keyof QuoteItem>(id: string, field: K, value: QuoteItem[K]) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) => {
          if (item.id !== id) {
            return item;
          }
          const updatedItem = {
            ...item,
            [field]: value
          } as QuoteItem;
          return updatedItem;
        })
      };
    });
  };

  const updateConceptItem = (id: string, concepto: string) => {
    const matchedPreset = findWorkPreset(concepto);

    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) => {
          if (item.id !== id) {
            return item;
          }

          if (!matchedPreset) {
            return {
              ...item,
              concepto
            };
          }

          if (matchedPreset.manualPricing) {
            return {
              ...item,
              concepto: matchedPreset.concepto,
              unidad: "",
              costoUnitarioCentavos: 0
            };
          }

          return {
            ...item,
            concepto: matchedPreset.concepto,
            unidad: matchedPreset.unidad ?? item.unidad,
            costoUnitarioCentavos: matchedPreset.costoUnitarioCentavos ?? item.costoUnitarioCentavos
          };
        })
      };
    });
  };

  const addRow = () => {
    const newItem = createEmptyItem();

    setDraft((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        items: [...current.items, newItem]
      };
    });

    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setEditingItemId(newItem.id);
    }
  };

  const removeRow = (id: string) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      if (current.items.length === 1) {
        return current;
      }
      return {
        ...current,
        items: current.items.filter((item) => item.id !== id)
      };
    });
  };

  const regenerateFolio = () => {
    const now = new Date();
    updateField("folio", generateFolio(now));
    updateField("fecha", getTodayInputDate(now));
  };

  const resetDraft = () => {
    if (!draft) {
      return;
    }

    const confirmed = window.confirm("Se limpiará el borrador actual. ¿Deseas continuar?");
    if (!confirmed) {
      return;
    }

    setBackupDraft(cloneDraftValue(draft));
    const freshDraft = createDefaultDraft();
    setDraft(freshDraft);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(freshDraft));
    setUltimoAutoguardado("");
  };

  const undoResetDraft = () => {
    if (!backupDraft) {
      return;
    }

    const restoredDraft = cloneDraftValue(backupDraft);
    setDraft(restoredDraft);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredDraft));
    setUltimoAutoguardado(formatCurrentTime());
    setBackupDraft(null);
  };

  const exportToPdf = () => {
    window.print();
  };

  const handleSaveQuote = () => {
    if (!draft) return;
    
    setIsSaving(true);
    
    try {
      saveQuote(draft);
      showToast("Cotización guardada exitosamente", "success");
    } catch {
      showToast("Error al guardar la cotización", "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (editingItemId && !editingItem) {
      setEditingItemId(null);
    }
  }, [editingItemId, editingItem]);

  useEffect(() => {
    if (!editingItem) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingItem]);

  if (!draft) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-1 sm:px-0">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Header Card */}
        <Card className="no-print border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-100">Cotización de Albañilería</CardTitle>
              <CardDescription className="text-slate-400">
                Edita los datos y exporta a PDF con impresión del navegador. Moneda en MXN.
              </CardDescription>
              <p className="text-xs text-slate-500">
                Último autoguardado local: {ultimoAutoguardado ? `${ultimoAutoguardado} hrs` : "pendiente"}
              </p>
            </div>
            <div className="grid w-full gap-2 sm:w-auto sm:min-w-[280px]">
              <Button
                variant="outline"
                onClick={handleSaveQuote}
                disabled={isSaving}
                className="border-emerald-600/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300"
              >
                {isSaving ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                )}
                Guardar Cotización
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={regenerateFolio} className="border-slate-600 hover:bg-slate-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  Nuevo folio
                </Button>
                <Button variant="outline" onClick={resetDraft} className="border-slate-600 hover:bg-slate-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Limpiar
                </Button>
              </div>
              <Button
                variant="secondary"
                onClick={undoResetDraft}
                disabled={!backupDraft}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 7v6h6" />
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
                Deshacer limpieza
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="no-print border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-400"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Datos de la cotización
            </CardTitle>
            <CardDescription className="text-slate-400">Todos los campos son editables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="folio" className="text-slate-300">Folio</Label>
                <Input
                  id="folio"
                  value={draft.folio}
                  onChange={(event) => updateField("folio", event.target.value)}
                  placeholder="COT-YYYYMMDD-0001"
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha" className="text-slate-300">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={draft.fecha}
                  onChange={(event) => updateField("fecha", event.target.value)}
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cotizador" className="text-slate-300">Cotizador</Label>
                <Input
                  id="cotizador"
                  value={draft.cotizador}
                  onChange={(event) => updateField("cotizador", event.target.value)}
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="negocio" className="text-slate-300">Nombre del negocio</Label>
                <Input
                  id="negocio"
                  value={draft.nombreNegocio}
                  onChange={(event) => updateField("nombreNegocio", event.target.value)}
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ubicacion" className="text-slate-300">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={draft.ubicacionNegocio}
                  onChange={(event) => updateField("ubicacionNegocio", event.target.value)}
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel-negocio" className="text-slate-300">Teléfono del negocio</Label>
                <Input
                  id="tel-negocio"
                  value={draft.telefonoNegocio}
                  onChange={(event) => updateField("telefonoNegocio", event.target.value)}
                  placeholder="9991234567"
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente" className="text-slate-300">Cliente - Nombre</Label>
                <Input
                  id="cliente"
                  value={draft.clienteNombre}
                  onChange={(event) => updateField("clienteNombre", event.target.value)}
                  placeholder="Nombre completo del cliente"
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel-cliente" className="text-slate-300">Cliente - Teléfono</Label>
                <Input
                  id="tel-cliente"
                  value={draft.clienteTelefono}
                  onChange={(event) => updateField("clienteTelefono", event.target.value)}
                  placeholder="Número de contacto del cliente"
                  className="border-slate-600 bg-slate-900/50 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="no-print border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-400"
              >
                <path d="M12 2H2v10h10V2zM22 2h-10v10h10V2zM22 14h-10v10h10V14zM12 14H2v10h10V14z" />
              </svg>
              Partidas
            </CardTitle>
            <CardDescription className="text-slate-400">
              Modifica conceptos, cantidades y costos unitarios. Selecciona un concepto del catálogo para
              autocompletar unidad y precio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 md:hidden">
              {draft.items.map((item, index) => (
                <article key={item.id} className="rounded-md border border-slate-700 bg-slate-800/90 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">Partida #{index + 1}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        {item.concepto.trim() || "Sin concepto"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">
                      {formatMXNFromCentavos(getLineTotalCentavos(item))}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-slate-700 bg-slate-900/50 px-2 py-1.5 min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500 truncate">Cantidad</p>
                      <p className="text-sm text-slate-200 truncate">{formatCantidadConUnidad(item.cantidad, item.unidad)}</p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-900/50 px-2 py-1.5 min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500 truncate">Costo unit.</p>
                      <p className="text-sm text-slate-200 truncate">{formatMXNFromCentavos(item.costoUnitarioCentavos)}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setEditingItemId(item.id)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-300 hover:bg-red-950/60 hover:text-red-200"
                      onClick={() => removeRow(item.id)}
                      disabled={draft.items.length === 1}
                    >
                      Eliminar
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead className="min-w-[260px]">Concepto</TableHead>
                    <TableHead className="w-[140px]">Cantidad</TableHead>
                    <TableHead className="w-[120px]">Unidad</TableHead>
                    <TableHead className="w-[170px] text-right">Costo Unitario</TableHead>
                    <TableHead className="w-[180px] text-right">Importe</TableHead>
                    <TableHead className="w-[100px] text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draft.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <ConceptAutocompleteField
                          value={item.concepto}
                          onValueChange={(value) => updateConceptItem(item.id, value)}
                        />
                      </TableCell>
                      <TableCell>
                        <NumericInput
                          min={0}
                          step={0.01}
                          decimals={2}
                          value={item.cantidad}
                          onChange={(value) =>
                            updateItem(item.id, "cantidad", value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <UnitSelectField
                          value={item.unidad}
                          onValueChange={(value) => updateItem(item.id, "unidad", value)}
                        />
                      </TableCell>
                      <TableCell>
                        <NumericInput
                          min={0}
                          step={0.01}
                          decimals={2}
                          value={fromCentavos(item.costoUnitarioCentavos)}
                          onChange={(value) =>
                            updateItem(item.id, "costoUnitarioCentavos", Math.round(value * 100))
                          }
                          className="text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-100">
                        {formatMXNFromCentavos(getLineTotalCentavos(item))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          className="text-red-300 hover:bg-red-950/60 hover:text-red-200"
                          onClick={() => removeRow(item.id)}
                          disabled={draft.items.length === 1}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right text-base font-bold text-slate-100">
                      {formatMXNFromCentavos(subtotalCentavos)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <Button variant="outline" onClick={addRow} className="w-full md:w-auto">
              Agregar fila
            </Button>
          </CardContent>
        </Card>

        <Card className="no-print border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="grid gap-6 pt-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="notas" className="text-slate-300">Notas u observaciones</Label>
              <Textarea
                id="notas"
                value={draft.notas}
                onChange={(event) => updateField("notas", event.target.value)}
                placeholder="Ej. Tiempo de entrega, forma de pago, alcances del trabajo..."
                className="border-slate-600 bg-slate-900/50 text-slate-100 placeholder:text-slate-600"
              />
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-4">
              <p className="text-sm font-semibold text-slate-200">Resumen</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Moneda</span>
                  <span className="font-medium text-slate-200">MXN ($)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-2">
                  <span className="text-base font-semibold text-slate-100">Total</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {formatMXNFromCentavos(subtotalCentavos)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="no-print border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
              <span>Se abrirá el diálogo de impresión del navegador</span>
            </div>
            <Button
              onClick={exportToPdf}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              Exportar PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {editingItem ? (
        <section className="no-print fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby="titulo-editar-partida">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setEditingItemId(null)}
            aria-label="Cerrar editor de partida"
          />
          <div className="absolute inset-0 flex flex-col bg-slate-900 px-4 pb-5 pt-4">
            <div className="flex items-center justify-between">
              <h2 id="titulo-editar-partida" className="text-lg font-semibold text-slate-100">
                Editar partida
              </h2>
              <Button variant="ghost" onClick={() => setEditingItemId(null)}>
                Cerrar
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-400">Los cambios se guardan automáticamente.</p>

            <div className="mt-4 flex-1 space-y-4 overflow-y-auto pb-4">
              {/* Concept - Using SearchableSelect for better mobile UX */}
              <div className="space-y-1.5">
                <Label htmlFor="movil-concepto" className="text-xs text-slate-400">Concepto</Label>
                <SearchableSelect
                  id="movil-concepto"
                  options={WORK_PRESETS.map((preset) => ({
                    value: preset.concepto,
                    label: preset.concepto,
                    meta: formatWorkPresetMeta(preset),
                  }))}
                  value={editingItem.concepto}
                  onValueChange={(value) => updateConceptItem(editingItem.id, value)}
                  placeholder="Buscar concepto..."
                  allowFreeText={true}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="movil-cantidad" className="text-xs text-slate-400">Cantidad</Label>
                <NumericInput
                  id="movil-cantidad"
                  min={0}
                  step={0.01}
                  decimals={2}
                  value={editingItem.cantidad}
                  onChange={(value) => updateItem(editingItem.id, "cantidad", value)}
                  className="border-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="movil-unidad" className="text-xs text-slate-400">Unidad</Label>
                <SearchableSelect
                  id="movil-unidad"
                  options={UNIT_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: opt.label
                  }))}
                  value={editingItem.unidad}
                  onValueChange={(value) => updateItem(editingItem.id, "unidad", value)}
                  placeholder="Seleccionar unidad..."
                  allowFreeText={true}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="movil-costo-unitario" className="text-xs text-slate-400">Costo unitario</Label>
                <NumericInput
                  id="movil-costo-unitario"
                  min={0}
                  step={0.01}
                  decimals={2}
                  value={fromCentavos(editingItem.costoUnitarioCentavos)}
                  onChange={(value) => updateItem(editingItem.id, "costoUnitarioCentavos", Math.round(value * 100))}
                  placeholder="0.00"
                  className="border-slate-600"
                />
              </div>

              <div className="rounded-md border border-slate-700 bg-slate-800/80 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Importe</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">
                  {formatMXNFromCentavos(getLineTotalCentavos(editingItem))}
                </p>
              </div>
            </div>

            <Button onClick={() => setEditingItemId(null)} className="w-full">
              Cerrar
            </Button>
          </div>
        </section>
      ) : null}

      <datalist id={CONCEPT_AUTOCOMPLETE_ID}>
        {WORK_PRESETS.map((preset) => {
          const meta = formatWorkPresetMeta(preset);

          return (
            <option key={preset.concepto} value={preset.concepto} label={meta}>
              {meta}
            </option>
          );
        })}
      </datalist>

      <section className="print-only print-borderless mx-auto mt-0 max-w-4xl bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between border-b border-slate-300 pb-4">
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-slate-900 text-lg font-bold">
              BD
            </div>
            <div>
              <h1 className="text-xl font-bold">{draft.nombreNegocio}</h1>
              <p className="text-sm">{draft.ubicacionNegocio}</p>
              <p className="text-sm">{draft.telefonoNegocio || "Sin teléfono de negocio"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">Cotización</p>
            <p className="text-sm">
              <span className="font-semibold">Folio:</span> {draft.folio}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Fecha:</span> {draft.fecha}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Cotizador:</span> {draft.cotizador}
            </p>
          </div>
        </header>

        <section className="mt-6 text-sm">
          <p className="font-semibold">Cliente</p>
          <p>{draft.clienteNombre || "Sin nombre de cliente"}</p>
          <p>{draft.clienteTelefono || "Sin teléfono de cliente"}</p>
        </section>

        <section className="mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-slate-300 bg-slate-100">
                <th className="px-2 py-2 text-left">Item</th>
                <th className="px-2 py-2 text-left">Concepto</th>
                <th className="px-2 py-2 text-right">Cantidad</th>
                <th className="px-2 py-2 text-right">Costo Unitario</th>
                <th className="px-2 py-2 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {draft.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{item.concepto || "-"}</td>
                  <td className="px-2 py-2 text-right">{formatCantidadConUnidad(item.cantidad, item.unidad)}</td>
                  <td className="px-2 py-2 text-right">{formatMXNFromCentavos(item.costoUnitarioCentavos)}</td>
                  <td className="px-2 py-2 text-right font-semibold">{formatMXNFromCentavos(getLineTotalCentavos(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 ml-auto w-full max-w-sm rounded-md border border-slate-300 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatMXNFromCentavos(subtotalCentavos)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-300 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatMXNFromCentavos(subtotalCentavos)}</span>
          </div>
        </section>

        <section className="mt-6 text-sm">
          <p className="font-semibold">Notas</p>
          <p className="whitespace-pre-line">{draft.notas || "Sin observaciones."}</p>
        </section>

        <footer className="mt-8 text-xs text-slate-500">Precios expresados en MXN.</footer>
      </section>
    </main>
  );
}
