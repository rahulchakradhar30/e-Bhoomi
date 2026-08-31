import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { NotificationDocument } from '../../types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';

export async function getPublishedNotifications(): Promise<NotificationDocument[]> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('status', '==', 'PUBLISHED'),
    orderBy('publishedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as NotificationDocument);
}

export async function publishNotification(
  notification: NotificationDocument
): Promise<void> {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, notification.notificationId);
  await setDoc(ref, {
    ...notification,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
}
