import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { AuditLogDocument } from '../../types/audit';

const AUDIT_LOGS_COLLECTION = 'auditLogs';

export async function logAuditEvent(
  event: Omit<AuditLogDocument, 'id' | 'timestamp'>
): Promise<string> {
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...event,
    timestamp: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getAuditLogsForResource(
  resourceId: string,
  maxResults = 50
): Promise<AuditLogDocument[]> {
  const q = query(
    collection(db, AUDIT_LOGS_COLLECTION),
    where('resourceId', '==', resourceId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogDocument);
}

export async function getAuditLogsForActor(
  actorUid: string,
  maxResults = 100
): Promise<AuditLogDocument[]> {
  const q = query(
    collection(db, AUDIT_LOGS_COLLECTION),
    where('actorUid', '==', actorUid)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogDocument);
  // Sort client-side to avoid requiring a composite index right away
  docs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return docs.slice(0, maxResults);
}
