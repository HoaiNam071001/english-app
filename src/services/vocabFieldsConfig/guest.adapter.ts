import { STORAGE_KEY } from "@/constants";
import { DEFAULT_VOCAB_FIELDS_CONFIG, VocabFieldsConfig } from "@/types";
import { IVocabFieldsConfigService } from "./types";

export class GuestVocabFieldsConfigService
  implements IVocabFieldsConfigService
{
  async getConfig(): Promise<VocabFieldsConfig> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY.VOCAB_FIELDS_CONFIG);
      if (!raw) return DEFAULT_VOCAB_FIELDS_CONFIG;
      return { ...DEFAULT_VOCAB_FIELDS_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_VOCAB_FIELDS_CONFIG;
    }
  }

  async setConfig(config: VocabFieldsConfig): Promise<void> {
    try {
      localStorage.setItem(
        STORAGE_KEY.VOCAB_FIELDS_CONFIG,
        JSON.stringify(config),
      );
    } catch {
      // ignore
    }
  }
}
