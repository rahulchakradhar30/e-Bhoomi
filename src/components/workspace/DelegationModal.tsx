'use client';

import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Delegation } from '@/types';

interface DelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (delegation: Delegation) => void;
}

export const DelegationModal: React.FC<DelegationModalProps> = ({
  isOpen,
  onClose,
  onActivate
}) => {
  const [targetUser, setTargetUser] = useState('');
  const [targetCaseId, setTargetCaseId] = useState('');
  const [requestedAction, setRequestedAction] = useState('APPROVE_MUTATION');
  const [reason, setReason] = useState('');
  const [authorizationReference, setAuthorizationReference] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onActivate({
      active: true,
      targetUser,
      targetCaseId,
      requestedAction,
      reason,
      authorizationReference
    });
    onClose();
  };

  return (
    <div className="modal-overlay-backdrop">
      <div className="modal-content-card">
        <div className="modal-header-row">
          <div className="flex-align-center gap-sm">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <h2 className="modal-title-text">SPECIAL-CASE DELEGATED ACTION AUTHORIZATION</h2>
          </div>
          <button type="button" onClick={onClose} className="close-modal-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-form">
          <p className="panel-guidance-text margin-bottom-md">
            Special-case delegation allows an authorized superior officer to execute a specific delegated action for a specific case with explicit government authorization.
          </p>

          <div className="form-field-group margin-bottom-md">
            <label className="form-label">Target Subordinate Officer Login ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AP-04-MRO-00101"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group margin-bottom-md">
            <label className="form-label">Target Case / Application Reference Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. EB-2026-MUT-88492"
              value={targetCaseId}
              onChange={(e) => setTargetCaseId(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group margin-bottom-md">
            <label className="form-label">Delegated Action Type</label>
            <select
              className="form-select"
              value={requestedAction}
              onChange={(e) => setRequestedAction(e.target.value)}
            >
              <option value="APPROVE_MUTATION">Approve Mutation Record</option>
              <option value="CORRECT_SURVEY_RECORD">Correct Survey/FMB Boundary</option>
              <option value="OVERRIDE_VERIFICATION">Override Field Verification Requirement</option>
            </select>
          </div>

          <div className="form-field-group margin-bottom-md">
            <label className="form-label">Official Order / Authorization Reference</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. GO-MS-142/REV-2026"
              value={authorizationReference}
              onChange={(e) => setAuthorizationReference(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group margin-bottom-md">
            <label className="form-label">Justification & Reason</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Provide statutory justification for special delegation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer-row">
            <button
              type="button"
              onClick={onClose}
              className="officer-header-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gov-nav-btn login-btn"
            >
              Activate Delegated Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
