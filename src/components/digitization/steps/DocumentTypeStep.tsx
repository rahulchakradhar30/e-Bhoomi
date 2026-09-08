'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode } from '@/config/digitizationSchemas';
import { FileText, ShieldCheck, RefreshCw, Users, BookOpen, Archive, CheckCircle2 } from 'lucide-react';

interface DocumentTypeStepProps {
  selectedType?: DocumentCategoryCode;
  onTypeSelected: (docType: DocumentCategoryCode) => void;
  onBack?: () => void;
}

export const DocumentTypeStep: React.FC<DocumentTypeStepProps> = ({
  selectedType = 'ADANGAL',
  onTypeSelected,
}) => {
  const [currentSelection, setCurrentSelection] = useState<DocumentCategoryCode>(selectedType);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'RefreshCw':
        return <RefreshCw className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Archive':
        return <Archive className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleSelect = (code: DocumentCategoryCode) => {
    setCurrentSelection(code);
    onTypeSelected(code);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <WorkspacePanel
        title="SELECT LAND RECORD DOCUMENT CATEGORY"
        guidance="Select official document category being digitized to anchor extraction schemas and category checklist."
      >
        <div className="digi-doc-grid">
          {SUPPORTED_DOCUMENT_TYPES.map((docType) => {
            const isSelected = currentSelection === docType.code;
            return (
              <div
                key={docType.code}
                onClick={() => handleSelect(docType.code)}
                className={`digi-doc-card ${isSelected ? 'is-selected' : ''}`}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#0b2545', background: '#fbbf24', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <div className="digi-doc-card-top">
                    <div className="digi-doc-icon-badge">
                      {getIcon(docType.iconName)}
                    </div>
                    <div className="digi-doc-titles">
                      <h4 className="digi-doc-name-en">
                        {docType.titleEn}
                      </h4>
                      <p className="digi-doc-name-te">
                        {docType.titleTe}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginTop: '8px', marginBottom: '4px' }}>
                    {docType.subtitleEn}
                  </p>

                  <p className="digi-doc-desc">
                    {docType.description}
                  </p>
                </div>

                <div className="digi-doc-footer">
                  <span>{docType.checklistFields.length} Required Fields</span>
                  <span>{docType.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      </WorkspacePanel>
    </div>
  );
};
