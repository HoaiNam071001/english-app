// src/services/settings/firebase.adapter.ts
import { db } from "@/firebaseConfig";
import { DataTable } from "@/types";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ISettingsService } from "./types";

export class FirebaseSettingsService implements ISettingsService {
  constructor(private userId: string) {}

  async getShortcutOverrides(): Promise<Record<string, string>> {
    const snap = await getDoc(doc(db, DataTable.UserSettings, this.userId));
    if (!snap.exists()) return {};
    return (snap.data().shortcutOverrides as Record<string, string>) || {};
  }

  async setShortcutOverrides(overrides: Record<string, string>): Promise<void> {
    await setDoc(
      doc(db, DataTable.UserSettings, this.userId),
      { shortcutOverrides: overrides, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }
}
