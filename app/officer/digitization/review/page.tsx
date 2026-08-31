'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { ManualReviewWorkspace } from '@/components/documents/ManualReviewWorkspace';

export default function DigitizationReviewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Field Officer Workspace', href: '/officer/dashboard' },
          { label: 'AI Review Queue', href: '/officer/digitization/review' }
        ]}
      />
      <WorkspaceHeader
        title="AI EXTRACTION REVIEW & ENDORSEMENT WORKSPACE"
        subtitle="Validate Extracted Field Data Against Original Physical Record Scan"
      />
      <ManualReviewWorkspace />
    </div>
  );
}
