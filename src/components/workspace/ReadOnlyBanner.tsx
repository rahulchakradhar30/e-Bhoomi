'use client';

import React from 'react';
import { Eye, ShieldAlert } from 'lucide-react';

interface ReadOnlyBannerProps {
  subordinateTitle?: string;
  subordinateJurisdiction?: string;
  viewerRole?: string;
}

export const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({
  subordinateTitle = 'Subordinate Jurisdiction Workspace',
  subordinateJurisdiction = 'Mandal Revenue Office',
  viewerRole = 'District Authority'
}) => {
  return (
    <div className="subordinate-view-banner margin-bottom-md">
      <div className="subordinate-banner-left">
        <ShieldAlert className="w-6 h-6 text-blue flex-shrink-0" />
        <div>
          <div className="subordinate-banner-title">
            VIEWING SUBORDINATE WORKSPACE — {subordinateTitle.toUpperCase()}
          </div>
          <div className="subordinate-banner-sub">
            Logged in as {viewerRole}. Accessing {subordinateJurisdiction} in read-only administrative inspection mode.
          </div>
        </div>
      </div>
      <div className="subordinate-banner-right">
        <span className="view-only-badge">
          <Eye className="w-3.5 h-3.5" />
          <span>READ ONLY</span>
        </span>
      </div>
    </div>
  );
};
