"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-lg mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium
              transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

// Simple toggle for two options (like Income/Expense)
interface ToggleProps {
  options: { value: string; label: string; color?: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-lg">
      {options.map((option) => {
        const isActive = value === option.value;
        const activeColor = option.color || "var(--accent)";

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? "text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }
            `}
            style={{
              backgroundColor: isActive ? activeColor : "transparent",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
