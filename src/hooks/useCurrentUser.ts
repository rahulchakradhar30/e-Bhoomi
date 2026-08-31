'use client';

import { useCurrentUser as useCurrentUserFromContext } from '../context/AuthContext';

export const useCurrentUser = useCurrentUserFromContext;
export default useCurrentUser;
