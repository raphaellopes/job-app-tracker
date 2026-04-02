"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { BriefcaseIcon } from "./icons/briefcase-icon";
import { DashboardIcon } from "./icons/dashboard-icon";
import { BoardIcon } from "./icons/board-icon";
import { AnalyticsIcon } from "./icons/analytics-icon";
import { AvatarIcon } from "./icons/avatar-icon";
import { CloseIcon } from "./icons/close-icon";
import { MenuIcon } from "./icons/menu-icon";

const menuItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: DashboardIcon,
  },
  {
    label: "Board",
    href: "/board",
    icon: BoardIcon,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: AnalyticsIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderMobileMenu = () => (
    <header className="sm:hidden fixed inset-x-0 top-0 z-20 h-16 bg-white border-b border-gray-200 px-4">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="w-5 h-5 text-gray-900 flex-shrink-0" />
          <span className="text-lg font-bold text-gray-900">Job Tracker</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="h-10 w-10 rounded-md text-gray-700 hover:bg-gray-100 flex items-center justify-center"
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-side-menu"
        >
          <MenuIcon size="lg" />
        </button>
      </div>
    </header>
  );

  const renderBackdrop = () =>
    isMobileMenuOpen && (
      <button
        type="button"
        className="sm:hidden fixed inset-0 z-20 bg-black/40"
        onClick={closeMobileMenu}
        aria-label="Close menu backdrop"
      />
    );

  const renderMobileSidebarHeader = () => (
    <div className="sm:hidden p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BriefcaseIcon className="w-5 h-5 text-gray-900 flex-shrink-0" />
        <span className="text-lg font-bold text-gray-900">Job Tracker</span>
      </div>
      <button
        type="button"
        onClick={closeMobileMenu}
        className="h-9 w-9 rounded-md text-gray-700 hover:bg-gray-100 flex items-center justify-center"
        aria-label="Close menu"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );

  const renderSidebarHeader = () => (
    <div className="hidden sm:block p-6 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <BriefcaseIcon className="w-6 h-6 text-gray-900 flex-shrink-0" />
        <span className="text-xl font-bold text-gray-900">Job Tracker</span>
      </div>
    </div>
  );

  const renderMenuItems = () => (
    <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMobileMenu}
            className={classNames(
              "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-xs sm:text-sm font-medium",
              {
                "bg-blue-50 text-blue-700": isActive,
                "text-gray-700 hover:bg-gray-50": !isActive,
              },
            )}
          >
            <Icon
              className={classNames("w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0", {
                "text-blue-700": isActive,
                "text-gray-500": !isActive,
              })}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderUserSection = () => (
    <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2">
      <Link
        href="/sign-up"
        onClick={closeMobileMenu}
        className="block w-full text-center text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-800 py-2 rounded-lg hover:bg-blue-50 transition-colors"
      >
        Sign up
      </Link>
      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <AvatarIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">John Doe</p>
          <p className="text-[10px] sm:text-xs text-gray-500 truncate">user@example.com</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderMobileMenu()}
      {renderBackdrop()}

      <aside
        id="mobile-side-menu"
        className={classNames(
          "fixed left-0 top-0 h-screen w-[240px] sm:w-[280px] bg-white border-r border-gray-200 flex flex-col z-30 sm:z-10 transform transition-transform duration-200 ease-out",
          {
            "translate-x-0": isMobileMenuOpen,
            "-translate-x-full sm:translate-x-0": !isMobileMenuOpen,
          },
        )}
      >
        {renderMobileSidebarHeader()}
        {renderSidebarHeader()}
        {renderMenuItems()}
        {renderUserSection()}
      </aside>
    </>
  );
}
