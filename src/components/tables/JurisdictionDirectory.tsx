'use client';

import React from 'react';
import { EmptyState } from '../workspace/EmptyState';
import { MapPin } from 'lucide-react';

export const JurisdictionDirectory: React.FC = () => {
  return (
    <div>
      <EmptyState
        title="No Custom Jurisdictional Mappings Configured"
        description="All administrative boundaries currently inherit standard Local Government Directory (LGD) State, District, Mandal, and Village hierarchy definitions."
        icon={MapPin}
      />
    </div>
  );
};
