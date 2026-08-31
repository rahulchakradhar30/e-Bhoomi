'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { DocumentDigitization } from '@/components/documents/DocumentDigitization';

export default function NewDigitizationPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Field Officer Workspace', href: '/officer/dashboard' },
          { label: 'Digitization', href: '/officer/digitization/new' },
          { label: 'New Record Entry' }
        ]}
      />
      <WorkspaceHeader
        title="NEW LAND RECORD DIGITIZATION ENTRY"
        subtitle="Upload Physical Land Record Scans for AI-Powered Multi-Lingual OCR Extraction"
      />
      <DocumentDigitization />
    </div>
  );
}
