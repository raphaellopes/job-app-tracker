"use client";

import { useId, useState } from "react";
import classNames from "classnames";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
  tabsListClassName?: string;
  panelClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTabId,
  className,
  tabsListClassName,
  panelClassName,
}) => {
  const generatedId = useId();
  const firstEnabledTab = items.find((item) => !item.disabled);
  const initialTabId = defaultTabId ?? firstEnabledTab?.id ?? "";
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Tabs"
        className={classNames("flex overflow-x-auto border-b border-gray-200", tabsListClassName)}
      >
        {items.map((item) => {
          const isActive = item.id === activeTabId;
          const tabId = `${generatedId}-${item.id}-tab`;
          const panelId = `${generatedId}-${item.id}-panel`;

          return (
            <button
              key={item.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(item.id)}
              className={classNames(
                "flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
                {
                  "bg-white text-blue-700 border-b-2 border-blue-700": isActive,
                  "text-gray-600 hover:bg-gray-200 border-b-2 border-gray-200 rounded-t-lg":
                    !isActive,
                },
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const isActive = item.id === activeTabId;
        const tabId = `${generatedId}-${item.id}-tab`;
        const panelId = `${generatedId}-${item.id}-panel`;

        return (
          <div
            key={item.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
            className={classNames("pt-5", panelClassName)}
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;
