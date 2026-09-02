'use client';

import React, { useState, useMemo } from 'react';
import { getMasterMetadata, getStates, getDistricts, getRevenueDivisions, getSubdistricts, getVillages, getSachivalayams } from '@/services/administrativeDataService';
import { APP_CONFIG } from '@/config/appConfig';
import { Database, Building2, MapPin, Layers, Home, Search } from 'lucide-react';

export const MasterDataBrowser: React.FC = () => {
  const metadata = getMasterMetadata();
  const states = getStates();
  const [selectedState, setSelectedState] = useState(APP_CONFIG.activeStateCode);
  const [selectedDistrict, setSelectedDistrict] = useState(APP_CONFIG.activeDistrictCode);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');

  // Individual Search States for each hierarchy level
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchDivision, setSearchDivision] = useState('');
  const [searchSubdistrict, setSearchSubdistrict] = useState('');
  const [searchVillage, setSearchVillage] = useState('');
  const [searchSachivalayam, setSearchSachivalayam] = useState('');

  // Raw scoped data fetches
  const districts = useMemo(() => getDistricts(selectedState), [selectedState]);
  const divisions = useMemo(() => getRevenueDivisions(selectedDistrict), [selectedDistrict]);
  const subdistricts = useMemo(() => getSubdistricts(selectedState, selectedDistrict, selectedDivision), [selectedState, selectedDistrict, selectedDivision]);
  const villages = useMemo(() => getVillages(selectedSubdistrict), [selectedSubdistrict]);
  const sachivalayams = useMemo(() => getSachivalayams(selectedSubdistrict), [selectedSubdistrict]);

  // Filtered data with case-insensitive search
  const filteredDistricts = useMemo(() => {
    if (!searchDistrict.trim()) return districts;
    const q = searchDistrict.toLowerCase().trim();
    return districts.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.district_code.includes(q) ||
      (d.local_name && d.local_name.includes(q))
    );
  }, [districts, searchDistrict]);

  const filteredDivisions = useMemo(() => {
    if (!searchDivision.trim()) return divisions;
    const q = searchDivision.toLowerCase().trim();
    return divisions.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.division_code.includes(q) ||
      (r.local_name && r.local_name.includes(q))
    );
  }, [divisions, searchDivision]);

  const filteredSubdistricts = useMemo(() => {
    if (!searchSubdistrict.trim()) return subdistricts;
    const q = searchSubdistrict.toLowerCase().trim();
    return subdistricts.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.subdistrict_code.includes(q) ||
      (s.local_name && s.local_name.includes(q))
    );
  }, [subdistricts, searchSubdistrict]);

  const filteredVillages = useMemo(() => {
    if (!searchVillage.trim()) return villages;
    const q = searchVillage.toLowerCase().trim();
    return villages.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.village_code.includes(q) ||
      (v.local_name && v.local_name.includes(q))
    );
  }, [villages, searchVillage]);

  const filteredSachivalayams = useMemo(() => {
    if (!searchSachivalayam.trim()) return sachivalayams;
    const q = searchSachivalayam.toLowerCase().trim();
    return sachivalayams.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.sachivalayam_code.includes(q) ||
      (s.locality_name && s.locality_name.toLowerCase().includes(q)) ||
      (s.local_name && s.local_name.includes(q))
    );
  }, [sachivalayams, searchSachivalayam]);

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
            <span>DISTRICTS ({filteredDistricts.length})</span>
          </div>
          <div className="hierarchy-search-box" style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search districts..."
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12px', color: '#1e293b' }}
            />
            {searchDistrict && (
              <button type="button" onClick={() => setSearchDistrict('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}>×</button>
            )}
          </div>
          <div className="hierarchy-list">
            {filteredDistricts.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">No matching districts found</span>
              </div>
            ) : (
              filteredDistricts.map((d) => (
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
              ))
            )}
          </div>
        </div>

        {/* Revenue Division Column */}
        <div className="hierarchy-column-box">
          <div className="hierarchy-box-header">
            <Layers className="w-4 h-4" />
            <span>REVENUE DIVISIONS ({filteredDivisions.length})</span>
          </div>
          <div className="hierarchy-search-box" style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search divisions..."
              value={searchDivision}
              onChange={(e) => setSearchDivision(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12px', color: '#1e293b' }}
            />
            {searchDivision && (
              <button type="button" onClick={() => setSearchDivision('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}>×</button>
            )}
          </div>
          <div className="hierarchy-list">
            {divisions.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a District to view Revenue Divisions</span>
              </div>
            ) : filteredDivisions.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">No matching revenue divisions found</span>
              </div>
            ) : (
              filteredDivisions.map((r) => (
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
            <span>MANDALS ({filteredSubdistricts.length})</span>
          </div>
          <div className="hierarchy-search-box" style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search mandals..."
              value={searchSubdistrict}
              onChange={(e) => setSearchSubdistrict(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12px', color: '#1e293b' }}
            />
            {searchSubdistrict && (
              <button type="button" onClick={() => setSearchSubdistrict('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}>×</button>
            )}
          </div>
          <div className="hierarchy-list">
            {subdistricts.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a Division/District to view Mandals</span>
              </div>
            ) : filteredSubdistricts.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">No matching mandals found</span>
              </div>
            ) : (
              filteredSubdistricts.map((s) => (
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
            <span>VILLAGES ({filteredVillages.length})</span>
          </div>
          <div className="hierarchy-search-box" style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search villages..."
              value={searchVillage}
              onChange={(e) => setSearchVillage(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12px', color: '#1e293b' }}
            />
            {searchVillage && (
              <button type="button" onClick={() => setSearchVillage('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}>×</button>
            )}
          </div>
          <div className="hierarchy-list">
            {selectedSubdistrict && villages.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text" style={{ fontSize: '11px', color: '#94a3b8' }}>
                  No villages recorded under selected Mandal.
                </span>
              </div>
            ) : villages.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a Mandal to view Villages</span>
              </div>
            ) : filteredVillages.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">No matching villages found</span>
              </div>
            ) : (
              filteredVillages.map((v) => (
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
            <span>SECRETARIATS ({filteredSachivalayams.length})</span>
          </div>
          <div className="hierarchy-search-box" style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search secretariats..."
              value={searchSachivalayam}
              onChange={(e) => setSearchSachivalayam(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12px', color: '#1e293b' }}
            />
            {searchSachivalayam && (
              <button type="button" onClick={() => setSearchSachivalayam('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}>×</button>
            )}
          </div>
          <div className="hierarchy-list">
            {sachivalayams.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">Select a Mandal to view Secretariats</span>
              </div>
            ) : filteredSachivalayams.length === 0 ? (
              <div className="empty-panel-state">
                <span className="empty-state-text">No matching secretariats found</span>
              </div>
            ) : (
              filteredSachivalayams.map((s) => (
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
                    {s.locality_name && <span className="text-xs text-navy font-semibold">{s.locality_name}</span>}
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
