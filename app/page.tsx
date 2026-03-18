"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createDefaultDraft,
  createEmptyItem,
  formatMXNFromCentavos,
  fromCentavos,
  generateFolio,
  getLineTotalCentavos,
  getSubtotalCentavos,
  getTodayInputDate,
  normalizeDraft,
  sanitizePositiveNumber,
  toCentavos,
  type QuoteDraft,
  type QuoteItem
} from "@/lib/quote";

const STORAGE_KEY = "cotizacion_tomas_borrador_v1";

function formatCantidad(value: number) {
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  return value.toFixed(2);
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

export default function HomePage() {
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [ultimoAutoguardado, setUltimoAutoguardado] = useState("");
  const [backupDraft, setBackupDraft] = useState<QuoteDraft | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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
      <main className="min-h-screen bg-slate-900 px-4 py-10">
        <div className="mx-auto max-w-6xl text-sm text-slate-300">Cargando cotización...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="no-print reveal-up border-slate-700/80 bg-slate-800/70">
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-100">Cotización de Albañilería</CardTitle>
              <CardDescription>
                Edita los datos y exporta a PDF con impresión del navegador. Moneda en MXN.
              </CardDescription>
              <p className="text-xs text-slate-400">
                Último autoguardado local: {ultimoAutoguardado ? `${ultimoAutoguardado} hrs` : "pendiente"}
              </p>
            </div>
            <div className="grid w-full gap-2 sm:w-auto sm:min-w-[260px]">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={regenerateFolio}>
                  Nuevo folio
                </Button>
                <Button variant="outline" onClick={resetDraft}>
                  Limpiar borrador
                </Button>
              </div>
              <Button variant="secondary" onClick={undoResetDraft} disabled={!backupDraft}>
                Deshacer limpieza
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="no-print reveal-up border-slate-700/80 bg-slate-800/70" data-delay="1">
          <CardHeader>
            <CardTitle>Datos de la cotización</CardTitle>
            <CardDescription>Todos los campos son editables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="folio">Folio</Label>
                <Input
                  id="folio"
                  value={draft.folio}
                  onChange={(event) => updateField("folio", event.target.value)}
                  placeholder="COT-YYYYMMDD-0001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={draft.fecha}
                  onChange={(event) => updateField("fecha", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cotizador">Cotizador</Label>
                <Input
                  id="cotizador"
                  value={draft.cotizador}
                  onChange={(event) => updateField("cotizador", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 rounded-md border border-slate-700 bg-slate-800/80 p-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="negocio">Nombre del negocio</Label>
                <Input
                  id="negocio"
                  value={draft.nombreNegocio}
                  onChange={(event) => updateField("nombreNegocio", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={draft.ubicacionNegocio}
                  onChange={(event) => updateField("ubicacionNegocio", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel-negocio">Teléfono del negocio</Label>
                <Input
                  id="tel-negocio"
                  value={draft.telefonoNegocio}
                  onChange={(event) => updateField("telefonoNegocio", event.target.value)}
                  placeholder="9991234567"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente - Nombre</Label>
                <Input
                  id="cliente"
                  value={draft.clienteNombre}
                  onChange={(event) => updateField("clienteNombre", event.target.value)}
                  placeholder="Nombre completo del cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel-cliente">Cliente - Teléfono</Label>
                <Input
                  id="tel-cliente"
                  value={draft.clienteTelefono}
                  onChange={(event) => updateField("clienteTelefono", event.target.value)}
                  placeholder="Número de contacto del cliente"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="no-print reveal-up border-slate-700/80 bg-slate-800/70" data-delay="2">
          <CardHeader>
            <CardTitle>Partidas</CardTitle>
            <CardDescription>
              Modifica conceptos, cantidades y costos unitarios. El total por renglón se calcula automáticamente.
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
                    <div className="rounded-md border border-slate-700 bg-slate-900/50 p-2">
                      <p className="text-[11px] text-slate-400">Cantidad</p>
                      <p className="text-sm text-slate-200">
                        {formatCantidad(item.cantidad)} {item.unidad || "-"}
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-900/50 p-2">
                      <p className="text-[11px] text-slate-400">Costo unitario</p>
                      <p className="text-sm text-slate-200">{formatMXNFromCentavos(item.costoUnitarioCentavos)}</p>
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
                        <Input
                          value={item.concepto}
                          onChange={(event) => updateItem(item.id, "concepto", event.target.value)}
                          placeholder="Escribe el concepto..."
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.cantidad}
                          onChange={(event) =>
                            updateItem(item.id, "cantidad", sanitizePositiveNumber(event.target.value, 0))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unidad}
                          onChange={(event) => updateItem(item.id, "unidad", event.target.value)}
                          placeholder="m2"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={fromCentavos(item.costoUnitarioCentavos)}
                          onChange={(event) =>
                            updateItem(item.id, "costoUnitarioCentavos", toCentavos(event.target.value))
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

        <Card className="no-print reveal-up border-slate-700/80 bg-slate-800/70" data-delay="3">
          <CardContent className="grid gap-6 pt-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="notas">Notas u observaciones</Label>
              <Textarea
                id="notas"
                value={draft.notas}
                onChange={(event) => updateField("notas", event.target.value)}
                placeholder="Ej. Tiempo de entrega, forma de pago, alcances del trabajo..."
              />
            </div>
            <div className="rounded-md border border-slate-700 bg-slate-800/80 p-4">
              <p className="text-sm font-semibold text-slate-200">Resumen</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Moneda</span>
                  <span>MXN ($)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-2 text-base font-semibold text-slate-100">
                  <span>Total</span>
                  <span>{formatMXNFromCentavos(subtotalCentavos)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="no-print reveal-up border-slate-700/80 bg-slate-800/70">
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <Button onClick={exportToPdf} className="w-full sm:w-auto">
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <div className="space-y-2">
                <Label htmlFor="movil-concepto">Concepto</Label>
                <Input
                  id="movil-concepto"
                  value={editingItem.concepto}
                  onChange={(event) => updateItem(editingItem.id, "concepto", event.target.value)}
                  placeholder="Escribe el concepto..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="movil-cantidad">Cantidad</Label>
                <Input
                  id="movil-cantidad"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem.cantidad}
                  onChange={(event) => updateItem(editingItem.id, "cantidad", sanitizePositiveNumber(event.target.value, 0))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="movil-unidad">Unidad</Label>
                <Input
                  id="movil-unidad"
                  value={editingItem.unidad}
                  onChange={(event) => updateItem(editingItem.id, "unidad", event.target.value)}
                  placeholder="m2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="movil-costo-unitario">Costo unitario</Label>
                <Input
                  id="movil-costo-unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fromCentavos(editingItem.costoUnitarioCentavos)}
                  onChange={(event) => updateItem(editingItem.id, "costoUnitarioCentavos", toCentavos(event.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="rounded-md border border-slate-700 bg-slate-800/80 p-3">
                <p className="text-xs text-slate-400">Importe</p>
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
                  <td className="px-2 py-2 text-right">
                    {formatCantidad(item.cantidad)} {item.unidad}
                  </td>
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
