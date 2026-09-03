import { LandRecordDataProvider, ProviderStatus, ProviderType, ExternalQueryInput } from '../integrationTypes';

export class DILRMPProvider implements LandRecordDataProvider {
  public providerId = 'PROV-DILRMP-01';
  public providerName = 'Digital India Land Records Modernization Programme (DILRMP Adapter)';
  public providerType: ProviderType = 'DILRMP';
  public version = 'v1.4.0';

  public async healthCheck(): Promise<ProviderStatus> {
    const baseUrl = process.env.DILRMP_API_BASE_URL;
    if (!baseUrl) {
      return 'UNAVAILABLE';
    }
    try {
      const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
      if (res.ok) return 'CONNECTED';
      if (res.status === 401 || res.status === 403) return 'AUTH_REQUIRED';
      return 'ERROR';
    } catch {
      return 'UNAVAILABLE';
    }
  }

  public async queryRecord(input: ExternalQueryInput) {
    const status = await this.healthCheck();
    const queriedAt = new Date().toISOString();

    if (status === 'UNAVAILABLE' || status === 'CONFIGURATION_MISSING') {
      return {
        providerId: this.providerId,
        status: 'UNAVAILABLE' as ProviderStatus,
        matchedRecords: [],
        rawMetadata: { reason: 'DILRMP national portal endpoint unconfigured in environment (DILRMP_API_BASE_URL missing).' },
        queriedAt,
      };
    }

    try {
      const baseUrl = process.env.DILRMP_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/v1/cadastral/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DILRMP_API_KEY || ''}`,
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        return {
          providerId: this.providerId,
          status: 'ERROR' as ProviderStatus,
          matchedRecords: [],
          rawMetadata: { httpCode: res.status },
          queriedAt,
        };
      }

      const data = await res.json();
      return {
        providerId: this.providerId,
        status: 'CONNECTED' as ProviderStatus,
        matchedRecords: data.parcels || [],
        rawMetadata: { dilrmpQueryRef: data.referenceId },
        queriedAt,
      };
    } catch (err: any) {
      return {
        providerId: this.providerId,
        status: 'ERROR' as ProviderStatus,
        matchedRecords: [],
        rawMetadata: { error: err.message },
        queriedAt,
      };
    }
  }
}
