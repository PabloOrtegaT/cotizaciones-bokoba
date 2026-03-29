"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteSavedQuote,
  duplicateSavedQuote,
  formatMXNFromCentavos,
  formatSavedDate,
  getSavedQuotes,
  loadQuoteAsDraft,
  searchSavedQuotes,
  type SavedQuote
} from "@/lib/quote";

const STORAGE_KEY = "cotizacion_tomas_borrador_v1";

export default function ListaCotizacionesPage() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadQuotes = () => {
      const saved = getSavedQuotes();
      setQuotes(saved);
      setIsLoading(false);
    };

    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    return searchSavedQuotes(quotes, searchQuery);
  }, [quotes, searchQuery]);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.");
    
    if (confirmed) {
      deleteSavedQuote(id);
      setQuotes(getSavedQuotes());
    }
    
    setDeletingId(null);
  };

  const handleDuplicate = (quote: SavedQuote) => {
    duplicateSavedQuote(quote);
    setQuotes(getSavedQuotes());
  };

  const handleLoadAsDraft = (quote: SavedQuote) => {
    const confirmed = window.confirm(
      "Esta acción reemplazará el borrador actual. ¿Deseas continuar?"
    );
    
    if (confirmed) {
      const draft = loadQuoteAsDraft(quote);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      window.location.href = "/";
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-1 sm:px-0">
        {/* Navigation Bar */}
        <Navbar />

        {/* Header Card */}
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-100">
                Historial de Cotizaciones
              </CardTitle>
              <CardDescription className="text-slate-400">
                {quotes.length === 0
                  ? "No hay cotizaciones guardadas"
                  : `${quotes.length} cotizaci${quotes.length === 1 ? "ón" : "ones"} guardada${quotes.length === 1 ? "" : "s"}`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
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
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  Nueva Cotización
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Search Card */}
        {quotes.length > 0 && (
          <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="buscar" className="text-slate-300">
                  Buscar cotización
                </Label>
                <div className="relative">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <Input
                    id="buscar"
                    type="text"
                    placeholder="Buscar por cliente, folio o negocio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-slate-600 bg-slate-900/50 pl-10 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-slate-400">
                  {filteredQuotes.length} resultado{filteredQuotes.length !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {quotes.length === 0 && (
          <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 rounded-full border border-slate-600 bg-slate-800/80 p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-200">
                No hay cotizaciones guardadas
              </h3>
              <p className="mb-6 max-w-sm text-slate-400">
                Comienza creando una nueva cotización. Podrás guardarla aquí para acceder a ella más tarde.
              </p>
              <Link href="/">
                <Button className="bg-cyan-600 hover:bg-cyan-500">
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
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  Crear Primera Cotización
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Search Empty State */}
        {quotes.length > 0 && filteredQuotes.length === 0 && searchQuery && (
          <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full border border-slate-600 bg-slate-800/80 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-slate-200">
                No se encontraron resultados
              </h3>
              <p className="text-slate-400">
                Intenta con otros términos de búsqueda
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quotes Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map((quote, index) => (
            <Card
              key={quote.id}
              className="group border-slate-700/50 bg-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-slate-900/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-cyan-400">
                      {quote.folio}
                    </p>
                    <CardTitle className="mt-1 truncate text-base font-semibold text-slate-100">
                      {quote.clienteNombre || "Sin cliente"}
                    </CardTitle>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900/50 px-2 py-1 text-xs font-medium text-slate-300">
                      {quote.items.length} partida{quote.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Guardada el {formatSavedDate(quote.savedAt)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Quote Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
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
                      <path d="M20 7h-9" />
                      <path d="M14 17H5" />
                      <circle cx="17" cy="17" r="3" />
                      <circle cx="7" cy="7" r="3" />
                    </svg>
                    <span className="truncate">{quote.nombreNegocio}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
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
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{quote.ubicacionNegocio || "Sin ubicación"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
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
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    <span>{quote.fecha}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatMXNFromCentavos(quote.totalCentavos)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                    onClick={() => handleLoadAsDraft(quote)}
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
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 hover:bg-slate-700"
                    onClick={() => handleDuplicate(quote)}
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
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                    onClick={() => handleDelete(quote.id)}
                    disabled={deletingId === quote.id}
                  >
                    {deletingId === quote.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border border-red-400 border-t-transparent" />
                    ) : (
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
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
