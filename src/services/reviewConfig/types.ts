import { ReviewConfig } from "@/types";

export interface IReviewConfigService {
  getConfig(): Promise<ReviewConfig>;
  setConfig(config: ReviewConfig): Promise<void>;
}
