'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are currently no official records available in this inbox or administrative workspace queue.',
  icon: Icon = Inbox
}) => {
  return (
    <div className="table-empty-state">
      <Icon className="w-10 h-10 empty-inbox-icon" />
      <div className="empty-inbox-title">{title}</div>
      <div className="empty-inbox-desc">{description}</div>
    </div>
  );
};
