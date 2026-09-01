'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EmptyState } from '../workspace/EmptyState';
import { Users, Search, Download, ArrowUpDown, Loader2, X } from 'lucide-react';
import { getAllOfficers } from '@/lib/services/officerService';
import { OfficerProfile } from '@/types/officer';
import * as XLSX from 'xlsx';

export const OfficerDirectoryTable: React.FC = () => {
  const [officers, setOfficers] = useState<OfficerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sortField, setSortField] = useState<'name' | 'districtId' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Excel Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCols, setExportCols] = useState({
    name: true,
    loginId: true,
    designation: true,
    roleId: true,
    districtId: true,
    officialEmail: true,
    officialMobile: true,
    accountStatus: true
  });

  useEffect(() => {
    getAllOfficers()
      .then(data => setOfficers(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOfficers = useMemo(() => {
    return officers.filter(o => {
      // Type assertion added because loginId might be missing in older records
      const loginId = (o as any).loginId || '';
      const matchSearch = (o.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          loginId.toLowerCase().includes(search.toLowerCase()) ||
                          (o.districtId?.toLowerCase() || '').includes(search.toLowerCase());
      const matchCategory = category === 'ALL' || o.roleId === category;
      return matchSearch && matchCategory;
    }).sort((a, b) => {
      let valA = String(a[sortField] || '');
      let valB = String(b[sortField] || '');
      if (sortOrder === 'desc') {
        return valB.localeCompare(valA);
      }
      return valA.localeCompare(valB);
    });
  }, [officers, search, category, sortField, sortOrder]);

  const toggleSort = (field: 'name' | 'districtId' | 'createdAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const data = filteredOfficers.map(o => {
      const row: any = {};
      const loginId = (o as any).loginId || o.officerId;
      if (exportCols.name) row['Full Name'] = o.name;
      if (exportCols.loginId) row['Login ID'] = loginId;
      if (exportCols.designation) row['Designation'] = o.designation;
      if (exportCols.roleId) row['Role Category'] = o.roleId;
      if (exportCols.districtId) row['Working District (LGD)'] = o.districtId;
      if (exportCols.officialEmail) row['Official Email'] = o.officialEmail;
      if (exportCols.officialMobile) row['Mobile Number'] = o.officialMobile;
      if (exportCols.accountStatus) row['Status'] = o.accountStatus;
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Officers');
    XLSX.writeFile(workbook, 'Officer_Directory.xlsx');
    setShowExportModal(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        Error loading officers: {error}
      </div>
    );
  }

  return (
    <div className="table-responsive-wrapper" style={{ minHeight: '400px' }}>
      
      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: 12, top: 10 }} />
            <input 
              type="text" 
              placeholder="Search by Name, ID, or District..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px', margin: 0 }}
            />
          </div>
          <select 
            className="form-select" 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            style={{ width: '200px', height: '38px', margin: 0 }}
          >
            <option value="ALL">All Categories</option>
            <option value="FIELD_VRO">Village Revenue Officers</option>
            <option value="TAHSILDAR_MRO">Mandal Revenue Officers</option>
            <option value="RDO_OFFICER">Revenue Div. Officers</option>
            <option value="DISTRICT_COLLECTOR">District Collectors</option>
          </select>
        </div>
        <button className="gov-nav-btn login-btn" style={{ height: '38px', padding: '0 16px' }} onClick={() => setShowExportModal(true)}>
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>
      </div>

      {filteredOfficers.length === 0 ? (
        <EmptyState
          title="No Officers Found"
          description="Try adjusting your search or filters, or provision a new officer."
          icon={Users}
        />
      ) : (
        <table className="gov-data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                Officer Name <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th>Designation & Role</th>
              <th onClick={() => toggleSort('districtId')} style={{ cursor: 'pointer' }}>
                Working Place <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th>Contact Info</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfficers.map(officer => {
              const loginId = (officer as any).loginId || officer.officerId;
              return (
                <tr key={officer.officerId}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{officer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{loginId}</div>
                  </td>
                  <td>
                    <div>{officer.designation}</div>
                    <span className="case-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155', marginTop: 4 }}>
                      {officer.roleId.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div>District LGD: {officer.districtId}</div>
                    {(officer as any).mandalId && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Mandal: {(officer as any).mandalId}</div>}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div>{officer.officialEmail}</div>
                    <div style={{ color: '#64748b' }}>{officer.officialMobile}</div>
                  </td>
                  <td>
                    <span className="case-badge" style={{ 
                      backgroundColor: officer.accountStatus === 'ACTIVE' ? '#dcfce7' : '#fee2e2', 
                      color: officer.accountStatus === 'ACTIVE' ? '#166534' : '#991b1b' 
                    }}>
                      {officer.accountStatus}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/officers/${officer.officerId}`} className="gov-nav-btn login-btn" style={{ padding: '4px 12px', fontSize: '0.8rem', minHeight: 'auto' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>Excel Export Options</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.keys(exportCols).map((col) => (
                <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={(exportCols as any)[col]} 
                    onChange={(e) => setExportCols({ ...exportCols, [col]: e.target.checked })} 
                  />
                  {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowExportModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleExport} className="gov-nav-btn login-btn" style={{ padding: '8px 16px', minHeight: 'auto' }}>Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
