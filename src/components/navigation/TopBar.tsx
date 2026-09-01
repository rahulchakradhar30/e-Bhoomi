'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/services/authService';

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
  const { status } = useAuth();
  const router = useRouter();
  const isAuthenticated = status === 'AUTHENTICATED';

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <div className="contextual-app-header-strip">
      <div className="content-container contextual-header-inner">
        <div>
          <h1 className="contextual-app-title">{roleTitle}</h1>
          <span className="contextual-app-scope">{roleScope}</span>
        </div>

        {isAuthenticated && (
          <div className="officer-user-badge">
            <div className="user-details-text">
              <span className="user-role-title">{roleTitle}</span>
              <span className="user-name">{userName}</span>
            </div>
            <div className="user-action-buttons">
              <button
                onClick={() => router.push('/auth/change-password')}
                className="officer-header-btn"
                title="Change Password"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
              <button
                onClick={handleLogout}
                className="officer-header-btn logout"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
