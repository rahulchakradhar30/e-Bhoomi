export type KYCStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'UNAVAILABLE';

export interface KYCResult {
  status: KYCStatus;
  providerName: string;
  referenceId?: string;
  verifiedAt?: string;
  message: string;
}

export interface KYCProvider {
  checkStatus(landOwnerAadhaarOrId?: string): Promise<KYCResult>;
}

export class DefaultKYCProvider implements KYCProvider {
  async checkStatus(landOwnerAadhaarOrId?: string): Promise<KYCResult> {
    if (!landOwnerAadhaarOrId) {
      return {
        status: 'UNAVAILABLE',
        providerName: 'State e-Gov Security KYC Gateway',
        message: 'Aadhaar / Citizen ID not attached for automated KYC lookup.',
      };
    }

    // In a real government deployment, this connects to authorized UIDAI e-KYC service.
    // We do NOT simulate fake OTP calls.
    return {
      status: 'UNAVAILABLE',
      providerName: 'State e-Gov Security KYC Gateway',
      message: 'KYC integration requires authorized UIDAI service connection.',
    };
  }
}
