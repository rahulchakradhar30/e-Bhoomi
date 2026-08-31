'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <nav className="officer-nav-bar">
      <div className="content-container officer-nav-inner">
        <ul className="officer-nav-list">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`officer-nav-link ${isActive ? 'active' : ''}`}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
