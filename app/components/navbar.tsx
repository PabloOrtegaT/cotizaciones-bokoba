"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      // Force redirect even if request fails
      router.push("/login");
    }
  };

  return (
    <nav className="no-print flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-lg font-bold text-white shadow-lg">
          BD
        </div>
        <div>
          <h1 className="font-semibold text-slate-100">Bokobá Construcciones</h1>
          <p className="text-xs text-slate-400">Sistema de Cotizaciones</p>
        </div>
      </Link>
      
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/lista-de-cotizaciones">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 bg-slate-800/50 hover:bg-slate-700"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
            Historial
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-slate-600 bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          Cerrar Sesión
        </Button>
      </div>
    </nav>
  );
}
