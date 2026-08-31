'use client';

import React, { useState } from 'react';
import { getMasterMetadata, getStates, getDistricts, getRevenueDivisions, getSubdistricts, getVillages, getSachivalayams } from '@/services/administrativeDataService';
import { APP_CONFIG } from '@/config/appConfig';
import { Database, Building2, MapPin, Layers, Home } from 'lucide-react';

export const MasterDataBrowser: React.FC = () => {
  const metadata = getMasterMetadata();
  const states = getStates();
  const [selectedState, setSelectedState] = useState(APP_CONFIG.activeStateCode);
  const [selectedDistrict, setSelectedDistrict] = useState(APP_CONFIG.activeDistrictCode);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');

  const districts = getDistricts(selectedState);
  const divisions = getRevenueDivisions(selectedDistrict);
  const subdistricts = getSubdistricts(selectedState, selectedDistrict, selectedDivision);
  const villages = getVillages(selectedSubdistrict);
  const sachivalayams = getSachivalayams(selectedSubdistrict);

  return (
    <div>
      <div className="dataset-metadata-banner margin-bottom-md">
        <Database className="w-8 h-8 text-navy flex-shrink-0" />
        <div className="metadata-info-grid">
          <div>
            <span className="metadata-label">AUTHORITATIVE SOURCE:</span>
            <strong className="metadata-value">{metadata.sourceFile || metadata.source || 'Kurnool District Sachivalayam Master 2025'}</strong>
          </div>
          <div>
            <span className="metadata-label">ACTIVE SCOPE:</span>
            <strong className="metadata-value">{APP_CONFIG.activeState} — {APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</strong>
          </div>
          <div>
            <span className="metadata-label">IMPORTED AT:</span>
            <strong className="metadata-value">{metadata.importedAt ? new Date(metadata.importedAt).toLocaleDateString('en-IN') : metadata.last_updated || '—'}</strong>
          </div>
        </div>
      </div>

      <div className="master-data-hierarchy-grid">
        {/* District Column */}
        <div className="hierarchy-column-box">
          <div className="hierarchy-box-header">
            <Building2 className="w-4 h-4" />
            <span>DISTRICTS ({districts.length})</span>
          </div>
          <div className="hierarchy-list">
            {districts.map((d) => (
              <div
                key={d.district_code}
                className={`hierarchy-list-item ${selectedDistrict === d.district_code ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDistrict(d.district_code);
                  setSelectedDivision('');
                  setSelectedSubdistrict('');
                }}
              >
                <div className="item-title-row">
                  <strong>{d.name}</strong>
                  <span className="display-code-badge">{d.display_code}</span>
                </div>
                <div className="item-sub-row">
                  <span className="text-xs text-muted">LGD Code: {d.district_code}</span>
                  <span className="text-xs font-bold text-navy">{d.local_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Division Column */}
        <div className="hierarchy-column-box">
          <div className="hierarchy-box-header">
            <Layers className="w-4 h-4" />
            <span>REVENUE DIVISIONS ({divisions.length})</span>
          </div>
          <div className="hierarchy-list">
            {divisions.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a District to view Revenue Divisions</span>
              </div>
            ) : (
              divisions.map((r) => (
                <div
                  key={r.division_code}
                  className={`hierarchy-list-item ${selectedDivision === r.division_code ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDivision(r.division_code);
                    setSelectedSubdistrict('');
                  }}
                >
                  <div className="item-title-row">
                    <strong>{r.name}</strong>
                  </div>
                  <div className="item-sub-row">
                    <span className="text-xs text-muted">Code: {r.division_code}</span>
                    <span className="text-xs font-bold text-navy">{r.local_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subdistrict (Mandal) Column */}
        <div className="hierarchy-column-box">
          <div className="hierarchy-box-header">
            <Building2 className="w-4 h-4" />
            <span>MANDALS ({subdistricts.length})</span>
          </div>
          <div className="hierarchy-list">
            {subdistricts.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a Division/District to view Mandals</span>
              </div>
            ) : (
              subdistricts.map((s) => (
                <div
                  key={s.subdistrict_code}
                  className={`hierarchy-list-item ${selectedSubdistrict === s.subdistrict_code ? 'active' : ''}`}
                  onClick={() => setSelectedSubdistrict(s.subdistrict_code)}
                >
                  <div className="item-title-row">
                    <strong>{s.name}</strong>
                    <span className="text-xs font-bold text-blue">{s.type}</span>
                  </div>
                  <div className="item-sub-row">
                    <span className="text-xs text-muted">LGD Code: {s.subdistrict_code}</span>
                    <span className="text-xs font-bold text-navy">{s.local_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Village Column */}
        <div className="hierarchy-column-box">
          <div className="hierarchy-box-header">
            <MapPin className="w-4 h-4" />
            <span>VILLAGES ({villages.length})</span>
          </div>
          <div className="hierarchy-list">
            {selectedSubdistrict && villages.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text" style={{ fontSize: '11px', color: '#94a3b8' }}>
                  No villages available in the authoritative Excel master dataset.
                </span>
              </div>
            ) : villages.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a Mandal to view Villages</span>
              </div>
            ) : (
              villages.map((v) => (
                <div key={v.village_code} className="hierarchy-list-item">
                  <div className="item-title-row">
                    <strong>{v.name}</strong>
                  </div>
                  <div className="item-sub-row">
                    <span className="text-xs text-muted">LGD Code: {v.village_code}</span>
                    <span className="text-xs font-bold text-navy">{v.local_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sachivalayam Column */}
        <div className="hierarchy-column-box">
          <div className="hierarchy-box-header">
            <Home className="w-4 h-4" />
            <span>SACHIVALAYAMS ({sachivalayams.length})</span>
          </div>
          <div className="hierarchy-list">
            {sachivalayams.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a Mandal to view Sachivalayams</span>
              </div>
            ) : (
              sachivalayams.map((s) => (
                <div key={s.sachivalayam_code} className="hierarchy-list-item">
                  <div className="item-title-row">
                    <strong>{s.name}</strong>
                    <span 
                      style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        backgroundColor: s.area_type === 'Urban' ? '#FEE2E2' : '#D1FAE5',
                        color: s.area_type === 'Urban' ? '#991B1B' : '#065F46'
                      }}
                    >
                      {s.area_type}
                    </span>
                  </div>
                  <div className="item-sub-row">
                    <span className="text-xs text-muted">Code: {s.sachivalayam_code}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
