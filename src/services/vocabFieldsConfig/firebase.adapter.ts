import { db } from "@/firebaseConfig";
import { DataTable, DEFAULT_VOCAB_FIELDS_CONFIG, VocabFieldsConfig } from "@/types";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { IVocabFieldsConfigService } from "./types";

export class FirebaseVocabFieldsConfigService
  implements IVocabFieldsConfigService
{
  constructor(private userId: string) {}

  async getConfig(): Promise<VocabFieldsConfig> {
    const snap = await getDoc(
      doc(db, DataTable.VocabFieldsConfig, this.userId),
    );
    if (!snap.exists()) return DEFAULT_VOCAB_FIELDS_CONFIG;
    return {
      ...DEFAULT_VOCAB_FIELDS_CONFIG,
      ...(snap.data() as Partial<VocabFieldsConfig>),
    };
  }

  async setConfig(config: VocabFieldsConfig): Promise<void> {
    await setDoc(
      doc(db, DataTable.VocabFieldsConfig, this.userId),
      { ...config, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
}
