import { LandRecordDataProvider, ProviderStatus, ProviderType, ExternalQueryInput } from '../integrationTypes';

export class LocalTestRecordProvider implements LandRecordDataProvider {
  public providerId = 'PROV-TEST-LOCAL';
  public providerName = 'Local Land Record Test Harness Provider';
  public providerType: ProviderType = 'TEST_PROVIDER';
  public version = 'v1.0.0';

  private mockDatabase: Record<string, any>[] = [
    {
      recordId: 'REC-KURNOOL-142',
      districtName: 'Kurnool',
      mandalName: 'Adoni',
      villageName: 'Arjanapalle',
      surveyNumber: '142',
      subDivisionNumber: '3A',
      khataNumber: '482',
      ownerName: 'కె. రామారావు',
      extentAcres: '2.45',
      landClassification: 'Wet (పల్లం)',
    },
    {
      recordId: 'REC-KURNOOL-208',
      districtName: 'Kurnool',
      mandalName: 'Gooty',
      villageName: 'Gooty',
      surveyNumber: '208',
      subDivisionNumber: '1B',
      khataNumber: '912',
      ownerName: 'వై. వెంకటేశ్వర్లు',
      extentAcres: '4.10',
      landClassification: 'Dry (మెట్ట)',
    },
    {
      recordId: 'REC-CONFLICT-OWNER',
      districtName: 'Kurnool',
      mandalName: 'Adoni',
      villageName: 'Arjanapalle',
      surveyNumber: '142',
      subDivisionNumber: '3A',
      khataNumber: '482',
      ownerName: 'Different Owner Name',
      extentAcres: '2.45',
    },
    {
      recordId: 'REC-CONFLICT-EXTENT',
      districtName: 'Kurnool',
      mandalName: 'Adoni',
      villageName: 'Arjanapalle',
      surveyNumber: '142',
      subDivisionNumber: '3A',
      khataNumber: '482',
      ownerName: 'కె. రామారావు',
      extentAcres: '5.50',
    },
  ];

  public async healthCheck(): Promise<ProviderStatus> {
    return 'TEST_MODE';
  }

  public async queryRecord(input: ExternalQueryInput) {
    const queriedAt = new Date().toISOString();
    const sNum = input.surveyNumber ? String(input.surveyNumber).trim() : null;
    const kNum = input.khataNumber ? String(input.khataNumber).trim() : null;

    const matches = this.mockDatabase.filter((rec) => {
      if (sNum && rec.surveyNumber === sNum) return true;
      if (kNum && rec.khataNumber === kNum) return true;
      return false;
    });

    return {
      providerId: this.providerId,
      status: 'TEST_MODE' as ProviderStatus,
      matchedRecords: matches,
      rawMetadata: { isTestFixture: true, totalFixtureRecords: this.mockDatabase.length },
      queriedAt,
    };
  }
}
