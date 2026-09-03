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
    <div className="space-y-4 max-w-5xl mx-auto">
      <WorkspacePanel
        title="SELECT LAND RECORD DOCUMENT CATEGORY"
        guidance="Select official document category being digitized to anchor extraction schemas and category checklist."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 my-1">
          {SUPPORTED_DOCUMENT_TYPES.map((docType) => {
            const isSelected = currentSelection === docType.code;
            return (
              <div
                key={docType.code}
                onClick={() => handleSelect(docType.code)}
                className={`p-4 rounded-md border cursor-pointer transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-navy-50/80 border-navy-900 ring-2 ring-navy-800/30 shadow-md'
                    : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-navy-950 bg-amber-300 rounded-full p-0.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-navy-900 text-amber-300' : 'bg-slate-100 text-navy-800'}`}>
                      {getIcon(docType.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm leading-tight">
                        {docType.titleEn}
                      </h4>
                      <p className="text-[11px] font-serif font-bold text-amber-800">
                        {docType.titleTe}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mb-1">
                    {docType.subtitleEn}
                  </p>

                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2 border-t border-slate-200/80 pt-2">
                    {docType.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 text-[10px] font-semibold text-navy-900 flex items-center justify-between border-t border-slate-100">
                  <span>{docType.checklistFields.length} Required Fields</span>
                  <span className="font-mono text-slate-400 uppercase">{docType.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      </WorkspacePanel>
    </div>
  );
};
