import { userPreferencesService } from '$lib/data/userPreferencesService.svelte';
import { convertNoteNameToMidi, getFullNoteNameFromObj } from '$lib/helpers/musicTheory';
import type { GeneralNote } from '$lib/helpers/musicTheoryTypes';
import { Howl, Howler } from 'howler';

const SPRITE_MAP_MIDI = [
  { name: 'C1', val: 24 },
  { name: 'G1', val: 31 },
  { name: 'C2', val: 36 },
  { name: 'G2', val: 43 },
  { name: 'C3', val: 48 },
  { name: 'G3', val: 55 },
  { name: 'C4', val: 60 },
  { name: 'G4', val: 67 },
  { name: 'C5', val: 72 },
  { name: 'G5', val: 79 },
  { name: 'C6', val: 84 },
  { name: 'G6', val: 91 },
  { name: 'C7', val: 96 },
  { name: 'G7', val: 103 },
  { name: 'C8', val: 108 }
];

const SPRITE_MAP: Record<string, [number, number]> = {
  C1: [0, 3000], G1: [3000, 3000],
  C2: [6000, 3000], G2: [9000, 3000],
  C3: [12000, 3000], G3: [15000, 3000],
  C4: [18000, 3000], G4: [21000, 3000],
  C5: [24000, 3000], G5: [27000, 3000],
  C6: [30000, 3000], G6: [33000, 3000],
  C7: [36000, 3000], G7: [39000, 3000],
  C8: [42000, 3000],
};

type sustainFadeMsTypes = "high" | "med" | "low";

const SUSTAIN_FADE_MS_MAP: Record<sustainFadeMsTypes, number> = {
  high: 3000,
  med: 800,
  low: 500
};

const MIN_OCTAVE = 0;
const MAX_OCTAVE = 8;
const MIN_PLAYABLE_MIDI = 21;
const MAX_PLAYABLE_MIDI = 108;

class PianoAudioService {
  private sound: Howl | null = null;
  private isReady = $state(false);
  private isLoading = $state(false);

  error = $state<string | null>(null);

  async init() {
    if (this.sound || this.isLoading) return;
    this.isLoading = true;

    return new Promise<void>((resolve, reject) => {
      this.sound = new Howl({
        src: ['/audio/PianoSprite.mp3'],
        sprite: SPRITE_MAP,
        volume: userPreferencesService.pianoVolume / 100,
        onload: () => {
          this.isReady = true;
          this.isLoading = false;
          resolve();
        },
        onloaderror: (id, err) => {
          this.isLoading = false;
          this.error = "Failed to load audio.";
          console.error("Audio Load Error", err);
          reject(err);
        }
      });
    });
  }

  private calculateStrategy(midiNum: number) {

    const bestAnchor = SPRITE_MAP_MIDI.reduce((prev, curr) => {
      return (Math.abs(curr.val - midiNum) < Math.abs(prev.val - midiNum)
        ? curr
        : prev);
    });

    const semitoneShift = midiNum - bestAnchor.val;

    return {
      sampleName: bestAnchor.name,
      semitoneShift
    };
  }

  get volumeValue(): number {
    return userPreferencesService.pianoVolume;
  }

  changeVolume(value: number) {
    const newValue = Math.max(0, Math.min(100, value));
    this.sound?.volume(newValue / 100);
  }

  playNote(note: GeneralNote, sustainType: sustainFadeMsTypes = "high") {
    if (!this.isReady || !this.sound) {
      console.warn("Audio requested, but pianoAudioService was never initialized.");
      return;
    }

    const fullNoteName = getFullNoteNameFromObj(note);

    if (note.octave === null || note.octave < MIN_OCTAVE || note.octave > MAX_OCTAVE) {
      console.warn(`Invalid octave for note: '${fullNoteName}'`);
      return;
    }

    let noteMidi = convertNoteNameToMidi(fullNoteName);
    if (noteMidi === null || noteMidi < MIN_PLAYABLE_MIDI || noteMidi > MAX_PLAYABLE_MIDI) {
      console.warn(`Invalid MIDI value for note: '${fullNoteName}'`);
      return;
    }

    const strategy = this.calculateStrategy(noteMidi);
    if (!strategy) return;

    const noteSoundId = this.sound.play(strategy.sampleName);

    const rate = Math.pow(2, strategy.semitoneShift / 12);
    this.sound.rate(rate, noteSoundId);

    if (sustainType !== "high") {
      this.sound.fade(1.0, 0, SUSTAIN_FADE_MS_MAP[sustainType], noteSoundId);
    }
  }

  playChord(notes: GeneralNote[], sustainType: sustainFadeMsTypes = "high") {
    if (!this.isReady || !this.sound) return;

    notes.forEach(note => {
      this.playNote(note, sustainType);
    });
  }
}

export const pianoAudioService = new PianoAudioService();