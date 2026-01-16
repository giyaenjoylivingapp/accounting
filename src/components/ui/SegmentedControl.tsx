"use client";

import { useState, useRef, useEffect } from "react";

interface SegmentOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = "md",
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when value changes
  useEffect(() => {
    if (!containerRef.current) return;

    const selectedIndex = options.findIndex((opt) => opt.value === value);
    if (selectedIndex === -1) return;

    const buttons = containerRef.current.querySelectorAll("button");
    const selectedButton = buttons[selectedIndex];

    if (selectedButton) {
      setIndicatorStyle({
        left: selectedButton.offsetLeft,
        width: selectedButton.offsetWidth,
      });
    }
  }, [value, options]);

  const sizeClasses = {
    sm: "p-0.5 text-xs",
    md: "p-1 text-sm",
  };

  const buttonSizeClasses = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2",
  };

  return (
    <div
      ref={containerRef}
      className={`
        relative inline-flex rounded-lg
        bg-[var(--bg-tertiary)] border border-[var(--border-color)]
        ${sizeClasses[size]}
      `}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-md bg-[var(--bg-primary)] shadow-sm border border-[var(--border-color)] transition-all duration-200 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative z-10 flex items-center gap-1.5 font-medium rounded-md
            transition-colors duration-200
            ${buttonSizeClasses[size]}
            ${
              value === option.value
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }
          `}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
