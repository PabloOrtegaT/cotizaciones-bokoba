"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type NumericInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> & {
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  allowEmpty?: boolean;
};

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ 
    value, 
    onChange, 
    min = 0, 
    max,
    step = 0.01,
    decimals = 2,
    allowEmpty = false,
    className,
    onKeyDown,
    onInput,
    ...props 
  }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Format value for display
    const displayValue = React.useMemo(() => {
      if (value === "" || value === null || value === undefined) return "";
      const num = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(num)) return "";
      return num.toString();
    }, [value]);

    // Handle input changes - filter non-numeric characters
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const originalValue = input.value;
      
      // Allow: numbers, one decimal point, minus at start
      let cleaned = originalValue;
      
      // Remove any character that's not a digit, decimal point, or minus sign
      cleaned = cleaned.replace(/[^\d.-]/g, "");
      
      // Ensure only one decimal point
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
      }
      
      // Ensure minus only at the beginning
      if (cleaned.indexOf("-") > 0) {
        cleaned = cleaned.replace(/-/g, "");
      } else if (cleaned.indexOf("-") === 0 && min >= 0) {
        // Remove minus if negative numbers not allowed
        cleaned = cleaned.replace(/-/g, "");
      }
      
      // Limit decimal places
      if (parts[1] && parts[1].length > decimals) {
        cleaned = parseFloat(cleaned).toFixed(decimals);
      }
      
      // Update input value if it changed
      if (cleaned !== originalValue) {
        input.value = cleaned;
      }
      
      // Call original onInput if provided
      onInput?.(e);
    };

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      
      if (val === "" || val === "-" || val === ".") {
        if (allowEmpty) {
          onChange(NaN);
        } else {
          onChange(min);
        }
        return;
      }
      
      let num = parseFloat(val);
      
      if (isNaN(num)) {
        if (!allowEmpty) {
          onChange(min);
        }
        return;
      }
      
      // Apply min/max constraints
      if (min !== undefined && num < min) num = min;
      if (max !== undefined && num > max) num = max;
      
      onChange(num);
    };

    // Handle keydown to prevent invalid characters
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter
      if (["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key)) {
        onKeyDown?.(e);
        return;
      }
      
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
        onKeyDown?.(e);
        return;
      }
      
      // Allow: home, end, left, right
      if (["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        onKeyDown?.(e);
        return;
      }
      
      // Allow: decimal point (only one)
      if (e.key === "." || e.key === ",") {
        const input = e.currentTarget;
        if (input.value.includes(".") || input.value.includes(",")) {
          e.preventDefault();
          return;
        }
        onKeyDown?.(e);
        return;
      }
      
      // Allow: minus (only at start and if negative allowed)
      if (e.key === "-") {
        const input = e.currentTarget;
        if (input.selectionStart !== 0 || min >= 0) {
          e.preventDefault();
          return;
        }
        onKeyDown?.(e);
        return;
      }
      
      // Allow: digits
      if (/^\d$/.test(e.key)) {
        onKeyDown?.(e);
        return;
      }
      
      // Prevent all other keys
      e.preventDefault();
    };

    // Handle paste - filter to only numbers
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const cleanedText = pastedText.replace(/[^\d.-]/g, "");
      
      if (cleanedText) {
        const num = parseFloat(cleanedText);
        if (!isNaN(num)) {
          let finalNum = num;
          if (min !== undefined && finalNum < min) finalNum = min;
          if (max !== undefined && finalNum > max) finalNum = max;
          onChange(finalNum);
        }
      }
    };

    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.]?[0-9]*"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        className={cn(
          "flex h-12 w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500",
          "transition-all duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
NumericInput.displayName = "NumericInput";

export { NumericInput };
