'use client';

import React from 'react';
import { WorkspacePanel } from '../workspace/WorkspacePanel';
import { StickyActionBar } from '../workspace/StickyActionBar';
import { ShieldCheck, CheckCircle2, FileSearch } from 'lucide-react';

export const ManualReviewWorkspace: React.FC = () => {
  return (
    <div>
      <div className="operational-split-grid">
        <WorkspacePanel title="ORIGINAL SCANNED DOCUMENT VIEWER" guidance="High-resolution physical document viewer with pan & zoom capabilities.">
          <div className="table-empty-state" style={{ minHeight: '380px', justifyContent: 'center' }}>
            <FileSearch className="w-12 h-12 text-navy margin-bottom-sm" />
            <div className="empty-inbox-title">Document Inspection Viewer</div>
            <div className="empty-inbox-desc">
              Physical document image rendered here during review process.
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="EXTRACTED LAND RECORD FIELDS" guidance="Review AI-extracted data against official document source before endorsement.">
          <div className="admin-form-grid">
            <div className="form-field-group">
              <label className="form-label">Survey Number</label>
              <input type="text" className="form-input" placeholder="Pending AI Extraction" readOnly />
            </div>
            <div className="form-field-group">
              <label className="form-label">Sub-Division Number</label>
              <input type="text" className="form-input" placeholder="Pending AI Extraction" readOnly />
            </div>
            <div className="form-field-group">
              <label className="form-label">Pattadar / Owner Name</label>
              <input type="text" className="form-input" placeholder="Pending AI Extraction" readOnly />
            </div>
            <div className="form-field-group">
              <label className="form-label">Extent (Acres - Cents)</label>
              <input type="text" className="form-input" placeholder="Pending AI Extraction" readOnly />
            </div>
          </div>
        </WorkspacePanel>
      </div>

      <StickyActionBar>
        <div className="flex-align-center gap-sm">
          <ShieldCheck className="w-5 h-5 text-navy" />
          <span className="text-sm font-bold text-navy">OFFICER REVIEW & VERIFICATION WORKSPACE</span>
        </div>
        <div className="flex-align-center gap-sm">
          <button type="button" className="officer-header-btn logout">
            Request Field Verification
          </button>
          <button type="button" className="gov-nav-btn login-btn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Endorse Record</span>
          </button>
        </div>
      </StickyActionBar>
    </div>
  );
};
