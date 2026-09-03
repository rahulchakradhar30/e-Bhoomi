'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';

interface DocumentViewerProps {
  documentUrl?: string;
  originalFileName?: string;
  pageCount?: number;
  activePageNumber?: number;
  onPageChange?: (pageNumber: number) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  originalFileName = 'Scanned_Revenue_Record.pdf',
  pageCount = 1,
  activePageNumber = 1,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(activePageNumber);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handlePagePrev = () => {
    if (currentPage > 1) {
      const nextP = currentPage - 1;
      setCurrentPage(nextP);
      onPageChange?.(nextP);
    }
  };

  const handlePageNext = () => {
    if (currentPage < pageCount) {
      const nextP = currentPage + 1;
      setCurrentPage(nextP);
      onPageChange?.(nextP);
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(200, z + 15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(60, z - 15));
  const handleResetZoom = () => setZoomLevel(100);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="border border-gov-border rounded bg-white shadow-sm flex flex-col overflow-hidden">
      {/* Viewer Control Header */}
      <div className="bg-navy-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-navy-700">
        <div className="flex items-center gap-2 text-sm font-semibold truncate max-w-xs">
          <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="truncate" title={originalFileName}>
            {originalFileName}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Page Navigation */}
          {pageCount > 1 && (
            <div className="flex items-center gap-1 bg-navy-800 rounded px-2 py-1 mr-2 border border-navy-600">
              <button
                type="button"
                onClick={handlePagePrev}
                disabled={currentPage <= 1}
                className="p-1 hover:bg-navy-700 disabled:opacity-40 rounded"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono px-1">
                {currentPage} / {pageCount}
              </span>
              <button
                type="button"
                onClick={handlePageNext}
                disabled={currentPage >= pageCount}
                className="p-1 hover:bg-navy-700 disabled:opacity-40 rounded"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-navy-800 rounded text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono w-10 text-center text-amber-300 font-bold">{zoomLevel}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-navy-800 rounded text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-navy-800 rounded text-slate-200 ml-1"
            title="Fit to Width / Reset Zoom"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 hover:bg-navy-800 rounded text-slate-200"
            title="Rotate Clockwise"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas / Render Area */}
      <div className="bg-slate-100 p-4 min-h-[420px] max-h-[640px] overflow-auto flex justify-center items-start border-inner">
        <div
          className="bg-white shadow-md border border-slate-300 transition-all duration-200 ease-out origin-top text-slate-800 p-6 font-serif relative"
          style={{
            width: `${Math.max(300, Math.min(900, (650 * zoomLevel) / 100))}px`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Government Watermark / Sample Scanned Page View */}
          <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-400 border border-dashed border-slate-300 px-2 py-0.5 rounded">
            ORIGINAL SCAN • PAGE {currentPage}
          </div>

          <div className="border-b-2 border-navy-800 pb-3 mb-4 text-center">
            <h4 className="text-base font-bold text-navy-900 uppercase tracking-wide">
              GOVERNMENT OF ANDHRA PRADESH • REVENUE DEPARTMENT
            </h4>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              OFFICIAL LAND RECORD ARCHIVE (LGD JURISDICTION: KURNOOL RURAL)
            </p>
          </div>

          {documentUrl ? (
            <div className="my-4 text-center">
              {documentUrl.endsWith('.pdf') ? (
                <iframe
                  src={`${documentUrl}#page=${currentPage}`}
                  className="w-full h-[450px] border"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={documentUrl}
                  alt="Scanned Land Record"
                  className="max-w-full h-auto mx-auto border"
                />
              )}
            </div>
          ) : (
            /* Clean Document Canvas View when no direct file URL is loaded */
            <div className="py-16 text-center space-y-3 bg-slate-50 p-6 border border-slate-200 rounded">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-xs font-mono font-bold text-navy-900 uppercase">
                {originalFileName}
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-sans">
                Document loaded into secure pre-processing pipeline. Page {currentPage} of {pageCount}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
