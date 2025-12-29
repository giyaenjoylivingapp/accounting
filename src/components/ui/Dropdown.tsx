"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  error,
  disabled = false,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  // Ensure we're on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = Math.min(options.length * 44 + 8, 240); // Approximate menu height

      // Open upward if not enough space below and more space above
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      setMenuPosition({
        top: openUpward ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUpward,
      });
    }
  }, [isOpen, options.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on scroll of parent containers (menu position would be stale)
  // But allow scrolling within the dropdown menu itself
  useEffect(() => {
    if (isOpen) {
      const handleScroll = (e: Event) => {
        // Don't close if scrolling inside the dropdown menu
        if (listRef.current && listRef.current.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, value]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex].value);
        } else {
          setIsOpen(true);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  // Render the dropdown menu in a portal
  const renderMenu = () => {
    if (!isOpen || !mounted) return null;

    const menu = (
      <ul
        ref={listRef}
        role="listbox"
        className="
          fixed z-[100]
          max-h-60 overflow-auto
          bg-[var(--bg-secondary)]
          border border-[var(--border-color)]
          rounded-lg shadow-xl
          py-1
        "
        style={{
          top: menuPosition.openUpward ? 'auto' : menuPosition.top,
          bottom: menuPosition.openUpward ? `${window.innerHeight - menuPosition.top}px` : 'auto',
          left: menuPosition.left,
          width: menuPosition.width,
        }}
      >
        {options.length === 0 ? (
          <li className="px-3 py-2 text-sm text-[var(--text-muted)]">
            No options available
          </li>
        ) : (
          options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-3 py-2.5 cursor-pointer
                transition-colors duration-100
                flex items-center justify-between gap-2
                ${
                  highlightedIndex === index
                    ? "bg-[var(--bg-tertiary)]"
                    : ""
                }
                ${
                  value === option.value
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-primary)]"
                }
              `}
              style={option.color && value !== option.value ? { color: option.color } : undefined}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && (
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </li>
          ))
        )}
      </ul>
    );

    return createPortal(menu, document.body);
  };

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-left
          bg-[var(--bg-tertiary)]
          border border-[var(--border-color)]
          rounded-lg
          transition-colors duration-200
          hover:border-[var(--border-light)]
          focus:border-[var(--accent)]
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-between gap-2
          ${error ? "border-[var(--error)]" : ""}
          ${isOpen ? "border-[var(--accent)]" : ""}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`truncate ${
            selectedOption ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
          }`}
          style={selectedOption?.color ? { color: selectedOption.color } : undefined}
        >
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu - rendered in portal */}
      {renderMenu()}

      {error && <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>}
    </div>
  );
}
