import crypto from 'crypto';
import { AuditEvent, AuditEventType } from './verificationTypes';

export class AuditLedgerEngine {
  private static eventsInMemory: AuditEvent[] = [];

  public static createAuditEvent(params: {
    digitizationId: string;
    entityType: string;
    entityId: string;
    eventType: AuditEventType;
    actorId: string;
    actorRole: string;
    previousStateReference?: string;
    newStateReference?: string;
    field?: string;
    beforeValue?: string | null;
    afterValue?: string | null;
    reason?: string;
    sourceReference?: string;
    validationReference?: string;
    verificationReference?: string;
  }): AuditEvent {
    const timestamp = new Date().toISOString();
    const auditEventId = `AUD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Tamper-evident chaining
    const lastEvent = this.eventsInMemory.length > 0 ? this.eventsInMemory[this.eventsInMemory.length - 1] : null;
    const previousEventHash = lastEvent ? lastEvent.eventHash : 'GENESIS_HASH_00000000000000000000000000000000';

    const payloadToHash = `${previousEventHash}|${auditEventId}|${params.digitizationId}|${params.eventType}|${params.actorId}|${timestamp}|${params.field || ''}|${params.beforeValue || ''}|${params.afterValue || ''}`;
    const eventHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    const event: AuditEvent = {
      auditEventId,
      digitizationId: params.digitizationId,
      entityType: params.entityType,
      entityId: params.entityId,
      eventType: params.eventType,
      actorId: params.actorId,
      actorRole: params.actorRole,
      timestamp,
      previousStateReference: params.previousStateReference,
      newStateReference: params.newStateReference,
      field: params.field,
      beforeValue: params.beforeValue,
      afterValue: params.afterValue,
      reason: params.reason,
      sourceReference: params.sourceReference,
      validationReference: params.validationReference,
      verificationReference: params.verificationReference,
      eventHash,
      previousEventHash,
    };

    this.eventsInMemory.push(event);
    return event;
  }

  public static getAuditTimeline(digitizationId: string): AuditEvent[] {
    return this.eventsInMemory.filter((e) => e.digitizationId === digitizationId);
  }

  public static verifyLedgerIntegrity(digitizationId: string): boolean {
    const timeline = this.getAuditTimeline(digitizationId);
    if (timeline.length === 0) return true;

    for (let i = 1; i < timeline.length; i++) {
      const prev = timeline[i - 1];
      const curr = timeline[i];
      if (curr.previousEventHash !== prev.eventHash) {
        return false; // Chain broken!
      }
    }
    return true;
  }
}
