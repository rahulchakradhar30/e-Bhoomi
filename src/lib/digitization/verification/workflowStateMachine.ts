import { DigitizationWorkflowState } from './verificationTypes';

export class WorkflowStateMachine {
  private static ALLOWED_TRANSITIONS: Record<DigitizationWorkflowState, DigitizationWorkflowState[]> = {
    DRAFT: ['PROCESSING', 'AI_COMPLETE'],
    PROCESSING: ['AI_COMPLETE', 'PROCESSING'],
    AI_COMPLETE: ['VALIDATION_COMPLETE', 'REVIEW_REQUIRED'],
    VALIDATION_COMPLETE: ['REVIEW_REQUIRED', 'VRO_REVIEW'],
    REVIEW_REQUIRED: ['VRO_REVIEW', 'ESCALATED'],
    VRO_REVIEW: ['HIGHER_OFFICER_REVIEW', 'APPROVED', 'FINALIZED', 'RETURNED', 'ESCALATED'],
    RETURNED: ['VRO_REVIEW', 'HIGHER_OFFICER_REVIEW'],
    ESCALATED: ['HIGHER_OFFICER_REVIEW', 'RETURNED'],
    HIGHER_OFFICER_REVIEW: ['APPROVED', 'FINALIZED', 'RETURNED', 'ESCALATED'],
    APPROVED: ['FINALIZED'],
    FINALIZED: ['REOPEN_REQUESTED'],
    REOPEN_REQUESTED: ['REOPENED', 'FINALIZED'],
    REOPENED: ['VRO_REVIEW', 'HIGHER_OFFICER_REVIEW'],
  };

  public static canTransition(current: DigitizationWorkflowState, nextState: DigitizationWorkflowState): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(nextState);
  }

  public static assertTransition(current: DigitizationWorkflowState, nextState: DigitizationWorkflowState): void {
    if (!this.canTransition(current, nextState)) {
      throw new Error(`Invalid Workflow State Transition: Cannot jump directly from '${current}' to '${nextState}'.`);
    }
  }
}
