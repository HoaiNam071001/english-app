import { VocabFieldsConfig } from "@/types";

export interface IVocabFieldsConfigService {
  getConfig(): Promise<VocabFieldsConfig>;
  setConfig(config: VocabFieldsConfig): Promise<void>;
}
