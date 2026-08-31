import { getAuth, Auth } from 'firebase/auth';
import { app } from './client';

export const auth: Auth = getAuth(app);
export default auth;
