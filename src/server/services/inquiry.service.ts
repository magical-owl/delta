import { InquiryInput, InquiryRecord } from "@/lib/validation/inquiry.schema";

export interface InquirySummaryDTO {
  totalInquiries: number;
  categories: Record<string, number>;
  latestTimestamp: string | null;
}

/**
 * In-memory repository adapter ensuring domain business logic is decoupled
 * from physical persistence engines (databases/ORMs) until requirements warrant them.
 */
class InMemoryInquiryRepository {
  private records: InquiryRecord[] = [];

  async save(record: InquiryRecord): Promise<InquiryRecord> {
    this.records.push(record);
    return record;
  }

  async listAll(): Promise<InquiryRecord[]> {
    return [...this.records];
  }

  async clear(): Promise<void> {
    this.records = [];
  }
}

export const inquiryRepository = new InMemoryInquiryRepository();

/**
 * Domain Service: Handles inquiry intake, business priority computation,
 * and summary analytics.
 */
export class InquiryService {
  constructor(private repo: InMemoryInquiryRepository = inquiryRepository) {}

  /**
   * Computes business priority rating:
   * Security & Architecture inquiries with high urgency receive highest rating.
   */
  calculatePriorityScore(input: InquiryInput): number {
    let score = 10;
    if (input.category === "security") score += 40;
    if (input.category === "architecture") score += 30;
    if (input.category === "technical") score += 20;

    if (input.urgency === "high") score += 50;
    if (input.urgency === "medium") score += 25;

    return score;
  }

  async createInquiry(input: InquiryInput): Promise<InquiryRecord> {
    const record: InquiryRecord = {
      ...input,
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "received",
    };

    return this.repo.save(record);
  }

  async getSummary(): Promise<InquirySummaryDTO> {
    const all = await this.repo.listAll();
    const categories: Record<string, number> = {
      general: 0,
      technical: 0,
      security: 0,
      architecture: 0,
    };

    let latestTimestamp: string | null = null;
    for (const item of all) {
      categories[item.category] = (categories[item.category] ?? 0) + 1;
      if (!latestTimestamp || item.createdAt > latestTimestamp) {
        latestTimestamp = item.createdAt;
      }
    }

    return {
      totalInquiries: all.length,
      categories,
      latestTimestamp,
    };
  }
}

export const inquiryService = new InquiryService();
