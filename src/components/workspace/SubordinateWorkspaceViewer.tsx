'use client';

import React from 'react';
import { ReadOnlyBanner } from './ReadOnlyBanner';

interface SubordinateWorkspaceViewerProps {
  subordinateTitle: string;
  subordinateJurisdiction: string;
  viewerRole: string;
  children: React.ReactNode;
}

export const SubordinateWorkspaceViewer: React.FC<SubordinateWorkspaceViewerProps> = ({
  subordinateTitle,
  subordinateJurisdiction,
  viewerRole,
  children
}) => {
  return (
    <div>
      <ReadOnlyBanner
        subordinateTitle={subordinateTitle}
        subordinateJurisdiction={subordinateJurisdiction}
        viewerRole={viewerRole}
      />
      <div className="read-only-wrapper">
        {children}
      </div>
    </div>
  );
};
