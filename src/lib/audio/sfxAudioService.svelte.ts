import { userPreferencesService } from '$lib/data/userPreferencesService.svelte';
import { Howl } from 'howler';

export const MIN_BPM = 40;
export const MAX_BPM = 240;

const SFX_MAP = {
  kick: [0, 200],
  clave_1: [200, 150],
  clave_2: [350, 150],
  woodblock_1: [500, 200],
  woodblock_2: [700, 200],
  hat_1: [900, 150],
  hat_2: [1050, 400],
  correct_guess: [1450, 500],
  wrong_guess: [1950, 400],
} satisfies Record<string, [number, number]>;

export type SfxSoundName = keyof typeof SFX_MAP;

export const SFX_PERCUSSION_NAMES = Object.keys(SFX_MAP).filter(e => {
  if (e === "correct_guess" || e === "wrong_guess") return null;
  return e;
}) as SfxSoundName[];

const percussionLabelBySoundName = {
  kick: "Kick",
  clave_1: "Clave 1",
  clave_2: "Clave 2",
  woodblock_1: "Woodblock 1",
  woodblock_2: "Woodblock 2",
  hat_1: "Hat 1",
  hat_2: "Hat 2",
} satisfies Partial<Record<SfxSoundName, string>>;

export type PercussionSoundName = keyof typeof percussionLabelBySoundName;

export const SFX_PERCUSSION_OPTIONS = Object.entries(percussionLabelBySoundName).map(
  ([value, label]) => ({ value: value as PercussionSoundName, label }),
);

class SfxAudioService {
  isReady = $state(false);

  private sound: Howl | null = null;

  init() {
    if (this.sound) return;

    this.sound = new Howl({
      src: ['/audio/SFXSprite.mp3'],
      sprite: SFX_MAP,
      volume: userPreferencesService.sfxVolume / 100,
      onload: () => {
        this.isReady = true;
      }
    });
  }

  get volumeValue(): number {
    return userPreferencesService.pianoVolume;
  }

  changeVolume(value: number) {
    const newValue = Math.max(0, Math.min(100, value));
    this.sound?.volume(newValue / 100);
  }

  play(id: SfxSoundName) {
    if (!this.sound) return;

    this.sound.play(id);
  }
}

export const sfxAudioService = new SfxAudioService();