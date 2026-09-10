import { STORAGE_KEY } from "@/constants";
import { mergeReviewConfig, ReviewConfig } from "@/types";
import { IReviewConfigService } from "./types";

export class GuestReviewConfigService implements IReviewConfigService {
  async getConfig(): Promise<ReviewConfig> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY.REVIEW_CONFIG);
      if (!raw) return mergeReviewConfig();
      return mergeReviewConfig(JSON.parse(raw));
    } catch {
      return mergeReviewConfig();
    }
  }

  async setConfig(config: ReviewConfig): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY.REVIEW_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }
  }
}
