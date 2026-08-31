'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '../../context/AuthContext';
import { UserRole } from '../../types/role';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectUrl?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedRoles,
  redirectUrl = '/login',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, role, userProfile, officerProfile } = useCurrentUser();

  const mustChangePassword = userProfile?.mustChangePassword || officerProfile?.mustChangePassword;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectUrl);
      } else if (mustChangePassword && pathname !== '/auth/change-password') {
        router.push('/auth/change-password');
      }
    }
  }, [isLoading, isAuthenticated, mustChangePassword, pathname, redirectUrl, router]);

  if (isLoading) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div 
          style={{
            border: '4px solid #cbd5e1',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <p style={{ marginTop: '16px', color: '#475569', fontWeight: 500 }}>
          Securing e-Bhoomi Session...
        </p>
      </div>
    );
  }

  const isAuthorized = isAuthenticated && (!allowedRoles || allowedRoles.includes(role as UserRole));

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (isAuthenticated && allowedRoles && !allowedRoles.includes(role as UserRole)) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#fef2f2',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '24px'
        }}
      >
        <h1 style={{ color: '#dc2626', fontSize: '24px', fontWeight: 700 }}>Access Denied</h1>
        <p style={{ marginTop: '8px', color: '#7f1d1d', maxWidth: '480px' }}>
          Your account role ({role}) does not have permission to access this administrative portal section.
        </p>
        <button 
          onClick={() => router.push(role === 'SYSTEM_ADMIN' || role === 'STATE_ADMIN' ? '/admin/login' : '/login')}
          style={{
            marginTop: '20px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return null;
};
export default RouteGuard;
