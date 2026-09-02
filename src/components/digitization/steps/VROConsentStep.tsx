'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { ShieldCheck, CheckSquare, AlertTriangle, Languages } from 'lucide-react';
import { VROConsentRecord } from '@/types/digitizationCase';

interface VROConsentStepProps {
  initialData?: VROConsentRecord;
  onConsentAccepted: (consentRecord: VROConsentRecord) => void;
  officerId?: string;
  officerRole?: string;
}

export const VROConsentStep: React.FC<VROConsentStepProps> = ({
  initialData,
  onConsentAccepted,
  officerId = 'AP-545-VRO-00101',
  officerRole = 'FIELD_VRO',
}) => {
  const [language, setLanguage] = useState<'en' | 'te'>(initialData?.consentLanguage || 'en');
  const [chkPhysical, setChkPhysical] = useState(initialData?.physicallyVerifiedDeclaration || false);
  const [chkAiReview, setChkAiReview] = useState(initialData?.aiReviewUnderstandingDeclaration || false);
  const [chkResponsibility, setChkResponsibility] = useState(initialData?.officerResponsibilityDeclaration || false);

  const isConsentValid = chkPhysical && chkAiReview && chkResponsibility;

  const handleContinue = () => {
    if (!isConsentValid) return;

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
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Language Selector */}
      <div className="bg-white border border-gov-border rounded-md p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-navy-900 text-amber-400 rounded-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-navy-900 text-base uppercase tracking-wide">
              OFFICER MANDATORY PHYSICAL VERIFICATION & LEGAL CONSENT
            </h3>
            <p className="text-xs text-slate-600">
              Phase 1 of e-BHOOMI Controlled Land Record Digitization Architecture
            </p>
          </div>
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md border border-slate-300">
          <Languages className="w-4 h-4 text-navy-800 ml-1.5" />
          <span className="text-xs font-semibold text-slate-700 mr-1">Consent Language:</span>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              language === 'en'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            English Only
          </button>
          <button
            type="button"
            onClick={() => setLanguage('te')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              language === 'te'
                ? 'bg-navy-900 text-amber-300 shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            English + తెలుగు Paired
          </button>
        </div>
      </div>

      <WorkspacePanel
        title="SECTION 1: PHYSICAL DOCUMENT VERIFICATION DECLARATION"
        guidance="Read and confirm physical inspection of official land records prior to uploading into e-BHOOMI."
      >
        <div className="space-y-4 text-sm text-slate-800 leading-relaxed font-sans">
          {/* Sentence 1 */}
          <div className="p-3 bg-slate-50 border-l-4 border-navy-800 rounded-r">
            <p className="font-medium text-navy-900">
              1. The Village Revenue Officer (VRO) confirms that the physical land documents received by them have been personally checked and verified in person before initiating digitized submission.
            </p>
            {language === 'te' && (
              <p className="mt-1.5 text-xs text-slate-700 font-serif bg-amber-50/70 p-2 rounded border border-amber-200">
                1. డిజిటలైజేషన్ సమర్పణను ప్రారంభించే ముందు తమకు అందిన భౌతిక భూమి రికార్డు పత్రాలను స్వయంగా పరిశీలించి మరియు సరిచూసుకున్నానని విలేజ్ రెవెన్యూ ఆఫీసర్ (VRO) ధృవీకరిస్తున్నారు.
              </p>
            )}
          </div>

          {/* Sentence 2 */}
          <div className="p-3 bg-slate-50 border-l-4 border-navy-800 rounded-r">
            <p className="font-medium text-navy-900">
              2. Supported physical document categories include Adangal, RoR-1B / Record of Rights, Mutation / Name Transfer Records, Partition / Succession Records, Pattadar Passbook / Title Deed, and Legacy Revenue Records.
            </p>
            {language === 'te' && (
              <p className="mt-1.5 text-xs text-slate-700 font-serif bg-amber-50/70 p-2 rounded border border-amber-200">
                2. అనుమతించబడిన భౌతిక పత్రాల రకాల్లో అడంగల్, ఆర్.ఓ.ఆర్-1బి / హక్కుల రికార్డు, మ్యూటేషన్ / పేరుమార్పు రికార్డులు, విభజన / వారసత్వ రికార్డులు, పట్టాదారు పాస్‌బుక్ / టైటిల్ డీడ్ మరియు పాత రెవెన్యూ రికార్డులు ఉంటాయి.
              </p>
            )}
          </div>

          {/* Sentence 3 */}
          <div className="p-3 bg-amber-50/80 border-l-4 border-amber-600 rounded-r">
            <p className="font-bold text-navy-900">
              3. "I confirm that the document being uploaded has been physically verified by me and that I am responsible for submitting the correct document for digitization."
            </p>
            {language === 'te' && (
              <p className="mt-1.5 text-xs text-slate-800 font-serif bg-amber-100/80 p-2 rounded border border-amber-300">
                3. "అప్‌లోడ్ చేయబడుతున్న పత్రం నాచే భౌతికంగా తనిఖీ చేయబడిందని మరియు డిజిటలైజేషన్ కోసం సరైన పత్రాన్ని సమర్పించే బాధ్యత నాదేనని నేను ధృవీకరిస్తున్నాను."
              </p>
            )}
          </div>

          {/* Sentence 4 */}
          <div className="p-3 bg-slate-50 border-l-4 border-navy-800 rounded-r">
            <p className="font-medium text-navy-900">
              4. Responsibility Declaration: The authorized officer accepts full official responsibility for the authenticity and physical verification of submitted records, and for approving all extracted land information in the workflow.
            </p>
            {language === 'te' && (
              <p className="mt-1.5 text-xs text-slate-700 font-serif bg-amber-50/70 p-2 rounded border border-amber-200">
                4. బాధ్యతా ప్రకటన: సమర్పించిన రికార్డుల నిజాయితీ మరియు భౌతిక తనిఖీకి, వర్క్‌ఫ్లోలో ఆమోదించే ప్రతి సమాచారానికి అధికారిక బాధ్యతను సంబంధిత అధికారి స్వీకరిస్తారు.
              </p>
            )}
          </div>

          {/* Sentence 5 */}
          <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r text-xs text-blue-900">
            <p className="font-semibold">
              5. Assistive AI Principle: AI processing functions strictly as an assistive tool for document extraction. AI does NOT independently make legal conclusions or finalize land ownership. The human officer remains the final decision maker.
            </p>
            {language === 'te' && (
              <p className="mt-1.5 text-xs text-blue-950 font-serif bg-white p-2 rounded border border-blue-200">
                5. సహాయక AI సూత్రం: AI ప్రాసెసింగ్ పత్రాల సమాచారాన్ని మాత్రమే వెలికితీస్తుంది. AI స్వతంత్రంగా ఎటువంటి చట్టపరమైన తీర్మానాలు లేదా హక్కులను ఖరారు చేయదు. అధికారి మాత్రమే నిర్ణయాధికారిగా ఉంటారు.
              </p>
            )}
          </div>
        </div>

        {/* Mandatory Checkboxes */}
        <div className="mt-6 border-t border-slate-200 pt-6 space-y-4">
          <h4 className="font-bold text-navy-900 text-xs tracking-wider uppercase flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-navy-700" />
            MANDATORY LEGAL ACKNOWLEDGMENT CHECKBOXES (ALL REQUIRED)
          </h4>

          {/* Checkbox 1 */}
          <label className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
            chkPhysical ? 'bg-navy-50/60 border-navy-600' : 'bg-white border-slate-300 hover:bg-slate-50'
          }`}>
            <input
              type="checkbox"
              checked={chkPhysical}
              onChange={(e) => setChkPhysical(e.target.checked)}
              className="mt-1 w-4 h-4 text-navy-800 rounded border-slate-400 focus:ring-navy-800"
            />
            <div className="text-xs">
              <span className="font-bold text-navy-900 block">
                [✓] Physical Verification Confirmation
              </span>
              <span className="text-slate-700">
                I confirm that I have physically inspected and verified the physical paper document prior to uploading into e-BHOOMI.
              </span>
              {language === 'te' && (
                <span className="block text-slate-600 font-serif mt-0.5">
                  నేను ఇ-భూమిలో అప్‌లోడ్ చేయడానికి ముందు భౌతిక కాగితపు పత్రాన్ని తనిఖీ చేసి ధృవీకరించానని నిర్ధారిస్తున్నాను.
                </span>
              )}
            </div>
          </label>

          {/* Checkbox 2 */}
          <label className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
            chkAiReview ? 'bg-navy-50/60 border-navy-600' : 'bg-white border-slate-300 hover:bg-slate-50'
          }`}>
            <input
              type="checkbox"
              checked={chkAiReview}
              onChange={(e) => setChkAiReview(e.target.checked)}
              className="mt-1 w-4 h-4 text-navy-800 rounded border-slate-400 focus:ring-navy-800"
            />
            <div className="text-xs">
              <span className="font-bold text-navy-900 block">
                [✓] Assistive AI & Human Verification Duty
              </span>
              <span className="text-slate-700">
                I understand that AI-extracted information must be meticulously reviewed, checked against the original document, and corrected by me.
              </span>
              {language === 'te' && (
                <span className="block text-slate-600 font-serif mt-0.5">
                  AI వెలికితీసిన సమాచారాన్ని అసలు పత్రంతో క్షుణ్ణంగా సరిచూసి, అవసరమైన సవరణలు చేసే బాధ్యత నాదేనని నేను అర్థం చేసుకున్నాను.
                </span>
              )}
            </div>
          </label>

          {/* Checkbox 3 */}
          <label className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
            chkResponsibility ? 'bg-navy-50/60 border-navy-600' : 'bg-white border-slate-300 hover:bg-slate-50'
          }`}>
            <input
              type="checkbox"
              checked={chkResponsibility}
              onChange={(e) => setChkResponsibility(e.target.checked)}
              className="mt-1 w-4 h-4 text-navy-800 rounded border-slate-400 focus:ring-navy-800"
            />
            <div className="text-xs">
              <span className="font-bold text-navy-900 block">
                [✓] Official Responsibility Acceptance
              </span>
              <span className="text-slate-700">
                I accept full official responsibility for the authenticity of the physical record and the data I approve for final digitization.
              </span>
              {language === 'te' && (
                <span className="block text-slate-600 font-serif mt-0.5">
                  భౌతిక రికార్డు నిజాయితీకి మరియు నేను ఆమోదించే డేటాకు పూర్తి అధికారిక బాధ్యతను నేను స్వీకరిస్తున్నాను.
                </span>
              )}
            </div>
          </label>
        </div>

        {/* Action button container inside step panel */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Officer ID: <span className="font-bold text-navy-900">{officerId}</span> ({officerRole})
          </div>

          <button
            type="button"
            disabled={!isConsentValid}
            onClick={handleContinue}
            className={`px-6 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isConsentValid
                ? 'bg-navy-900 hover:bg-navy-800 text-amber-300 shadow-md cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <span>Confirm & Continue to Document Selection</span>
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </WorkspacePanel>
    </div>
  );
};
