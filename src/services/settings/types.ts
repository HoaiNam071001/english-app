// src/services/settings/types.ts
export interface UserSettings {
  shortcutOverrides: Record<string, string>;
}

export interface ISettingsService {
  getShortcutOverrides(): Promise<Record<string, string>>;
  setShortcutOverrides(overrides: Record<string, string>): Promise<void>;
}
