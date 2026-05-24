import { ParsedKeymap, PracticeMode } from "../types";

const keymapKey = "zmk-typing-game:keymap";
const settingsKey = "zmk-typing-game:settings";

export type SavedSettings = {
  baseLayerName?: string;
  mode?: PracticeMode;
};

export function saveParsedKeymap(parsed: ParsedKeymap): void {
  localStorage.setItem(keymapKey, JSON.stringify(parsed));
}

export function loadParsedKeymap(): ParsedKeymap | undefined {
  const raw = localStorage.getItem(keymapKey);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as ParsedKeymap;
  } catch {
    return undefined;
  }
}

export function saveSettings(settings: SavedSettings): void {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export function loadSettings(): SavedSettings {
  const raw = localStorage.getItem(settingsKey);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SavedSettings;
  } catch {
    return {};
  }
}
