"use client";

import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function DatePicker({
  value,
  onChange,
  min,
  max,
  label,
  error,
  placeholder = "Select date",
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      return new Date(value + "T12:00:00");
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update viewDate when value changes
  useEffect(() => {
    if (value) {
      setViewDate(new Date(value + "T12:00:00"));
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T12:00:00");
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate months
  const goToPrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Check if date is disabled
  const isDateDisabled = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  // Check if date is selected
  const isDateSelected = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr === value;
  };

  // Check if date is today
  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  // Select a date
  const selectDate = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    if (isDateDisabled(year, month, day)) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Render calendar grid
  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: React.ReactNode[] = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(year, month, day);
      const selected = isDateSelected(year, month, day);
      const today = isToday(year, month, day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => selectDate(day)}
          disabled={disabled}
          className={`
            w-9 h-9 rounded-lg text-sm font-medium transition-colors
            ${disabled
              ? "text-[var(--text-muted)] cursor-not-allowed opacity-40"
              : "hover:bg-[var(--bg-tertiary)] cursor-pointer"
            }
            ${selected
              ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]"
              : ""
            }
            ${today && !selected
              ? "ring-1 ring-[var(--primary)] text-[var(--primary)]"
              : ""
            }
            ${!selected && !disabled ? "text-[var(--text-primary)]" : ""}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}

      {/* Input Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2.5 text-left
          bg-[var(--bg-tertiary)]
          border border-[var(--border-color)]
          rounded-lg
          text-[var(--text-primary)]
          transition-colors duration-200
          hover:border-[var(--border-light)]
          focus:border-[var(--accent)]
          focus:outline-none
          flex items-center justify-between
          ${error ? "border-[var(--error)]" : ""}
          ${isOpen ? "border-[var(--accent)]" : ""}
        `}
      >
        <span className={value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <svg
          className="w-5 h-5 text-[var(--text-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {error && (
        <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg min-w-[280px]">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-[var(--text-primary)]">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="w-9 h-8 flex items-center justify-center text-xs font-medium text-[var(--text-muted)]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                if (!isDateDisabled(today.getFullYear(), today.getMonth(), today.getDate())) {
                  onChange(dateStr);
                  setIsOpen(false);
                }
              }}
              className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
