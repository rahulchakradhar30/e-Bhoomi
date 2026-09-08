'use client';

import React, { useEffect, useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { ShieldCheck, CheckSquare, Languages, FileText } from 'lucide-react';
import { VROConsentRecord } from '@/types/digitizationCase';

interface VROConsentStepProps {
  initialData?: VROConsentRecord;
  onConsentAccepted: (consentRecord: VROConsentRecord) => void;
  onValidityChange?: (isValid: boolean) => void;
  officerId?: string;
  officerRole?: string;
}

export const VROConsentStep: React.FC<VROConsentStepProps> = ({
  initialData,
  onConsentAccepted,
  onValidityChange,
  officerId = 'AP-545-VRO-00101',
  officerRole = 'FIELD_VRO',
}) => {
  const [language, setLanguage] = useState<'en' | 'te'>(initialData?.consentLanguage || 'en');
  const [chkPhysical, setChkPhysical] = useState(initialData?.physicallyVerifiedDeclaration || false);
  const [chkAiReview, setChkAiReview] = useState(initialData?.aiReviewUnderstandingDeclaration || false);
  const [chkResponsibility, setChkResponsibility] = useState(initialData?.officerResponsibilityDeclaration || false);

  const isConsentValid = chkPhysical && chkAiReview && chkResponsibility;

  useEffect(() => {
    onValidityChange?.(isConsentValid);

    if (isConsentValid) {
      const consentRecord: VROConsentRecord = {
        consentVersion: '2.0-LEGAL',
        consentLanguage: language,
        consentAccepted: true,
        acceptedByOfficerId: officerId,
        acceptedByOfficerRole: officerRole,
        acceptedAt: new Date().toISOString(),
        physicallyVerifiedDeclaration: chkPhysical,
        aiReviewUnderstandingDeclaration: chkAiReview,
        officerResponsibilityDeclaration: chkResponsibility,
      };
      onConsentAccepted(consentRecord);
    }
  }, [chkPhysical, chkAiReview, chkResponsibility, language]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Language Selector Toolbar */}
      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck className="w-5 h-5 text-navy-900" />
          <span style={{ fontWeight: 800, color: '#0b2545', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Declaration Language Mode
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <Languages className="w-4 h-4 text-navy-800" style={{ marginLeft: '4px' }} />
          <button
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: language === 'en' ? '#0b2545' : 'transparent',
              color: language === 'en' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            English Only
          </button>
          <button
            type="button"
            onClick={() => setLanguage('te')}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: language === 'te' ? '#0b2545' : 'transparent',
              color: language === 'te' ? '#fbbf24' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            English + తెలుగు Paired
          </button>
        </div>
      </div>

      <WorkspacePanel
        title="PHYSICAL DOCUMENT VERIFICATION DECLARATIONS"
        guidance="Read each paired legal sentence and confirm physical document inspection prior to uploading into e-BHOOMI."
      >
        <div className="digi-decl-list">
          {/* Sentence 1 */}
          <div className="digi-decl-card">
            <p className="digi-decl-text-en">
              1. The Village Revenue Officer (VRO) confirms that the physical land documents received by them have been personally checked and verified in person before initiating digitized submission.
            </p>
            {language === 'te' && (
              <p className="digi-decl-text-te">
                1. డిజిటలైజేషన్ సమర్పణను ప్రారంభించే ముందు తమకు అందిన భౌతిక భూమి రికార్డు పత్రాలను స్వయంగా పరిశీలించి మరియు సరిచూసుకున్నానని విలేజ్ రెవెన్యూ ఆఫీసర్ (VRO) ధృవీకరిస్తున్నారు.
              </p>
            )}
          </div>

          {/* Sentence 2 */}
          <div className="digi-decl-card">
            <p className="digi-decl-text-en">
              2. Supported physical document categories include Adangal, RoR-1B / Record of Rights, Mutation / Name Transfer Records, Partition / Succession Records, Pattadar Passbook / Title Deed, and Legacy Revenue Records.
            </p>
            {language === 'te' && (
              <p className="digi-decl-text-te">
                2. అనుమతించబడిన భౌతిక పత్రాల రకాల్లో అడంగల్, ఆర్.ఓ.ఆర్-1బి / హక్కుల రికార్డు, మ్యూటేషన్ / పేరుమార్పు రికార్డులు, విభజన / వారసత్వ రికార్డులు, పట్టాదారు పాస్‌బుక్ / టైటిల్ డీడ్ మరియు పాత రెవెన్యూ రికార్డులు ఉంటాయి.
              </p>
            )}
          </div>

          {/* Sentence 3 */}
          <div className="digi-decl-card gold-accent">
            <p className="digi-decl-text-en" style={{ color: '#854d0e' }}>
              3. "I confirm that the document being uploaded has been physically verified by me and that I am responsible for submitting the correct document for digitization."
            </p>
            {language === 'te' && (
              <p className="digi-decl-text-te" style={{ background: '#fef9c3', borderColor: '#fde047' }}>
                3. "అప్‌లోడ్ చేయబడుతున్న పత్రం నాచే భౌతికంగా తనిఖీ చేయబడిందని మరియు డిజిటలైజేషన్ కోసం సరైన పత్రాన్ని సమర్పించే బాధ్యత నాదేనని నేను ధృవీకరిస్తున్నాను."
              </p>
            )}
          </div>

          {/* Sentence 4 */}
          <div className="digi-decl-card">
            <p className="digi-decl-text-en">
              4. Responsibility Declaration: The authorized officer accepts full official responsibility for the authenticity and physical verification of submitted records, and for approving all extracted land information in the workflow.
            </p>
            {language === 'te' && (
              <p className="digi-decl-text-te">
                4. బాధ్యతా ప్రకటన: సమర్పించిన రికార్డుల నిజాయితీ మరియు భౌతిక తనిఖీకి, వర్క్‌ఫ్లోలో ఆమోదించే ప్రతి సమాచారానికి అధికారిక బాధ్యతను సంబంధిత అధికారి స్వీకరిస్తారు.
              </p>
            )}
          </div>

          {/* Sentence 5 */}
          <div className="digi-decl-card blue-accent">
            <p className="digi-decl-text-en" style={{ color: '#1e40af' }}>
              5. Assistive AI Principle: AI processing functions strictly as an assistive tool for document extraction. AI does NOT independently make legal conclusions or finalize land ownership. The human officer remains the final decision maker.
            </p>
            {language === 'te' && (
              <p className="digi-decl-text-te" style={{ background: '#dbeafe', borderColor: '#bfdbfe' }}>
                5. సహాయక AI సూత్రం: AI ప్రాసెసింగ్ పత్రాల సమాచారాన్ని మాత్రమే వెలికితీస్తుంది. AI స్వతంత్రంగా ఎటువంటి చట్టపరమైన తీర్మానాలు లేదా హక్కులను ఖరారు చేయదు. అధికారి మాత్రమే నిర్ణయాధికారిగా ఉంటారు.
              </p>
            )}
          </div>
        </div>

        {/* Mandatory Checkboxes */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0b2545', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <CheckSquare className="w-4 h-4 text-navy-700" />
            MANDATORY LEGAL ACKNOWLEDGMENT CHECKBOXES (ALL REQUIRED)
          </h4>

          {/* Checkbox 1 */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '6px',
            border: `1px solid ${chkPhysical ? '#0b2545' : '#cbd5e1'}`,
            background: chkPhysical ? '#f8fafc' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            <input
              type="checkbox"
              checked={chkPhysical}
              onChange={(e) => setChkPhysical(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#0b2545' }}
            />
            <div style={{ fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 800, color: '#0b2545', display: 'block' }}>
                Physical Verification Confirmation
              </span>
              <span style={{ color: '#334155' }}>
                I confirm that I have physically inspected and verified the physical paper document prior to uploading into e-BHOOMI.
              </span>
              {language === 'te' && (
                <span style={{ display: 'block', color: '#64748b', fontFamily: "'Noto Sans Telugu', serif", marginTop: '2px' }}>
                  నేను ఇ-భూమిలో అప్‌లోడ్ చేయడానికి ముందు భౌతిక కాగితపు పత్రాన్ని తనిఖీ చేసి ధృవీకరించానని నిర్ధారిస్తున్నాను.
                </span>
              )}
            </div>
          </label>

          {/* Checkbox 2 */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '6px',
            border: `1px solid ${chkAiReview ? '#0b2545' : '#cbd5e1'}`,
            background: chkAiReview ? '#f8fafc' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            <input
              type="checkbox"
              checked={chkAiReview}
              onChange={(e) => setChkAiReview(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#0b2545' }}
            />
            <div style={{ fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 800, color: '#0b2545', display: 'block' }}>
                Assistive AI & Human Verification Duty
              </span>
              <span style={{ color: '#334155' }}>
                I understand that AI-extracted information must be meticulously reviewed, checked against the original document, and corrected by me.
              </span>
              {language === 'te' && (
                <span style={{ display: 'block', color: '#64748b', fontFamily: "'Noto Sans Telugu', serif", marginTop: '2px' }}>
                  AI వెలికితీసిన సమాచారాన్ని అసలు పత్రంతో క్షుణ్ణంగా సరిచూసి, అవసరమైన సవరణలు చేసే బాధ్యత నాదేనని నేను అర్థం చేసుకున్నాను.
                </span>
              )}
            </div>
          </label>

          {/* Checkbox 3 */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '6px',
            border: `1px solid ${chkResponsibility ? '#0b2545' : '#cbd5e1'}`,
            background: chkResponsibility ? '#f8fafc' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            <input
              type="checkbox"
              checked={chkResponsibility}
              onChange={(e) => setChkResponsibility(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#0b2545' }}
            />
            <div style={{ fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 800, color: '#0b2545', display: 'block' }}>
                Official Responsibility Acceptance
              </span>
              <span style={{ color: '#334155' }}>
                I accept full official responsibility for the authenticity of the physical record and the data I approve for final digitization.
              </span>
              {language === 'te' && (
                <span style={{ display: 'block', color: '#64748b', fontFamily: "'Noto Sans Telugu', serif", marginTop: '2px' }}>
                  భౌతిక రికార్డు నిజాయితీకి మరియు నేను ఆమోదించే డేటాకు పూర్తి అధికారిక బాధ్యతను నేను స్వీకరిస్తున్నాను.
                </span>
              )}
            </div>
          </label>
        </div>
      </WorkspacePanel>
    </div>
  );
};
