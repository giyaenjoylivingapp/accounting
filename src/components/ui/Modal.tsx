"use client";

import { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md lg:max-w-lg",
  lg: "max-w-lg lg:max-w-xl",
  xl: "max-w-xl lg:max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-end lg:items-center justify-center
        transition-opacity duration-200 ease-out
        ${isAnimating ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal - slides up on mobile, scales in on desktop */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeStyles[size]}
          bg-[var(--bg-secondary)]
          border border-[var(--border-color)]
          shadow-2xl
          max-h-[90vh] lg:max-h-[85vh] overflow-hidden flex flex-col
          transition-all duration-200 ease-out

          /* Mobile: bottom sheet style */
          rounded-t-2xl lg:rounded-xl

          /* Animation */
          ${isAnimating
            ? "translate-y-0 lg:translate-y-0 lg:scale-100"
            : "translate-y-full lg:translate-y-0 lg:scale-95"
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-[var(--border-color)]">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content - more padding on desktop */}
        <div className="px-5 lg:px-6 py-4 lg:py-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
