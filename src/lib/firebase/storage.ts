import { getStorage, FirebaseStorage } from 'firebase/storage';
import { app } from './client';

export const storage: FirebaseStorage = getStorage(app);
export default storage;
