"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/app/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  saveQuote,
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
      placeholder="Escribe o selecciona..."
      allowFreeText={true}
      showDropdownArrow={false}
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
            <div className="space-y-2 md:hidden">
              {draft.items.map((item, index) => (
                <article 
                  key={item.id} 
                  className="group flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/90 p-3 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800"
                >
                  {/* Número de partida */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-700/50 text-xs font-semibold text-slate-400">
                    {index + 1}
                  </div>

                  {/* Info principal: Concepto + resumen */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {item.concepto.trim() || "Sin concepto"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatCantidad(item.cantidad)} {item.unidad} × {formatMXNFromCentavos(item.costoUnitarioCentavos)}
                    </p>
                  </div>

                  {/* Importe total */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-cyan-400">
                      {formatMXNFromCentavos(getLineTotalCentavos(item))}
                    </p>
                  </div>

                  {/* Botones de acción - iconos compactos */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingItemId(item.id)}
                      className="h-9 w-9 text-slate-400 hover:bg-cyan-950/50 hover:text-cyan-400"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(item.id)}
                      disabled={draft.items.length === 1}
                      className="h-9 w-9 text-slate-400 hover:bg-red-950/50 hover:text-red-400 disabled:opacity-30"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden md:block">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 overflow-hidden shadow-2xl shadow-black/20">
                {/* Header con gradiente sutil */}
                <div className="grid grid-cols-[60px_1fr_120px_100px_140px_140px_80px] gap-4 px-6 py-4 bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 border-b border-slate-700/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">#</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Concepto</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Cantidad</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Unidad</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Costo Unit.</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Importe</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Acción</div>
                </div>

                {/* Filas de datos con mejor diseño */}
                <div className="divide-y divide-slate-800/50">
                  {draft.items.map((item, index) => (
                    <div 
                      key={item.id}
                      className="group grid grid-cols-[60px_1fr_120px_100px_140px_140px_80px] gap-4 px-6 py-4 items-center transition-all duration-200 hover:bg-slate-800/40"
                    >
                      {/* Número de partida */}
                      <div className="flex justify-center">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-700/50 text-xs font-semibold text-slate-400">
                          {index + 1}
                        </span>
                      </div>

                      {/* Concepto */}
                      <div className="min-w-0">
                        <ConceptAutocompleteField
                          value={item.concepto}
                          onValueChange={(value) => updateConceptItem(item.id, value)}
                          className="border-slate-600/50 bg-slate-800/50 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        />
                      </div>

                      {/* Cantidad */}
                      <div>
                        <NumericInput
                          min={0}
                          step={0.01}
                          decimals={2}
                          value={item.cantidad}
                          onChange={(value) => updateItem(item.id, "cantidad", value)}
                          className="border-slate-600/50 bg-slate-800/50 text-right focus:border-cyan-500/50"
                        />
                      </div>

                      {/* Unidad */}
                      <div>
                        <UnitSelectField
                          value={item.unidad}
                          onValueChange={(value) => updateItem(item.id, "unidad", value)}
                          className="border-slate-600/50 bg-slate-800/50"
                        />
                      </div>

                      {/* Costo Unitario */}
                      <div>
                        <NumericInput
                          min={0}
                          step={0.01}
                          decimals={2}
                          value={fromCentavos(item.costoUnitarioCentavos)}
                          onChange={(value) =>
                            updateItem(item.id, "costoUnitarioCentavos", Math.round(value * 100))
                          }
                          className="border-slate-600/50 bg-slate-800/50 text-right focus:border-cyan-500/50"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Importe */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-cyan-400 tabular-nums">
                          {formatMXNFromCentavos(getLineTotalCentavos(item))}
                        </span>
                      </div>

                      {/* Botón eliminar con icono */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => removeRow(item.id)}
                          disabled={draft.items.length === 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                          title="Eliminar partida"
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
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer con total */}
                <div className="grid grid-cols-[60px_1fr_120px_100px_140px_140px_80px] gap-4 px-6 py-5 bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-800/60 border-t border-slate-700/50">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Total</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-400 tabular-nums">
                      {formatMXNFromCentavos(subtotalCentavos)}
                    </span>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={addRow} 
              className="w-full md:w-auto group border-dashed border-slate-600 hover:border-cyan-500 hover:bg-cyan-950/20 transition-all duration-200"
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
                className="mr-2 text-slate-400 group-hover:text-cyan-400 transition-colors"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Agregar partida
            </Button>
          </CardContent>
        </Card>

        <Card className="no-print border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="grid gap-6 pt-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="notas" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Notas u observaciones
              </Label>
              <Textarea
                id="notas"
                value={draft.notas}
                onChange={(event) => updateField("notas", event.target.value)}
                placeholder="Ej. Tiempo de entrega, forma de pago, alcances del trabajo, condiciones especiales..."
                className="min-h-[120px] border-slate-600/50 bg-slate-900/30 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 resize-none"
              />
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 p-5 shadow-inner">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Resumen de cotización</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Partidas</span>
                  <span className="font-medium text-slate-200">{draft.items.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Moneda</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    MXN
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-slate-300">Total</span>
                    <span className="text-2xl font-bold text-emerald-400 tabular-nums tracking-tight">
                      {formatMXNFromCentavos(subtotalCentavos)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="no-print rounded-xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-slate-800/50 p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50">
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="16" y2="12" />
                  <line x1="12" x2="12.01" y1="8" y2="8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Listo para exportar</p>
                <p className="text-xs text-slate-500">Se abrirá el diálogo de impresión del navegador</p>
              </div>
            </div>
            
            <Button
              onClick={exportToPdf}
              className="group bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
            >
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
                className="mr-2 group-hover:scale-110 transition-transform"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              Exportar a PDF
            </Button>
          </div>
        </div>
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
                  placeholder="Escribe o selecciona..."
                  allowFreeText={true}
                  showDropdownArrow={false}
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
                <UnitSelectField
                  id="movil-unidad"
                  value={editingItem.unidad}
                  onValueChange={(value) => updateItem(editingItem.id, "unidad", value)}
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
