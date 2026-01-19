'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { BriefcaseIcon } from './icons/briefcase-icon';
import { DashboardIcon } from './icons/dashboard-icon';
import { BoardIcon } from './icons/board-icon';
import { AnalyticsIcon } from './icons/analytics-icon';
import { AvatarIcon } from './icons/avatar-icon';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: DashboardIcon,
  },
  {
    label: 'Board',
    href: '/board',
    icon: BoardIcon,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: AnalyticsIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] sm:w-[280px] bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 flex-shrink-0" />
          <span className="text-lg sm:text-xl font-bold text-gray-900">Job Tracker</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-xs sm:text-sm font-medium',
                {
                  'bg-blue-50 text-blue-700': isActive,
                  'text-gray-700 hover:bg-gray-50': !isActive,
                }
              )}
            >
              <Icon className={classNames('w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0', {
                'text-blue-700': isActive,
                'text-gray-500': !isActive,
              })} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
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
    </aside>
  );
}
