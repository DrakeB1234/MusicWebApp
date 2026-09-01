import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
import type { GeneralChord, GeneralNote } from "$lib/helpers/musicTheoryTypes";
import {
  applyBassNoteRange,
  applyMelodyNoteRange,
  applyVoicingToMelody,
  applyNoteShift,
  calculateDynamicRange,
  styleLibrary,
  transposeChordsByKey,
  type BassEvent,
  type MelodyEvent,
  type NoteRangeConfig,
  type ProgressionStep,
  type MusicStyle,
  resolveMelodyTones,
  applySmartOmission,
} from "./chordProgressionHelpers";
import { convertNoteNameToObj, detectChordsByNoteNames, getFullNoteNameFromObj, incrementNoteNameByInterval } from "$lib/helpers/musicTheory";
import { keyNamesFlatted } from "$lib/helpers/musicTheoryConstants";

export class ProgressionPlayer {
  progression: ProgressionStep[] = $state([]);
  bpm: number = $state(120);
  isPlaying: boolean = $state(false);
  currentProgressionIdx: number = $state(0);
  currentPlayedNotes: string[] = $state([]);
  currentPlayedChord: string | null = $state(null);
  autoMelodyChordInversions: boolean = $state(true);

  currentMasterStepNumber: number = $state(0);
  currentChordStepNumber: number = $state(0);

  globalKey: string = $state("C");
  currentStyleData: MusicStyle = $state(styleLibrary["basic-1"]);

  noteRangeConfig: NoteRangeConfig = $derived({
    melody: calculateDynamicRange(this.globalKey, this.currentStyleData.relativeNoteRanges.melody),
    bass: calculateDynamicRange(this.globalKey, this.currentStyleData.relativeNoteRanges.bass)
  });

  private audioContext: AudioContext | null = null;
  private timerID: ReturnType<typeof setTimeout> | null = null;
  private currentNextNoteTime = 0.0;
  // Used to ensure if fifth is specified in bass style step, but the root has not played yet, to flag resolveBassNotes
  private hasBassPlayedInCurrentChord = false;

  static readonly SCHEDULER_SLEEP_MS = 25.0;
  static readonly LOOKAHEAD_WINDOW_SECONDS = 0.05;
  static readonly SIXTEENTH_NOTES_IN_BEAT = 4;
  static readonly STANDARD_SWING_PERCENTAGE = 0.5;

  constructor() { }

  // === HELPERS ===

  // Exact seconds per 16th notes, dependent on BPM
  // 60.0 / this.bpm = quarter note in beat
  private get secondsPerStep() {
    return (60.0 / this.bpm) / ProgressionPlayer.SIXTEENTH_NOTES_IN_BEAT;
  }

  private validateBpmValue() {
    if (this.bpm < 40 || this.bpm > 240) this.bpm = 120;
  }

  // If swing is in music style data, stretches downbeats and compresses upbeats, mathematically
  // this is done by just multplying the normal 1:1 ratio of down/up beats by respective value of ratio
  // 1:1 = no change, 3:2 stretches downbeat by ~60% and upbeat by ~40%.
  // Down beats in standard 4/4 measure are (0, 4, 8, 12) in 16ths notes, (0, 2, 4, 6) in 8ths
  private getStepDuration(stepNumber: number): number {
    const baseStepTime = this.secondsPerStep;
    const swingRatio = this.currentStyleData.swingRatio || "1:1";
    const swingNoteValue = this.currentStyleData.swingRatioNoteValue || "16th";

    if (swingRatio === "1:1") return baseStepTime;

    let isStretchedStep = false;

    if (swingNoteValue === "16th") {
      isStretchedStep = stepNumber % 2 === 0;
    } else if (swingNoteValue === "8th") {
      isStretchedStep = (stepNumber % 4) < 2;
    }

    // 2:1 swingRatio -> downWeight: 2, upWeight: 1
    const [downWeight, upWeight] = swingRatio.split(":").map(Number);
    const totalWeight = downWeight + upWeight;

    // 2/3 down beat -> ~66%, 1/3 up beat -> ~33%
    const targetDownbeatPercentage = downWeight / totalWeight;
    const targetUpbeatPercentage = upWeight / totalWeight;

    // 66% down beat / 50% = ~1.3 multiplier
    const downMultiplier = targetDownbeatPercentage / ProgressionPlayer.STANDARD_SWING_PERCENTAGE;
    const upMultiplier = targetUpbeatPercentage / ProgressionPlayer.STANDARD_SWING_PERCENTAGE;

    return baseStepTime * (isStretchedStep ? downMultiplier : upMultiplier);
  }

  // Desinged to handle early chord changes (like in bossa nova style)
  // Max early chord change steps refers that a chord can ONLY change early if its 2 beats before next chord.
  private resolveTrackActiveChord(currentMasterStepNumber: number, currentTrackStepCount: number, trackEarlyChangeSteps?: number[]): GeneralChord | null {
    const currentProgressionStepObj = this.progression[this.currentProgressionIdx];
    if (!currentProgressionStepObj || !currentProgressionStepObj.chordInfo) return null;

    const currentChord = currentProgressionStepObj.chordInfo;
    const earlyChangeTriggers = trackEarlyChangeSteps || [];
    if (earlyChangeTriggers.length === 0) return currentChord;

    const totalStepsInChord = currentProgressionStepObj.beats * ProgressionPlayer.SIXTEENTH_NOTES_IN_BEAT;
    const stepsUntilNextChord = totalStepsInChord - this.currentChordStepNumber;
    const maxEarlyChordChangeSteps = 2 * ProgressionPlayer.SIXTEENTH_NOTES_IN_BEAT;
    if (stepsUntilNextChord > maxEarlyChordChangeSteps) return currentChord;

    const currentLocalStep = currentMasterStepNumber % currentTrackStepCount;

    for (let stepsLookedBack = 0; stepsLookedBack <= this.currentChordStepNumber; stepsLookedBack++) {
      const pastLocalStep = (currentLocalStep - stepsLookedBack + currentTrackStepCount) % currentTrackStepCount;

      if (earlyChangeTriggers.includes(pastLocalStep)) {

        const stepsRemainingWhenTriggered = stepsUntilNextChord + stepsLookedBack;

        if (stepsRemainingWhenTriggered <= maxEarlyChordChangeSteps) {
          const nextIdx = (this.currentProgressionIdx + 1) % this.progression.length;
          return this.progression[nextIdx].chordInfo;
        }

        break;
      }
    }

    return currentChord;
  }

  private resolveBassNotes(bassEvent: BassEvent, activeChord: GeneralChord): string[] {
    const rootPitchStr = activeChord.bass ? `${activeChord.bass}0` : `${activeChord.tonic}0`;
    const rangedRootStr = applyBassNoteRange(rootPitchStr, this.noteRangeConfig.bass);

    const notes = bassEvent.tones.map(bassTone => {
      let requestedTone = bassTone.tone;

      if (bassTone.notFirstInChord && !this.hasBassPlayedInCurrentChord) {
        requestedTone = "root";
      }

      let finalNote = requestedTone === "fifth"
        ? incrementNoteNameByInterval(rangedRootStr, "5P")
        : rangedRootStr;
      return applyNoteShift(finalNote, bassTone.noteShift);
    });

    this.hasBassPlayedInCurrentChord = true;
    return notes;
  }

  private resolveMelodyNotes(melodyEvent: MelodyEvent, activeChord: GeneralChord): string[] {
    let rawChordNoteStrings = activeChord.notes.map(n => getFullNoteNameFromObj(n));
    if (rawChordNoteStrings.length === 0) return [];

    rawChordNoteStrings = applySmartOmission(rawChordNoteStrings, this.currentStyleData.melodyTrack.toneCount);

    let finalChordNotes: string[];
    const trackVoiceLimit = this.currentStyleData.melodyTrack.toneCount;

    if (this.autoMelodyChordInversions) {
      const rangedNotes = applyMelodyNoteRange(rawChordNoteStrings, this.noteRangeConfig.melody, false);
      finalChordNotes = applyVoicingToMelody(rangedNotes);
    } else {
      // Move the whole chord into the box but preserve its original root-position shape
      finalChordNotes = applyMelodyNoteRange(
        rawChordNoteStrings,
        this.noteRangeConfig.melody,
        true,
        rawChordNoteStrings[0]
      );
    }

    // Designed to handle arpeggios of triads that request a tone higher than chord has (i.e. Dm: 4th tone doesn't exist)
    // Takes each note in existing chord and adds octave to it to make up for missing tones.
    // Dm: Requsted the 4 tone: result = D1, F2, A3, D4 (octave increased)
    let expandedChordNotes = [...finalChordNotes];
    if (melodyEvent.tones !== "block" && expandedChordNotes.length < trackVoiceLimit) {
      const originalLength = finalChordNotes.length;

      while (expandedChordNotes.length < trackVoiceLimit) {
        const baseNote = expandedChordNotes[expandedChordNotes.length - originalLength];
        expandedChordNotes.push(applyNoteShift(baseNote, { octave: 1 }));
      }
    }

    const requestedTones = resolveMelodyTones(
      melodyEvent.tones,
      finalChordNotes.length,
    );

    const selectedNoteStrings = requestedTones
      .filter(i => i < expandedChordNotes.length)
      .map(i => expandedChordNotes[i]);

    return selectedNoteStrings.map(n => applyNoteShift(n, melodyEvent.noteShift));
  }

  private scheduleChordPlayback(noteStrings: string[], sustainType: "low" | "med" | "high", delayInMs: number) {
    setTimeout(() => {
      pianoAudioService.playChord(noteStrings.map(e => convertNoteNameToObj(e)), sustainType);
    }, delayInMs);
  }

  // Gets the next note time to play, intially set by play() function, afterwards set by nextNote()
  // Style step number refers to music style chosen and the current value its at. Incremented by nextNote(), get remainder by the
  // current styles total step count (how large its looped section is, 16 = one measure of 16th notes) from each track.
  // Current played notes is used to update UI on the exact notes that both tracks MAY play (if an event is in current iteration).
  // Delay is for when note plays it plays after the scheduler, due to the scheduler tracking notes ahead of time.
  private scheduleNote() {
    const timeToPlay = this.currentNextNoteTime;
    this.currentPlayedNotes = [];

    const localMelodyStep = this.currentMasterStepNumber % this.currentStyleData.melodyTrack.stepCount;
    const localBassStep = this.currentMasterStepNumber % this.currentStyleData.bassTrack.stepCount;

    const melodyEvent = this.currentStyleData.melodyTrack.events.find(e => e.step === localMelodyStep);
    const bassEvent = this.currentStyleData.bassTrack.events.find(e => e.step === localBassStep);

    if (!melodyEvent && !bassEvent) return;
    if (!this.audioContext) return;

    const currentPlayedNoteStrings: string[] = [];

    const delayInSeconds = timeToPlay - this.audioContext.currentTime;
    const delayInMs = Math.max(0, delayInSeconds * 1000);

    if (bassEvent) {
      const sustainType = bassEvent.noteLength === "legato" ? "med" : "low";
      const activeBassChord = this.resolveTrackActiveChord(
        this.currentMasterStepNumber,
        this.currentStyleData.bassTrack.stepCount,
        this.currentStyleData.bassTrack.earlyChangeSteps
      );

      if (activeBassChord) {
        const bassNotes = this.resolveBassNotes(bassEvent, activeBassChord);
        this.scheduleChordPlayback(bassNotes, sustainType, delayInMs);
        currentPlayedNoteStrings.push(...bassNotes);
      }
    }

    if (melodyEvent) {
      const sustainType = melodyEvent.noteLength === "legato" ? "med" : "low";
      const activeMelodyChord = this.resolveTrackActiveChord(
        this.currentMasterStepNumber,
        this.currentStyleData.melodyTrack.stepCount,
        this.currentStyleData.melodyTrack.earlyChangeSteps
      );

      if (activeMelodyChord) {
        const melodyNotes = this.resolveMelodyNotes(melodyEvent, activeMelodyChord);
        this.scheduleChordPlayback(melodyNotes, sustainType, delayInMs);
        currentPlayedNoteStrings.push(...melodyNotes);

        const detectedChords = detectChordsByNoteNames(melodyNotes);
        const playedChord = detectedChords?.find(e => e.tonic === activeMelodyChord.tonic);
        this.currentPlayedChord = playedChord ? `${playedChord.tonic}${playedChord.symbol}` : null;
      }
    }

    // Update UI with played notes
    this.currentPlayedNotes = currentPlayedNoteStrings;
  }

  // Sets the next note time and increments counter variables
  // Current measure steps refers to the amount of notes in the current progression (if user inputs chord lasting 3 beats, then 12 sixteenth notes)
  // ProgressionIDX keeps track of the current progression player is on, however does not track for early chord changes if specified in music style.
  private nextNote() {
    this.validateBpmValue();

    this.currentNextNoteTime += this.getStepDuration(this.currentMasterStepNumber);
    this.currentMasterStepNumber++;
    this.currentChordStepNumber++;

    const currentChordTargetSteps = this.progression[this.currentProgressionIdx].beats * ProgressionPlayer.SIXTEENTH_NOTES_IN_BEAT;

    if (this.currentChordStepNumber >= currentChordTargetSteps) {
      this.hasBassPlayedInCurrentChord = false;
      this.currentChordStepNumber = 0;
      this.currentProgressionIdx++;

      if (this.currentProgressionIdx >= this.progression.length) {
        this.currentProgressionIdx = 0;
        this.currentMasterStepNumber = 0;
      }
    }
  }

  private scheduler() {
    if (!this.isPlaying || !this.audioContext) return;

    while (this.currentNextNoteTime < this.audioContext.currentTime + ProgressionPlayer.LOOKAHEAD_WINDOW_SECONDS) {
      this.scheduleNote();
      this.nextNote();
    }

    this.timerID = setTimeout(() => this.scheduler(), ProgressionPlayer.SCHEDULER_SLEEP_MS);
  }

  private resetPlaybackPosition() {
    this.currentProgressionIdx = 0;
    this.currentMasterStepNumber = 0;
    this.currentChordStepNumber = 0;
    this.hasBassPlayedInCurrentChord = false;
    this.currentPlayedNotes = [];
    this.currentPlayedChord = null;
  }

  // === PUBLIC METHODS ===

  play() {
    if (this.isPlaying) return;

    this.audioContext = Howler.ctx;

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.resetPlaybackPosition();
    this.currentNextNoteTime = this.audioContext.currentTime;
    this.isPlaying = true;

    this.scheduler();
  }

  forcePlayMelodyAtProgressionIdx(progressionIdx: number) {
    const progressionObj = this.progression[progressionIdx];
    if (!progressionObj || !progressionObj.chordInfo) return;
    const rawChordNoteStrings = progressionObj.chordInfo.notes.map(e => getFullNoteNameFromObj(e));
    let fixedNotes: string[] = [];

    if (this.autoMelodyChordInversions) {
      const rangedUpperNotes = applyMelodyNoteRange(rawChordNoteStrings, this.noteRangeConfig.melody, false);
      fixedNotes = applyVoicingToMelody(rangedUpperNotes);
    } else {
      fixedNotes = applyMelodyNoteRange(rawChordNoteStrings, this.noteRangeConfig.melody, true);
    }
    const fixedNoteObjs = fixedNotes.map(e => convertNoteNameToObj(e));

    pianoAudioService.playChord(fixedNoteObjs, "high");
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) clearTimeout(this.timerID);
    this.resetPlaybackPosition();
    Howler.stop();
  }

  togglePlay = () => {
    if (this.isPlaying) this.stop();
    else this.play();
  }

  // Function is designed to be called during component mount. Key is passed in for proper transposing
  // of chords when key is changed.
  initPlayer(styleId: string, key: string, progression: ProgressionStep[]) {
    this.progression = progression;
    this.currentProgressionIdx = 0;

    this.changeKey(key, false);

    this.changeStyleById(styleId);
  }

  changeStyleById(style: string) {
    const styleData = styleLibrary[style];
    if (!styleData || this.currentStyleData.id === style) return;
    this.stop();

    this.currentStyleData = styleData;
    this.bpm = styleData.startingBPM;
  }

  changeKey(newKey: string, autoTranposeChords: boolean = true) {
    if (!keyNamesFlatted.includes(newKey) || this.globalKey === newKey) return;
    this.stop();

    if (autoTranposeChords) {
      const tranposedChords = transposeChordsByKey(this.progression.map(e => e.chordInfo!), this.globalKey, newKey);

      this.progression = this.progression.map((e, idx) => {
        return {
          ...e,
          chordInfo: tranposedChords[idx]
        }
      })
    }

    this.globalKey = newKey;
  }
}