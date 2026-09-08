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
  children,
}) => {
  return (
    <div className={`digi-panel ${className}`}>
      {title && (
        <div className="digi-panel-header">
          <span>{title}</span>
        </div>
      )}
      <div className="digi-panel-body">
        {guidance && (
          <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px' }}>
            {guidance}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

