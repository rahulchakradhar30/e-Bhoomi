'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode } from '@/config/digitizationSchemas';
import { FileText, ShieldCheck, RefreshCw, Users, BookOpen, Archive, CheckCircle2, ArrowRight } from 'lucide-react';

interface DocumentTypeStepProps {
  selectedType?: DocumentCategoryCode;
  onTypeSelected: (docType: DocumentCategoryCode) => void;
  onBack: () => void;
}

export const DocumentTypeStep: React.FC<DocumentTypeStepProps> = ({
  selectedType = 'ADANGAL',
  onTypeSelected,
  onBack,
}) => {
  const [currentSelection, setCurrentSelection] = useState<DocumentCategoryCode>(selectedType);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-6 h-6 text-navy-800" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-navy-800" />;
      case 'RefreshCw':
        return <RefreshCw className="w-6 h-6 text-navy-800" />;
      case 'Users':
        return <Users className="w-6 h-6 text-navy-800" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-navy-800" />;
      case 'Archive':
        return <Archive className="w-6 h-6 text-navy-800" />;
      default:
        return <FileText className="w-6 h-6 text-navy-800" />;
    }
  };

  const handleProceed = () => {
    onTypeSelected(currentSelection);
  };

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="PHASE 2: SELECT LAND RECORD DOCUMENT CATEGORY"
        guidance="Select the exact official document type being digitized. The selected category anchors the AI extraction schema and verification checklist."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          {SUPPORTED_DOCUMENT_TYPES.map((docType) => {
            const isSelected = currentSelection === docType.code;
            return (
              <div
                key={docType.code}
                onClick={() => setCurrentSelection(docType.code)}
                className={`p-4 rounded-lg border cursor-pointer transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-navy-50/70 border-navy-800 ring-2 ring-navy-800/30 shadow-md'
                    : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-navy-900 bg-amber-300 rounded-full p-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-md ${isSelected ? 'bg-navy-900 text-amber-300' : 'bg-slate-100'}`}>
                      {getIcon(docType.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy-900 text-base leading-tight">
                        {docType.titleEn}
                      </h4>
                      <p className="text-xs font-serif font-bold text-amber-700">
                        {docType.titleTe}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mb-1">
                    {docType.subtitleEn} • <span className="font-serif">{docType.subtitleTe}</span>
                  </p>

                  <p className="text-xs text-slate-500 leading-normal mt-2 border-t border-slate-200/60 pt-2">
                    {docType.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 text-[11px] font-semibold text-navy-800 flex items-center justify-between">
                  <span>{docType.checklistFields.length} Mandatory Check Fields</span>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Schema: {docType.code}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-navy-900 border border-slate-300 rounded hover:bg-slate-100"
          >
            ← Back to Consent
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="px-6 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider bg-navy-900 hover:bg-navy-800 text-amber-300 shadow-md flex items-center gap-2"
          >
            <span>Proceed to Document Upload</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </WorkspacePanel>
    </div>
  );
};
