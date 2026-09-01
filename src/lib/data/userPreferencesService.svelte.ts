import { browser } from "$app/environment";
import { Howler } from "howler";
import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "ToneTools_UserSettings";

type UserSettings = {
  masterVolume: number;
  pianoVolume: number;
  sfxVolume: number;
};

const DEFAULT_SETTINGS: UserSettings = {
  masterVolume: 80,
  pianoVolume: 80,
  sfxVolume: 80,
};

function loadInitial(): UserSettings {
  const stored = readStorage<Partial<UserSettings>>(STORAGE_KEY, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

class UserPreferencesService {
  private settings = $state<UserSettings>(loadInitial());

  constructor() {
    if (browser) {
      Howler.volume(this.settings.masterVolume / 100);
    }
  }

  get masterVolume() { return this.settings.masterVolume; }
  get pianoVolume() { return this.settings.pianoVolume; }
  get sfxVolume() { return this.settings.sfxVolume; }

  private persist() {
    writeStorage(STORAGE_KEY, this.settings);
  }

  setMasterVolume(val: number) {
    this.settings.masterVolume = Math.max(0, Math.min(100, val));
    this.persist();
  }

  setPianoVolume(val: number) {
    this.settings.pianoVolume = Math.max(0, Math.min(100, val));
    this.persist();
  }

  setSfxVolume(val: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(100, val));
    this.persist();
  }

  resetVolumeDefault() {
    this.settings.masterVolume = DEFAULT_SETTINGS.masterVolume;
    this.settings.pianoVolume = DEFAULT_SETTINGS.pianoVolume;
    this.settings.sfxVolume = DEFAULT_SETTINGS.sfxVolume;
    this.persist();
  }
}

export const userPreferencesService = new UserPreferencesService();