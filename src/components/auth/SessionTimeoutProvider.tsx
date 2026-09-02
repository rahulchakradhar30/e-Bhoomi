'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/services/authService';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 Minutes (300,000 ms)
const WARNING_THRESHOLD_MS = 4.5 * 60 * 1000; // 4 Minutes 30 Seconds (270,000 ms)
const CHECK_INTERVAL_MS = 1000; // Check every 1 second

export const SessionTimeoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, officerProfile } = useAuth();
  const isAuthenticated = status === 'AUTHENTICATED';
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(0);

  // User interaction reset handler (throttled to 1s)
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current > 1000) {
      lastThrottleRef.current = now;
      lastActivityRef.current = now;
      if (showWarning) {
        setShowWarning(false);
      }
    }
  }, [showWarning]);

  // Execute explicit session invalidation & redirect
  const handleSessionLogout = useCallback(async (reason: 'INACTIVITY' | 'CROSS_TAB') => {
    setShowWarning(false);
    try {
      // Broadcast logout event to other open tabs
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ebhoomi_session_event', JSON.stringify({ action: 'LOGOUT', reason, timestamp: Date.now() }));
      }
      await signOut();
    } catch (err) {
      console.error('Logout error during session expiration:', err);
    } finally {
      const isSystemAdmin = officerProfile?.roleId === 'SYSTEM_ADMIN' || officerProfile?.roleId === 'STATE_ADMIN';
      const redirectPath = isSystemAdmin ? '/admin/login' : '/login';
      router.push(redirectPath);
    }
  }, [officerProfile, router]);

  // 1. Attach real user interaction DOM listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, handleUserActivity]);

  // 2. Main inactivity check timer loop
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(interval);
        handleSessionLogout('INACTIVITY');
      } else if (elapsed >= WARNING_THRESHOLD_MS) {
        setShowWarning(true);
        const remaining = Math.ceil((INACTIVITY_LIMIT_MS - elapsed) / 1000);
        setSecondsRemaining(Math.max(1, remaining));
      } else {
        if (showWarning) setShowWarning(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, handleSessionLogout, showWarning]);

  // 3. Multi-tab synchronization via localStorage events
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'ebhoomi_session_event' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.action === 'LOGOUT') {
            handleSessionLogout('CROSS_TAB');
          }
        } catch {
          // ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [isAuthenticated, handleSessionLogout]);

  // 4. Tab visibility return revalidation (for suspended/backgrounded mobile tabs)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_LIMIT_MS) {
          handleSessionLogout('INACTIVITY');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, handleSessionLogout]);

  const handleContinueSession = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  };

  return (
    <>
      {children}

      {/* Non-disruptive 30-second Inactivity Warning Banner */}
      {showWarning && isAuthenticated && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '420px',
            border: '1px solid #334155'
          }}
        >
          <ShieldAlert className="w-6 h-6 flex-shrink-0" style={{ color: '#F59E0B' }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#F8FAFC' }}>
              Session Expiring Soon
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8' }}>
              Inactivity detected. You will be signed out in <strong style={{ color: '#F59E0B' }}>{secondsRemaining}s</strong>.
            </p>
          </div>
          <button
            onClick={handleContinueSession}
            style={{
              backgroundColor: '#059669',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Continue</span>
          </button>
        </div>
      )}
    </>
  );
};
