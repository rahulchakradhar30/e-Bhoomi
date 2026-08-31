'use client';

import React from 'react';

interface WorkspacePanelProps {
  title?: string;
  guidance?: string;
  className?: string;
  children: React.ReactNode;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  title,
  guidance,
  className = '',
  children
}) => {
  return (
    <div className={`workspace-panel ${className}`}>
      {title && <h2 className="panel-title-text">{title}</h2>}
      {guidance && <p className="panel-guidance-text">{guidance}</p>}
      {children}
    </div>
  );
};
