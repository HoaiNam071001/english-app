// src/services/settings/guest.adapter.ts
import { STORAGE_KEY } from "@/constants";
import { ISettingsService } from "./types";

export class GuestSettingsService implements ISettingsService {
  async getShortcutOverrides(): Promise<Record<string, string>> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY.SHORTCUT_OVERRIDES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  async setShortcutOverrides(overrides: Record<string, string>): Promise<void> {
    try {
      localStorage.setItem(
        STORAGE_KEY.SHORTCUT_OVERRIDES,
        JSON.stringify(overrides)
      );
    } catch {
      // ignore
    }
  }
}
