'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange } from '../lib/services/authService';
import { getUserProfile } from '../lib/services/userService';
import { getOfficerByAuthUid } from '../lib/services/officerService';
import { UserProfile } from '../types/user';
import { OfficerProfile } from '../types/officer';

export type AuthStateStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'ERROR';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  officerProfile: OfficerProfile | null;
  status: AuthStateStatus;
  error: string | null;
  refetchProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  officerProfile: null,
  status: 'LOADING',
  error: null,
  refetchProfiles: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [officerProfile, setOfficerProfile] = useState<OfficerProfile | null>(null);
  const [status, setStatus] = useState<AuthStateStatus>('LOADING');
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async (currentUser: FirebaseUser) => {
    try {
      const [uProfile, oProfile] = await Promise.all([
        getUserProfile(currentUser.uid),
        getOfficerByAuthUid(currentUser.uid),
      ]);
      setUserProfile(uProfile);
      setOfficerProfile(oProfile);
      setStatus('AUTHENTICATED');
      setError(null);
    } catch (err) {
      console.error('Failed to load user/officer profile from Firestore:', err);
      setError(err instanceof Error ? err.message : 'Error fetching user profile.');
      setStatus('ERROR');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfiles(currentUser);
      } else {
        setUserProfile(null);
        setOfficerProfile(null);
        setStatus('UNAUTHENTICATED');
        setError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const refetchProfiles = async () => {
    if (user) {
      await fetchProfiles(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        officerProfile,
        status,
        error,
        refetchProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useCurrentUser = () => {
  const { user, userProfile, officerProfile, status, error } = useAuth();
  return {
    user,
    userProfile,
    officerProfile,
    isAuthenticated: status === 'AUTHENTICATED',
    isLoading: status === 'LOADING',
    error,
    role: officerProfile?.roleId || userProfile?.role || 'PUBLIC_USER',
  };
};
