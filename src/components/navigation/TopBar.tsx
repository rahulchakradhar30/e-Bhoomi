'use client';

import React from 'react';
import Link from 'next/link';
import { UserRole } from '@/types';
import { LogOut, KeyRound } from 'lucide-react';

interface TopBarProps {
  roleTitle: string;
  roleScope: string;
  userRole?: UserRole;
  userName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  roleTitle,
  roleScope,
  userName = 'Authorized Officer',
}) => {
  return (
    <div className="contextual-app-header-strip">
      <div className="content-container contextual-header-inner">
        <div>
          <h1 className="contextual-app-title">{roleTitle}</h1>
          <span className="contextual-app-scope">{roleScope}</span>
        </div>

        <div className="officer-user-badge">
          <div className="user-details-text">
            <span className="user-role-title">{roleTitle}</span>
            <span className="user-name">{userName}</span>
          </div>
          <div className="user-action-buttons">
            <Link
              href="/auth/change-password"
              className="officer-header-btn"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </Link>
            <Link
              href="/login"
              className="officer-header-btn logout"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
