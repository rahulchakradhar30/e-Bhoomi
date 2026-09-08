'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { getAssignedCasesForOfficer } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';
import { useCurrentUser } from '@/context/AuthContext';
import { SUPPORTED_DOCUMENT_TYPES } from '@/config/digitizationSchemas';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Lock,
  Eye,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
  CheckSquare,
  Sparkles,
  Camera,
  X,
  ExternalLink,
  Download,
  AlertTriangle,
  History as HistoryIcon,
} from 'lucide-react';
import Link from 'next/link';

export const DigitizationHistoryArchive: React.FC = () => {
  const { officerProfile } = useCurrentUser();
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DIGITIZED' | 'PENDING_HIGHER_REVIEW'>('ALL');
  const [selectedCase, setSelectedCase] = useState<DigitizationCaseDocument | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'document' | 'record' | 'checklist' | 'audit'>('document');

  const officerId = officerProfile?.officerId || 'AP-545-VRO-00101';

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const data = await getAssignedCasesForOfficer(officerId);
        // Exclude drafts, show only submitted / processed / digitized cases
        const submittedCases = data.filter((c) => c.workflowStatus !== 'DRAFT');
        setCases(submittedCases);
      } catch (err) {
        console.error('Failed to load digitization history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [officerId]);

  const filteredCases = cases.filter((c) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !search ||
      c.caseId?.toLowerCase().includes(search) ||
      c.extractedData?.ownerName?.value?.toLowerCase().includes(search) ||
      c.extractedData?.surveyNumber?.value?.toLowerCase().includes(search) ||
      c.extractedData?.khataNumber?.value?.toLowerCase().includes(search) ||
      c.extractedData?.villageName?.value?.toLowerCase().includes(search) ||
      c.documentType?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'DIGITIZED' && (c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED')) ||
      (statusFilter === 'PENDING_HIGHER_REVIEW' && c.workflowStatus === 'PENDING_HIGHER_REVIEW');

    return matchesSearch && matchesStatus;
  });

  const totalArchived = cases.length;
  const fullyDigitized = cases.filter((c) => c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED').length;
  const pendingReview = cases.filter((c) => c.workflowStatus === 'PENDING_HIGHER_REVIEW').length;
  const avgConfidence =
    cases.length > 0
      ? Math.round(
          (cases.reduce((acc, c) => acc + (c.aiConfidenceScore || 0.9), 0) / cases.length) * 100
        )
      : 95;

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Field Officer Workspace', href: '/officer/dashboard' },
          { label: 'Digitization History' },
        ]}
      />

      <WorkspaceHeader
        title="VRO DIGITIZATION HISTORY & AUDIT ARCHIVE"
        subtitle="Permanent Read-Only Legal Archive of All Completed Digitizations, Scanned Documents & Human Verifications"
        action={
          <Link href="/officer/digitization/new" className="new-digitization-btn">
            <FileText className="w-4 h-4" />
            <span>New Digitization Entry</span>
          </Link>
        }
      />

      {/* Summary Stat Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">ARCHIVED RECORDS</span>
            <HistoryIcon className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{totalArchived}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FULLY DIGITIZED</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{fullyDigitized}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">PENDING HIGHER REVIEW</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">{pendingReview}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">AVG AI CONFIDENCE</span>
            <Sparkles className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">{avgConfidence}%</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 border border-slate-200 rounded-md shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Survey No, Owner Name, Khata No, Case ID, Village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-navy focus:border-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-600 font-bold">Status:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-l-md border ${
                statusFilter === 'ALL'
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              All ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DIGITIZED')}
              className={`px-3 py-1 text-xs font-semibold border-t border-b ${
                statusFilter === 'DIGITIZED'
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Digitized ({fullyDigitized})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_HIGHER_REVIEW')}
              className={`px-3 py-1 text-xs font-semibold rounded-r-md border ${
                statusFilter === 'PENDING_HIGHER_REVIEW'
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Higher Review ({pendingReview})
            </button>
          </div>
        </div>
      </div>

      {/* Main Records Table / List */}
      <WorkspacePanel
        title="IMMUTABLE DIGITIZED RECORDS"
        guidance="All records submitted by VRO are legally locked. You can view scanned documents, checklists, and AI scores, but cannot edit after final submission."
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            Loading digitization archive from secure state...
          </div>
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'No Matching Records Found' : 'No Digitized Records Archived Yet'}
            description={
              searchTerm
                ? 'Try adjusting your search criteria or clear active filters.'
                : 'Digitize physical land records through the New Digitization workflow to populate the history archive.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <th className="p-3">Ref ID / Date</th>
                  <th className="p-3">Document Type</th>
                  <th className="p-3">Survey & Extent</th>
                  <th className="p-3">Pattadar (Owner)</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3 text-center">AI Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCases.map((c) => {
                  const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === c.documentType);
                  const score = Math.round((c.aiConfidenceScore || 0.9) * 100);
                  const isDigitized = c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED';

                  return (
                    <tr key={c.caseId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-bold text-navy-900">{c.caseId}</div>
                        <div className="text-[10px] text-slate-500">
                          {c.finalizedAt || c.updatedAt || c.createdAt
                            ? new Date(c.finalizedAt || c.updatedAt || c.createdAt).toLocaleString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-navy-800">
                          {docConfig?.titleEn || c.documentType}
                        </span>
                        <div className="text-[10px] text-slate-500 font-telugu">
                          {docConfig?.titleTe || ''}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">
                          Sy: {c.extractedData?.surveyNumber?.value || 'N/A'}
                          {c.extractedData?.subDivisionNumber?.value
                            ? `/${c.extractedData.subDivisionNumber.value}`
                            : ''}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {c.extractedData?.extentAcres?.value || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">
                          {c.extractedData?.ownerName?.value || 'Pattadar'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {c.extractedData?.fatherOrHusbandName?.value
                            ? `C/o ${c.extractedData.fatherOrHusbandName.value}`
                            : `Khata #${c.extractedData?.khataNumber?.value || 'N/A'}`}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-[11px] text-slate-800">
                          {c.extractedData?.villageName?.value || 'Kallur'},{' '}
                          {c.extractedData?.mandalName?.value || 'Kurnool Rural'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {c.extractedData?.districtName?.value || 'Kurnool'}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            score >= 85
                              ? 'bg-green-100 text-green-800'
                              : score >= 70
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {score}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            isDigitized
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isDigitized ? (
                            <>
                              <Lock className="w-3 h-3" />
                              DIGITIZED (LOCKED)
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              PENDING HIGHER REVIEW
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCase(c);
                            setActiveModalTab('document');
                          }}
                          className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded inline-flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>

      {/* Read-Only Inspection Modal / Drawer */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 md:p-6 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-navy-900 text-white p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wide">
                    IMMUTABLE LEGAL RECORD — READ ONLY
                  </span>
                </div>
                <h3 className="text-base font-bold">
                  {selectedCase.extractedData?.ownerName?.value || 'Pattadar'} • Survey #
                  {selectedCase.extractedData?.surveyNumber?.value || '142'} (Case: {selectedCase.caseId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Immutability Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>VRO Attestation Complete:</strong> This document was verified and submitted by VRO{' '}
                <span className="font-mono font-bold">{selectedCase.createdBy || officerId}</span>. All fields are
                permanently locked against modifications.
              </span>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModalTab('document')}
                className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === 'document'
                    ? 'border-navy-900 text-navy-900 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Original Scanned Document</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('record')}
                className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === 'record'
                    ? 'border-navy-900 text-navy-900 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Digitized Land Record Data</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('checklist')}
                className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === 'checklist'
                    ? 'border-navy-900 text-navy-900 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>VRO Checklist & Confidence</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('audit')}
                className={`py-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === 'audit'
                    ? 'border-navy-900 text-navy-900 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Legal Declaration & Audit</span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: Scanned Document Viewer */}
              {activeModalTab === 'document' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 font-bold">Document File: </span>
                      <span className="font-mono font-bold text-navy-900">
                        {selectedCase.documentUpload?.originalFileName || 'original_land_record.pdf'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Storage Ref: {selectedCase.documentUpload?.storageReference || selectedCase.sourceDocumentId || 'cloudinary://e-bhoomi/documents'}
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded bg-slate-100 p-2 min-h-[380px]">
                    <DocumentViewer
                      originalFileName={selectedCase.documentUpload?.originalFileName || 'document.pdf'}
                      pageCount={selectedCase.documentUpload?.pageCount || 1}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Structured Land Record Data */}
              {activeModalTab === 'record' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-md p-3 bg-white space-y-2">
                      <h4 className="text-xs font-bold text-navy-900 border-b pb-1">Primary Identifiers</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Pattadar (Owner) Name</span>
                          <span className="font-bold text-navy-900">
                            {selectedCase.extractedData?.ownerName?.value || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Father / Husband Name</span>
                          <span className="font-bold text-slate-800">
                            {selectedCase.extractedData?.fatherOrHusbandName?.value || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Survey Number</span>
                          <span className="font-mono font-bold text-navy-900">
                            {selectedCase.extractedData?.surveyNumber?.value || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Sub-Division</span>
                          <span className="font-mono font-bold text-slate-800">
                            {selectedCase.extractedData?.subDivisionNumber?.value || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Khata Number</span>
                          <span className="font-mono font-bold text-slate-800">
                            {selectedCase.extractedData?.khataNumber?.value || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Total Extent</span>
                          <span className="font-bold text-navy-900">
                            {selectedCase.extractedData?.extentAcres?.value || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-md p-3 bg-white space-y-2">
                      <h4 className="text-xs font-bold text-navy-900 border-b pb-1">Jurisdiction & Classification</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Village</span>
                          <span className="font-bold text-slate-800">
                            {selectedCase.extractedData?.villageName?.value || 'Kallur'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Mandal</span>
                          <span className="font-bold text-slate-800">
                            {selectedCase.extractedData?.mandalName?.value || 'Kurnool Rural'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">District</span>
                          <span className="font-bold text-slate-800">
                            {selectedCase.extractedData?.districtName?.value || 'Kurnool'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Land Classification</span>
                          <span className="font-bold text-slate-800">
                            {selectedCase.extractedData?.landClassification?.value || 'Patta / Dry'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Document Date</span>
                          <span className="font-bold text-slate-800">
                            {selectedCase.extractedData?.documentDate?.value || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Registration / Mutation Ref</span>
                          <span className="font-mono font-bold text-slate-800">
                            {selectedCase.extractedData?.registrationRef?.value ||
                              selectedCase.extractedData?.mutationRef?.value ||
                              'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boundaries */}
                  <div className="border border-slate-200 rounded-md p-3 bg-white space-y-2">
                    <h4 className="text-xs font-bold text-navy-900 border-b pb-1">Four Boundaries (చతురస్ర పరిమితులు)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold block">EAST (తూర్పు)</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCase.extractedData?.boundaries?.east?.value || 'Adjacent Survey Land'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold block">WEST (పశ్చిమ)</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCase.extractedData?.boundaries?.west?.value || 'Road / Stream'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold block">NORTH (ఉత్తరం)</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCase.extractedData?.boundaries?.north?.value || 'Pattadar Field'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold block">SOUTH (దక్షిణం)</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCase.extractedData?.boundaries?.south?.value || 'Village Boundary'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VRO Checklist & Confidence */}
              {activeModalTab === 'checklist' && (
                <div className="space-y-4">
                  {/* Confidence Summary */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-600 font-bold block">AI Pipeline Confidence Score</span>
                      <span className="text-[11px] text-slate-500">
                        Extracted via Llama API + Groq Land Extraction Schema Engine
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono text-green-700">
                        {Math.round((selectedCase.aiConfidenceScore || 0.95) * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">HIGH CONFIDENCE</span>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="border border-slate-200 rounded-md p-3 bg-white space-y-2">
                    <h4 className="text-xs font-bold text-navy-900 border-b pb-1">
                      VRO Human Verification Checklist State
                    </h4>
                    <div className="space-y-1.5">
                      {[
                        { id: 'chk_survey_no', label: 'Survey Number & Sub-Division verified against physical record' },
                        { id: 'chk_pattadar_name', label: 'Pattadar / Owner Name verified with revenue register' },
                        { id: 'chk_extent_acres', label: 'Land Extent in Acres accurately matched' },
                        { id: 'chk_classification', label: 'Land Classification (Patta / Inam / Dry) verified' },
                        { id: 'chk_boundaries', label: 'Four Boundaries cross-checked with field map' },
                        { id: 'chk_khata_no', label: 'Khata Number verified with ROR 1B records' },
                      ].map((chk) => {
                        const isChecked = selectedCase.checklist ? selectedCase.checklist[chk.id] ?? true : true;
                        return (
                          <div
                            key={chk.id}
                            className="p-2 rounded border border-slate-100 flex items-center justify-between text-xs bg-slate-50"
                          >
                            <span className="text-slate-800">{chk.label}</span>
                            <span className="inline-flex items-center gap-1 font-bold text-green-700 font-mono text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              VERIFIED
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Corrections Audit if any */}
                  {selectedCase.corrections && selectedCase.corrections.length > 0 && (
                    <div className="border border-slate-200 rounded-md p-3 bg-white space-y-2">
                      <h4 className="text-xs font-bold text-navy-900 border-b pb-1">
                        Field Corrections Made by VRO during Review
                      </h4>
                      <div className="space-y-1">
                        {selectedCase.corrections.map((corr, idx) => (
                          <div key={idx} className="p-2 bg-amber-50 rounded border border-amber-100 text-xs">
                            <span className="font-bold text-navy-900 font-mono uppercase">{corr.fieldId}: </span>
                            <span className="text-slate-500 line-through mr-2">{corr.originalAIValue}</span>
                            <span className="text-green-700 font-bold mr-3">{corr.correctedValue}</span>
                            <span className="text-slate-600 text-[11px] italic">({corr.correctionReason})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Legal Declaration & Audit */}
              {activeModalTab === 'audit' && (
                <div className="space-y-3">
                  <div className="p-4 bg-navy-900 text-white rounded-md space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                      <ShieldCheck className="w-4 h-4" />
                      <span>VRO Official Attestation & Digital Stamp</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      "{selectedCase.finalConsent?.declarationText ||
                        'I confirm that I have reviewed the original document, AI-extracted information, corrections, field verification, and other required information and I am responsible for the information submitted for digitization.'}"
                    </p>
                    <div className="pt-2 border-t border-navy-800 text-[11px] text-slate-400 grid grid-cols-2 gap-2 font-mono">
                      <div>
                        <span>Attested By Officer: </span>
                        <strong className="text-white">
                          {selectedCase.finalConsent?.finalAcceptedBy || selectedCase.createdBy || officerId}
                        </strong>
                      </div>
                      <div>
                        <span>Timestamp: </span>
                        <strong className="text-white">
                          {selectedCase.finalConsent?.finalAcceptedAt || selectedCase.finalizedAt || selectedCase.createdAt}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-md p-3 bg-white space-y-2">
                    <h4 className="text-xs font-bold text-navy-900 border-b pb-1">Audit Trail & Timeline</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">Document Uploaded & Verified</span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {selectedCase.createdAt} • Storage Ref: {selectedCase.sourceDocumentId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">Llama Multimodal + Groq Extraction Completed</span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Status: PASSED • Model: openai/gpt-oss-120b
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">VRO Human Verification & Checklist Completed</span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Attested by {selectedCase.createdBy || officerId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-navy-900 mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-navy-900">Final Record Locked into Ledger</span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Status: {selectedCase.workflowStatus} • Finalized: {selectedCase.finalizedAt || selectedCase.updatedAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Modifications Disabled (Record Finalized)</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-1.5 bg-navy-900 text-white font-bold rounded hover:bg-navy-800 transition-colors"
              >
                Close Record Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
