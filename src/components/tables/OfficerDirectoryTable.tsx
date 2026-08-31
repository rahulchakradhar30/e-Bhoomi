'use client';

import React from 'react';
import { EmptyState } from '../workspace/EmptyState';
import { Users } from 'lucide-react';

export const OfficerDirectoryTable: React.FC = () => {
  return (
    <div className="table-responsive-wrapper">
      <EmptyState
        title="No Operational Officer Accounts Found"
        description="Officer accounts will be provisioned by System Administrators or synchronized with State Revenue Department HR portals."
        icon={Users}
      />
    </div>
  );
};
