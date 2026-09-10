import { db } from "@/firebaseConfig";
import { DataTable, mergeReviewConfig, ReviewConfig } from "@/types";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { IReviewConfigService } from "./types";

export class FirebaseReviewConfigService implements IReviewConfigService {
  constructor(private userId: string) {}

  async getConfig(): Promise<ReviewConfig> {
    const snap = await getDoc(doc(db, DataTable.ReviewConfig, this.userId));
    if (!snap.exists()) return mergeReviewConfig();
    return mergeReviewConfig(snap.data() as Partial<ReviewConfig>);
  }

  async setConfig(config: ReviewConfig): Promise<void> {
    await setDoc(
      doc(db, DataTable.ReviewConfig, this.userId),
      { ...config, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
}
