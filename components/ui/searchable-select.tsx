"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Option = {
  value: string;
  label: string;
  meta?: string;
};

export type SearchableSelectProps = {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
};

const SearchableSelect = React.forwardRef<HTMLInputElement, SearchableSelectProps>(
  ({ options, value, onValueChange, placeholder = "Buscar...", id, className, inputClassName, disabled }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Find selected option label
    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!search.trim()) return options;
      const normalized = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalized) ||
          opt.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalized)
      );
    }, [options, search]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    // Handle option selection
    const handleSelect = (optionValue: string) => {
      onValueChange(optionValue);
      setIsOpen(false);
      setSearch("");
    };

    // Open dropdown and set search to current value
    const handleFocus = () => {
      setIsOpen(true);
      setSearch(selectedOption?.label || "");
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setIsOpen(true);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "Enter" && filteredOptions.length > 0) {
        e.preventDefault();
        handleSelect(filteredOptions[0].value);
      }
    };

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <input
          ref={(node) => {
            // Handle both refs
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          id={id}
          type="text"
          value={isOpen ? search : selectedOption?.label || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-600 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            inputClassName
          )}
        />

        {/* Dropdown arrow */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-300 disabled:opacity-50"
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
            className={cn("transition-transform duration-200", isOpen && "rotate-180")}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-600 bg-slate-800 shadow-lg">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No se encontraron resultados</div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "cursor-pointer px-3 py-2 text-sm hover:bg-slate-700",
                      option.value === value ? "bg-cyan-950/50 text-cyan-400" : "text-slate-200"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.meta && <span className="text-xs text-slate-500">{option.meta}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }
);
SearchableSelect.displayName = "SearchableSelect";

export { SearchableSelect };
