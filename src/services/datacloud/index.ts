import type { CustomerProfile, ChatSummary } from '@/types/customer';

class DataCloudService {
  async getCustomerProfile(merkuryId: string): Promise<CustomerProfile> {
    console.log('[datacloud] Fetching profile for', merkuryId);
    throw new Error('Data Cloud not configured — using mock data');
  }
}

class DataCloudWriteService {
  async writeChatSummary(customerId: string, sessionId: string, summary: ChatSummary): Promise<void> {
    console.log('[datacloud] Writing chat summary for', customerId, sessionId);
    // In production, POST to Data Cloud ingestion API
  }
}

let readInstance: DataCloudService | null = null;
let writeInstance: DataCloudWriteService | null = null;

export function getDataCloudService(): DataCloudService {
  if (!readInstance) readInstance = new DataCloudService();
  return readInstance;
}

export function getDataCloudWriteService(): DataCloudWriteService {
  if (!writeInstance) writeInstance = new DataCloudWriteService();
  return writeInstance;
}
