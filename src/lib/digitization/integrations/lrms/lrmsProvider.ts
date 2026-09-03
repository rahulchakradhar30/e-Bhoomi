import { LandRecordDataProvider, ProviderStatus, ProviderType, ExternalQueryInput } from '../integrationTypes';

export class LRMSProvider implements LandRecordDataProvider {
  public providerId = 'PROV-LRMS-01';
  public providerName = 'Andhra Pradesh LRMS (MeeBhoomi Adapter)';
  public providerType: ProviderType = 'LRMS';
  public version = 'v2.1.0';

  public async healthCheck(): Promise<ProviderStatus> {
    const baseUrl = process.env.LRMS_API_BASE_URL;
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
        rawMetadata: { reason: 'LRMS live endpoint unconfigured in current environment (LRMS_API_BASE_URL missing).' },
        queriedAt,
      };
    }

    // Live endpoint execution path if configured
    try {
      const baseUrl = process.env.LRMS_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/v1/land-records/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LRMS_API_KEY || ''}`,
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
        matchedRecords: data.records || [],
        rawMetadata: { queryId: data.queryId },
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
