'use client';

import React from 'react';

interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  subtitle,
  action
}) => {
  return (
    <div className="dashboard-title-row">
      <div>
        <h1 className="dashboard-main-title">{title}</h1>
        {subtitle && <p className="dashboard-main-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
