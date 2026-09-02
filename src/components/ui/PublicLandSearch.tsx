'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchPublicStates,
  fetchPublicDistricts,
  fetchPublicRevenueDivisions,
  fetchPublicMandals,
  fetchPublicSachivalayams,
  searchPublicSurveyNumbers,
  requestPublicRecordOtp,
  verifyPublicRecordOtp,
  fetchPublicLandRecords,
  PublicSearchResultRecord
} from '@/services/landRecordSearchService';
import { APP_CONFIG } from '@/config/appConfig';
import {
  MapPin,
  Search,
  Phone,
  ShieldCheck,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  ChevronRight,
  Home
} from 'lucide-react';

type SearchStep = 'LOCATION' | 'SURVEY' | 'MOBILE' | 'OTP' | 'RECORDS';

export const PublicLandSearch: React.FC = () => {
  // Step State
  const [currentStep, setCurrentStep] = useState<SearchStep>('LOCATION');

  // Step 1: Location Selections
  const [stateCode, setStateCode] = useState(APP_CONFIG.activeStateCode);
  const [districtCode, setDistrictCode] = useState(APP_CONFIG.activeDistrictCode);
  const [divisionCode, setDivisionCode] = useState('');
  const [mandalCode, setMandalCode] = useState('');
  const [sachivalayamCode, setSachivalayamCode] = useState('');

  // Dropdown Lists
  const [statesList, setStatesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [divisionsList, setDivisionsList] = useState<any[]>([]);
  const [mandalsList, setMandalsList] = useState<any[]>([]);
  const [sachivalayamsList, setSachivalayamsList] = useState<any[]>([]);

  // Step 2: Survey Number Selection
  const [surveyQuery, setSurveyQuery] = useState('');
  const [debouncedSurveyQuery, setDebouncedSurveyQuery] = useState('');
  const [availableSurveys, setAvailableSurveys] = useState<string[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState('');

  // Step 3: Registered Mobile Verification
  const [mobileNumber, setMobileNumber] = useState('');

  // Step 4: OTP Verification
  const [otpSessionId, setOtpSessionId] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Step 5: Matching Records Result
  const [matchingRecords, setMatchingRecords] = useState<PublicSearchResultRecord[]>([]);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<PublicSearchResultRecord | null>(null);

  // Load Administrative Data Cascades
  useEffect(() => {
    fetchPublicStates().then(setStatesList);
  }, []);

  useEffect(() => {
    if (stateCode) {
      fetchPublicDistricts(stateCode).then(list => {
        setDistrictsList(list);
        if (list.length > 0 && !districtCode) {
          setDistrictCode(list[0].district_code);
        }
      });
    } else {
      setDistrictsList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateCode]);

  useEffect(() => {
    if (districtCode) {
      fetchPublicRevenueDivisions(districtCode).then(setDivisionsList);
    } else {
      setDivisionsList([]);
    }
    setDivisionCode('');
    setMandalCode('');
    setSachivalayamCode('');
  }, [districtCode]);

  useEffect(() => {
    if (divisionCode) {
      fetchPublicMandals(divisionCode).then(setMandalsList);
    } else {
      setMandalsList([]);
    }
    setMandalCode('');
    setSachivalayamCode('');
  }, [divisionCode]);

  useEffect(() => {
    if (mandalCode) {
      fetchPublicSachivalayams(mandalCode).then(setSachivalayamsList);
    } else {
      setSachivalayamsList([]);
    }
    setSachivalayamCode('');
  }, [mandalCode]);

  // Load Survey Numbers when Sachivalayam Changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSurveyQuery(surveyQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [surveyQuery]);

  useEffect(() => {
    if (sachivalayamCode) {
      searchPublicSurveyNumbers(sachivalayamCode, debouncedSurveyQuery).then(setAvailableSurveys);
    } else {
      setAvailableSurveys([]);
    }
  }, [sachivalayamCode, debouncedSurveyQuery]);

  // Handle OTP Inputs
  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`public-otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`public-otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Workflow Action Handlers
  const handleContinueToSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sachivalayamCode) return;
    setCurrentStep('SURVEY');
  };

  const handleExecuteSearch = async () => {
    if (!selectedSurvey) return;
    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `/api/public/land-records?districtId=${districtCode}&mandalId=${mandalCode}&villageId=${sachivalayamCode}&surveyNumber=${selectedSurvey}`
      );
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve digitized land records.');
      }

      setMatchingRecords(data.records || []);
      setCurrentStep('RECORDS');
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search operation failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetSearch = () => {
    setCurrentStep('LOCATION');
    setStateCode(APP_CONFIG.activeStateCode);
    setDistrictCode(APP_CONFIG.activeDistrictCode);
    setDivisionCode('');
    setMandalCode('');
    setSachivalayamCode('');
    setSelectedSurvey('');
    setSurveyQuery('');
    setSearchError(null);
    setSearchLoading(false);
    setMatchingRecords([]);
    setSelectedRecordDetail(null);
  };

  const selectedSachivalayamObj = sachivalayamsList.find(s => s.sachivalayam_code === sachivalayamCode);
  const selectedMandalObj = mandalsList.find(m => m.subdistrict_code === mandalCode);
  const selectedDivisionObj = divisionsList.find(d => d.division_code === divisionCode);

  return (
    <div className="public-land-search-card">
      {/* Header Banner */}
      <div className="public-search-header">
        <h1 className="public-search-title">DIGITAL LAND RECORD SEARCH</h1>
        <div className="public-search-subtitle">Access Your Digitized Land Records</div>
        <p className="public-search-description">
          Select your location and verify your registered mobile number to access land records associated with your jurisdiction.
        </p>
      </div>

      {/* Progressive Stepper Bar */}
      <div className="public-search-stepper">
        <div className={`stepper-item ${currentStep === 'LOCATION' ? 'active' : ''} ${['SURVEY', 'RECORDS'].includes(currentStep) ? 'completed' : ''}`}>
          <span className="stepper-badge">1</span>
          <span className="stepper-label">LOCATION</span>
        </div>
        <div className="stepper-line" />
        <div className={`stepper-item ${currentStep === 'SURVEY' ? 'active' : ''} ${['RECORDS'].includes(currentStep) ? 'completed' : ''}`}>
          <span className="stepper-badge">2</span>
          <span className="stepper-label">SURVEY</span>
        </div>
        <div className="stepper-line" />
        <div className={`stepper-item ${currentStep === 'RECORDS' ? 'active' : ''}`}>
          <span className="stepper-badge">3</span>
          <span className="stepper-label">RECORDS</span>
        </div>
      </div>

      {/* STEP 1: LOCATION DISCOVERY */}
      {currentStep === 'LOCATION' && (
        <form onSubmit={handleContinueToSurvey} className="public-step-form">
          <div className="public-form-grid">
            {/* State */}
            <div className="form-field-group">
              <label htmlFor="public-select-state" className="form-label font-bold">State</label>
              <select
                id="public-select-state"
                className="form-select"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
              >
                {statesList.map(s => (
                  <option key={s.state_code} value={s.state_code}>{s.name} ({s.display_code || s.short_code})</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="form-field-group">
              <label htmlFor="public-select-district" className="form-label font-bold">District</label>
              <select
                id="public-select-district"
                className="form-select"
                value={districtCode}
                disabled={!stateCode}
                onChange={(e) => setDistrictCode(e.target.value)}
              >
                <option value="">{stateCode ? 'Select District...' : 'Select a state first.'}</option>
                {districtsList.map(d => (
                  <option key={d.district_code} value={d.district_code}>{d.name} (LGD: {d.district_code})</option>
                ))}
              </select>
            </div>

            {/* Revenue Division */}
            <div className="form-field-group">
              <label htmlFor="public-select-division" className="form-label font-bold">Revenue Division</label>
              <select
                id="public-select-division"
                className="form-select"
                value={divisionCode}
                disabled={!districtCode}
                onChange={(e) => setDivisionCode(e.target.value)}
              >
                <option value="">{districtCode ? 'Select Revenue Division...' : 'Select a district first.'}</option>
                {divisionsList.map(r => (
                  <option key={r.division_code} value={r.division_code}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Mandal / Taluk */}
            <div className="form-field-group">
              <label htmlFor="public-select-mandal" className="form-label font-bold">Mandal</label>
              <select
                id="public-select-mandal"
                className="form-select"
                value={mandalCode}
                disabled={!divisionCode}
                onChange={(e) => setMandalCode(e.target.value)}
              >
                <option value="">{divisionCode ? 'Select Mandal...' : 'Select a revenue division first.'}</option>
                {mandalsList.map(m => (
                  <option key={m.subdistrict_code} value={m.subdistrict_code}>{m.name} ({m.type})</option>
                ))}
              </select>
            </div>

            {/* Village / Sachivalayam */}
            <div className="form-field-group">
              <label htmlFor="public-select-sachivalayam" className="form-label font-bold">Village / Sachivalayam</label>
              <select
                id="public-select-sachivalayam"
                className="form-select"
                value={sachivalayamCode}
                disabled={!mandalCode}
                onChange={(e) => setSachivalayamCode(e.target.value)}
              >
                <option value="">{mandalCode ? 'Select Sachivalayam...' : 'Select a mandal first.'}</option>
                {sachivalayamsList.map(s => (
                  <option key={s.sachivalayam_code} value={s.sachivalayam_code}>{s.name} ({s.area_type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="step-action-bar">
            <button
              type="submit"
              className="gov-nav-btn login-btn"
              disabled={!sachivalayamCode}
            >
              <span>Continue to Survey Selection</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: SURVEY NUMBER SELECTION */}
      {currentStep === 'SURVEY' && (
        <div className="public-step-form">
          <div className="jurisdiction-summary-box">
            <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
            <div className="summary-text-row">
              <strong>{selectedSachivalayamObj?.name || 'Selected Sachivalayam'}</strong>
              <span className="summary-sep">•</span>
              <span>{selectedMandalObj?.name || 'Mandal'}</span>
              <span className="summary-sep">•</span>
              <span>{selectedDivisionObj?.name || 'Division'}</span>
            </div>
          </div>

          <div className="form-field-group margin-top-md">
            <label htmlFor="survey-search-input" className="form-label font-bold">Search Survey Number</label>
            <div className="search-input-group">
              <Search className="w-4 h-4 search-input-icon" />
              <input
                id="survey-search-input"
                type="text"
                className="form-input search-input-field"
                placeholder="Type survey number e.g. 101, 102/1..."
                value={surveyQuery}
                onChange={(e) => setSurveyQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="survey-numbers-selection-box">
            {availableSurveys.length === 0 ? (
              <div className="empty-panel-state">
                <AlertCircle className="w-5 h-5 text-amber" />
                <span>No survey numbers available for the selected jurisdiction.</span>
              </div>
            ) : (
              <div className="survey-chips-grid">
                {availableSurveys.map((surv) => (
                  <button
                    key={surv}
                    type="button"
                    className={`survey-chip-btn ${selectedSurvey === surv ? 'active' : ''}`}
                    onClick={() => setSelectedSurvey(surv)}
                  >
                    Survey No. {surv}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSurvey && (
            <div className="selected-survey-badge-box">
              <CheckCircle2 className="w-4 h-4 text-green" />
              <span>Selected Survey Number: <strong>{selectedSurvey}</strong></span>
            </div>
          )}

          <div style={{ minHeight: '48px', marginTop: '16px' }}>
            {searchError && (
              <div className="otp-error-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" style={{ color: '#dc2626' }} />
                <span style={{ color: '#991b1b' }}>{searchError}</span>
              </div>
            )}
          </div>

          <div className="step-action-bar split">
            <button
              type="button"
              className="gov-nav-btn secondary-btn"
              disabled={searchLoading}
              onClick={() => setCurrentStep('LOCATION')}
            >
              <span>Back to Location</span>
            </button>
            <button
              type="button"
              className="gov-nav-btn login-btn"
              disabled={!selectedSurvey || searchLoading}
              onClick={handleExecuteSearch}
            >
              <span>{searchLoading ? 'Searching...' : 'Search Digitized Records'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MATCHING LAND RECORDS LIST */}
      {currentStep === 'RECORDS' && (
        <div className="public-step-form">
          <div className="records-result-header">
            <div>
              <h2 className="result-section-title">YOUR DIGITIZED LAND RECORDS</h2>
              <span className="result-section-subtitle">
                Official digitized records found for Survey No: {selectedSurvey}
              </span>
            </div>
            <button
              type="button"
              className="gov-nav-btn secondary-btn"
              onClick={handleResetSearch}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Search</span>
            </button>
          </div>

          <div className="table-responsive-wrapper margin-top-md">
            <table className="officer-records-table">
              <thead>
                <tr>
                  <th>Survey No.</th>
                  <th>Sub-Division</th>
                  <th>Extent (Acres)</th>
                  <th>Record Type</th>
                  <th>Digitization Status</th>
                  <th>Verification Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {matchingRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td><code className="text-navy font-bold">{rec.surveyNumber}</code></td>
                    <td>{rec.subdivisionNumber}</td>
                    <td>{rec.extentAcres} Acres</td>
                    <td>{rec.recordType}</td>
                    <td>
                      <span className="status-badge-tag digitized">
                        {rec.digitizationStatus}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge-tag verified">
                        {rec.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="officer-header-btn"
                        onClick={() => setSelectedRecordDetail(rec)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Record</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD DETAIL INSPECTION MODAL */}
      {selectedRecordDetail && (
        <div className="modal-backdrop-overlay">
          <div className="modal-content-container">
            <div className="modal-header-bar">
              <div>
                <h3 className="modal-title">DIGITIZED LAND RECORD REFERENCE</h3>
                <span className="text-xs text-muted">Reference ID: {selectedRecordDetail.id}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedRecordDetail(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="record-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Survey Number / Sub-Division</span>
                  <strong className="detail-value">{selectedRecordDetail.surveyNumber} / {selectedRecordDetail.subdivisionNumber}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Extent (Land Area)</span>
                  <strong className="detail-value">{selectedRecordDetail.extentAcres} Acres</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Land Classification</span>
                  <strong className="detail-value">{selectedRecordDetail.landType}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Jurisdiction</span>
                  <strong className="detail-value">{selectedRecordDetail.villageName}, {selectedRecordDetail.mandalName}, {selectedRecordDetail.districtName}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Record Type Family</span>
                  <strong className="detail-value">{selectedRecordDetail.recordType}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Digitization Status</span>
                  <span className="status-badge-tag digitized">{selectedRecordDetail.digitizationStatus}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Verification Status</span>
                  <span className="status-badge-tag verified">{selectedRecordDetail.verificationStatus}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Source Record Reference</span>
                  <span className="text-xs font-mono">{selectedRecordDetail.sourceRecordReference}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
