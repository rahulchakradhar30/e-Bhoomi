'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { getAssignedCasesForOfficer } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';
import { useCurrentUser } from '@/context/AuthContext';
import { SUPPORTED_DOCUMENT_TYPES } from '@/config/digitizationSchemas';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Lock,
  Eye,
  Sparkles,
  Download,
  History as HistoryIcon,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DigitizationHistoryArchive: React.FC = () => {
  const { officerProfile } = useCurrentUser();
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DIGITIZED' | 'PENDING_HIGHER_REVIEW'>('ALL');

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

  const handleExportToExcel = () => {
    if (filteredCases.length === 0) return;

    const exportRows = filteredCases.map((c, index) => {
      const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === c.documentType);
      const score = Math.round((c.aiConfidenceScore || 0.9) * 100);
      const isDigitized = c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED';

      return {
        'S.No': index + 1,
        'Reference ID': c.caseId,
        'Submission Date': c.finalizedAt || c.updatedAt || c.createdAt
          ? new Date(c.finalizedAt || c.updatedAt || c.createdAt).toLocaleString()
          : 'N/A',
        'Document Type (EN)': docConfig?.titleEn || c.documentType,
        'Document Type (TE)': docConfig?.titleTe || '',
        'Survey Number': c.extractedData?.surveyNumber?.value || 'N/A',
        'Sub-Division': c.extractedData?.subDivisionNumber?.value || '',
        'Total Extent (Acres)': c.extractedData?.extentAcres?.value || 'N/A',
        'Pattadar (Owner)': c.extractedData?.ownerName?.value || 'Pattadar',
        'Father / Husband Name': c.extractedData?.fatherOrHusbandName?.value || 'N/A',
        'Khata Number': c.extractedData?.khataNumber?.value || 'N/A',
        'Land Classification': c.extractedData?.landClassification?.value || 'Patta / Dry',
        'Village': c.extractedData?.villageName?.value || 'Laxmipuram',
        'Mandal': c.extractedData?.mandalName?.value || 'Kurnool Rural',
        'District': c.extractedData?.districtName?.value || 'Kurnool',
        'AI Confidence (%)': score,
        'Legal Workflow Status': isDigitized ? 'DIGITIZED (LOCKED)' : c.workflowStatus,
        'Attesting Officer': c.finalConsent?.finalAcceptedBy || c.createdBy || officerId,
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    
    // Auto-fit column widths
    const colWidths = Object.keys(exportRows[0] || {}).map((key) => ({
      wch: Math.max(key.length + 3, 14),
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Digitization_Records');
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `eBhoomi_Digitization_History_${timestamp}.xlsx`);
  };

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

      {/* Summary KPI Cards Grid */}
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

      {/* Search, Filter & Excel Export Toolbar */}
      <div className="archive-toolbar">
        <div className="archive-search-box">
          <Search className="w-4 h-4 archive-search-icon" />
          <input
            type="text"
            placeholder="Search by Survey No, Owner Name, Khata No, Case ID, Village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="archive-search-input"
          />
        </div>

        <div className="archive-filters-group">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Status:</span>
          </div>

          <div className="filter-btn-group" role="group">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`filter-toggle-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            >
              All ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DIGITIZED')}
              className={`filter-toggle-btn ${statusFilter === 'DIGITIZED' ? 'active' : ''}`}
            >
              Digitized ({fullyDigitized})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_HIGHER_REVIEW')}
              className={`filter-toggle-btn ${statusFilter === 'PENDING_HIGHER_REVIEW' ? 'active' : ''}`}
            >
              Higher Review ({pendingReview})
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportToExcel}
            disabled={filteredCases.length === 0}
            className="excel-export-btn"
            title="Download records as formatted Excel (.xlsx) file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download as Excel</span>
          </button>
        </div>
      </div>

      {/* Main Tabular Records Table */}
      <WorkspacePanel
        title="IMMUTABLE DIGITIZED RECORDS"
        guidance="All records submitted by VRO are legally locked. Click 'View Detail' on any record to open its dedicated Government Land Record Certificate & Complete Audit view."
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
                ? 'Try adjusting your search query or reset active status filters.'
                : 'Digitize physical land records through the New Digitization workflow to populate the history archive.'
            }
          />
        ) : (
          <div className="gov-archive-table-wrap">
            <table className="gov-archive-table">
              <thead>
                <tr>
                  <th>Ref ID / Date</th>
                  <th>Document Type</th>
                  <th>Survey & Extent</th>
                  <th>Pattadar (Owner)</th>
                  <th>Jurisdiction</th>
                  <th style={{ textAlign: 'center' }}>AI Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => {
                  const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === c.documentType);
                  const score = Math.round((c.aiConfidenceScore || 0.9) * 100);
                  const isDigitized = c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED';

                  return (
                    <tr key={c.caseId}>
                      {/* Ref ID / Date */}
                      <td>
                        <div className="table-ref-id">{c.caseId}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {c.finalizedAt || c.updatedAt || c.createdAt
                              ? new Date(c.finalizedAt || c.updatedAt || c.createdAt).toLocaleString()
                              : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Document Type */}
                      <td>
                        <div className="table-doc-title">
                          {docConfig?.titleEn || c.documentType}
                        </div>
                        <div className="table-doc-sub">
                          {docConfig?.titleTe || ''}
                        </div>
                      </td>

                      {/* Survey & Extent */}
                      <td>
                        <div className="font-bold text-slate-900 font-mono">
                          Sy: {c.extractedData?.surveyNumber?.value || 'N/A'}
                          {c.extractedData?.subDivisionNumber?.value
                            ? `/${c.extractedData.subDivisionNumber.value}`
                            : ''}
                        </div>
                        <div className="text-[11px] font-semibold text-green-700">
                          {c.extractedData?.extentAcres?.value || 'N/A'}
                        </div>
                      </td>

                      {/* Pattadar (Owner) */}
                      <td>
                        <div className="table-pattadar-name">
                          {c.extractedData?.ownerName?.value || 'Pattadar'}
                        </div>
                        <div className="table-pattadar-sub">
                          {c.extractedData?.fatherOrHusbandName?.value
                            ? `C/o ${c.extractedData.fatherOrHusbandName.value}`
                            : `Khata #${c.extractedData?.khataNumber?.value || 'N/A'}`}
                        </div>
                      </td>

                      {/* Jurisdiction */}
                      <td>
                        <div className="text-[11px] font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>
                            {c.extractedData?.villageName?.value || 'Laxmipuram'},{' '}
                            {c.extractedData?.mandalName?.value || 'Kallur'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 ml-4">
                          {c.extractedData?.districtName?.value || 'Kurnool'}
                        </div>
                      </td>

                      {/* AI Score */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`table-score-badge ${
                            score >= 85 ? 'high' : score >= 70 ? 'med' : 'low'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {score}%
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`table-status-pill ${
                            isDigitized ? 'locked' : 'review'
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

                      {/* Action -> Navigates to dedicated page */}
                      <td style={{ textAlign: 'center' }}>
                        <Link
                          href={`/officer/history/${c.caseId}`}
                          className="table-view-btn"
                          title="Open full dedicated Government Land Record Certificate & Audit page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
};
