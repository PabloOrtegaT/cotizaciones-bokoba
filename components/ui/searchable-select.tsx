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
  allowFreeText?: boolean;
  freeTextLabel?: string;
  showDropdownArrow?: boolean;
};

const SearchableSelect = React.forwardRef<HTMLInputElement, SearchableSelectProps>(
  ({ 
    options, 
    value, 
    onValueChange, 
    placeholder = "Buscar...", 
    id, 
    className, 
    inputClassName, 
    disabled, 
    allowFreeText = false,
    freeTextLabel = "Usar:",
    showDropdownArrow = true
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

    // Find selected option
    const selectedOption = options.find((opt) => opt.value === value);
    const isCustomValue = allowFreeText && value && !selectedOption;

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

    // Show "add new" option when allowFreeText is enabled and search doesn't match exactly
    const showAddNewOption = React.useMemo(() => {
      if (!allowFreeText || !search.trim()) return false;
      const normalizedSearch = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !filteredOptions.some(opt => 
        opt.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedSearch
      );
    }, [allowFreeText, search, filteredOptions]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
          document.removeEventListener("touchstart", handleClickOutside);
        };
      }
    }, [isOpen]);

    // Handle option selection
    const handleSelect = (optionValue: string) => {
      onValueChange(optionValue);
      setIsOpen(false);
      setSearch("");
      setHighlightedIndex(-1);
    };

    // Handle selecting custom text
    const handleSelectCustom = () => {
      if (allowFreeText && search.trim()) {
        onValueChange(search.trim());
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    };

    // Open dropdown and set search to current value
    const handleFocus = () => {
      setIsOpen(true);
      setSearch(selectedOption?.label || value || "");
      setHighlightedIndex(-1);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setIsOpen(true);
      setHighlightedIndex(-1);
    };

    // Handle blur - save custom text if enabled
    const handleBlur = (_event: React.FocusEvent<HTMLInputElement>) => {
      // Small delay to allow click events on dropdown items to fire first
      setTimeout(() => {
        if (allowFreeText && search.trim() && search.trim() !== value) {
          onValueChange(search.trim());
        }
        setIsOpen(false);
        setHighlightedIndex(-1);
      }, 150);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      const totalOptions = filteredOptions.length + (showAddNewOption ? 1 : 0);
      
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
          
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          setHighlightedIndex(prev => 
            prev < totalOptions - 1 ? prev + 1 : 0
          );
          break;
          
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : totalOptions - 1
          );
          break;
          
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex].value);
          } else if (highlightedIndex === filteredOptions.length && showAddNewOption) {
            handleSelectCustom();
          } else if (allowFreeText && search.trim()) {
            handleSelectCustom();
          } else if (filteredOptions.length > 0) {
            handleSelect(filteredOptions[0].value);
          }
          break;
          
        case "Tab":
          if (allowFreeText && search.trim() && search.trim() !== value) {
            onValueChange(search.trim());
          }
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    // Scroll highlighted item into view
    React.useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const items = listRef.current.querySelectorAll('li');
        const highlightedItem = items[highlightedIndex];
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }, [highlightedIndex]);

    // Calculate display value
    const displayValue = React.useMemo(() => {
      if (isOpen) return search;
      if (selectedOption) return selectedOption.label;
      if (isCustomValue) return value;
      return "";
    }, [isOpen, search, selectedOption, isCustomValue, value]);

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <div className="relative">
          <input
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            id={id}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? `${id}-listbox` : undefined}
            aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
            className={cn(
              "flex h-12 w-full rounded-lg border bg-slate-900/50 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500",
              "transition-all duration-200 ease-in-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isOpen && "border-cyan-500 ring-2 ring-cyan-500/20",
              isCustomValue && !isOpen && "border-cyan-600/50 bg-cyan-950/20",
              inputClassName
            )}
          />

          {/* Custom value indicator */}
          {isCustomValue && !isOpen && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <span className="inline-flex items-center rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-400">
                Personalizado
              </span>
            </div>
          )}

          {/* Dropdown toggle button */}
          {showDropdownArrow && (
            <button
              type="button"
              onClick={() => {
                if (!isOpen) {
                  inputRef.current?.focus();
                } else {
                  setIsOpen(false);
                }
              }}
              disabled={disabled}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex h-12 w-12 items-center justify-center text-slate-400 transition-colors hover:text-slate-200 disabled:opacity-50"
              aria-label={isOpen ? "Cerrar lista" : "Abrir lista"}
            >
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
                className={cn("transition-transform duration-200", isOpen && "rotate-180")}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div 
            className="absolute z-50 mt-2 max-h-72 w-full overflow-hidden rounded-lg border border-slate-600 bg-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            role="listbox"
            id={`${id}-listbox`}
          >
            {filteredOptions.length === 0 && !showAddNewOption ? (
              <div className="flex h-20 items-center justify-center px-4 text-sm text-slate-500">
                <span>No se encontraron resultados</span>
              </div>
            ) : (
              <ul ref={listRef} className="max-h-72 overflow-auto py-2">
                {filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    id={`${id}-option-${index}`}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "cursor-pointer px-4 py-3 transition-colors duration-150",
                      "min-h-[48px] flex items-center justify-between",
                      "active:bg-slate-600",
                      index === highlightedIndex 
                        ? "bg-slate-700" 
                        : option.value === value 
                          ? "bg-cyan-950/50" 
                          : "hover:bg-slate-700/50"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-sm font-medium",
                        option.value === value ? "text-cyan-400" : "text-slate-200"
                      )}>
                        {option.label}
                      </span>
                      {option.meta && (
                        <span className="text-xs text-slate-500">{option.meta}</span>
                      )}
                    </div>
                    {option.value === value && (
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
                        className="text-cyan-400 ml-2 shrink-0"
                      >
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    )}
                  </li>
                ))}
                
                {/* Add new option */}
                {showAddNewOption && (
                  <li
                    id={`${id}-option-${filteredOptions.length}`}
                    role="option"
                    aria-selected="false"
                    onClick={handleSelectCustom}
                    onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                    className={cn(
                      "cursor-pointer border-t border-slate-700/50 px-4 py-3 transition-colors duration-150",
                      "min-h-[48px] flex items-center gap-3",
                      "active:bg-slate-600",
                      filteredOptions.length === highlightedIndex 
                        ? "bg-cyan-950/50" 
                        : "hover:bg-cyan-950/30"
                    )}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
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
                        className="text-cyan-400"
                      >
                        <path d="M5 12h14"/>
                        <path d="M12 5v14"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-cyan-400">
                        {freeTextLabel} &quot;{search.trim()}&quot;
                      </span>
                      <span className="text-xs text-slate-500">Presiona Enter o toca aquí</span>
                    </div>
                  </li>
                )}
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
