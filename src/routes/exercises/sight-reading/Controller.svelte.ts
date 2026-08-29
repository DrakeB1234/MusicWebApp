import { MusicStaff } from "vector-score";
import { StaffTypeNoteRanges, StaffTypeSpacing, type ConfigOptions, type NoteRange, type StaffSpacing } from "./helpers";
import type { GeneralNote } from "$lib/helpers/musicTheoryTypes";
import { convertNoteNameToMidi, convertNoteNameToObj, getFullNoteNameFromObj, stepNoteName } from "$lib/helpers/musicTheory";
import { sfxAudioService } from "$lib/audio/sfxAudioService.svelte";
import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
import { naturalNoteNames } from "$lib/helpers/musicTheoryConstants";

type ExerciseState = "idle" | "playing" | "finished";

export class Controller {
  status: ExerciseState = $state("idle");
  currentMessage = $state("Click start to begin!");

  wrongAnswers = $state(0);
  correctAnswers = $state(0);
  timer = $state(0);

  private config: ConfigOptions;
  private staffInstance: MusicStaff | null = null;
  private staffTypeSpacing: StaffSpacing;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private currentQuestionNoteObj: GeneralNote | null = null;

  private notePool: GeneralNote[] = [];

  constructor(config: ConfigOptions) {
    this.config = config;
    this.staffTypeSpacing = StaffTypeSpacing[config.clef];
    this.timer = config.timer;

    this.notePool = this.buildNotePool();
  }

  // Used for random choosing of notes that are pre set to match within config range
  // Builds all combinations of notes + accidentals, according to config options
  private buildNotePool(): GeneralNote[] {
    const lowRangeNoteObj = convertNoteNameToObj(this.config.noteRange.low);
    const highRangeNoteObj = convertNoteNameToObj(this.config.noteRange.high);

    const lowIdx = naturalNoteNames.findIndex(e => e === lowRangeNoteObj.letter);
    const highIdx = naturalNoteNames.findIndex(e => e === highRangeNoteObj.letter);

    const rangeLetterDiff = highIdx - lowIdx;
    const rangeOctaveDiff = highRangeNoteObj.octave! - lowRangeNoteObj.octave!;
    const totalSteps = (rangeOctaveDiff * 7) + rangeLetterDiff;
    const accidentalsToApply = this.config.allowedAccidentals.map(acc =>
      acc === "n" ? "" : acc
    );

    let accumulatedNotes: GeneralNote[] = [];
    let currentNoteString = `${lowRangeNoteObj.letter}${lowRangeNoteObj.octave}`;

    for (let i = 0; i <= totalSteps; i++) {
      const currentObj = convertNoteNameToObj(currentNoteString);

      for (const acc of accidentalsToApply) {
        const spelledNote = `${currentObj.letter}${acc}${currentObj.octave}`;
        accumulatedNotes.push(convertNoteNameToObj(spelledNote));
      }

      // 4. Step up alphabetically to the next natural note for the next iteration
      currentNoteString = stepNoteName(currentNoteString, 1);
    }

    return accumulatedNotes;
  }

  private generateQuestion() {
    if (this.notePool.length === 0) return;

    let randomNote = this.notePool[Math.floor(Math.random() * this.notePool.length)];

    // Loop random note generation until the new note doesn't match the current note (last answered)
    while (
      this.notePool.length > 1 &&
      this.currentQuestionNoteObj &&
      getFullNoteNameFromObj(this.currentQuestionNoteObj) === getFullNoteNameFromObj(randomNote)
    ) {
      randomNote = this.notePool[Math.floor(Math.random() * this.notePool.length)];
    }

    this.currentQuestionNoteObj = randomNote;

    if (!this.staffInstance) return;
    this.staffInstance.changeNoteByIndex(getFullNoteNameFromObj(randomNote), 0);
  }

  private handleTimeOut() {
    this.status = "finished";
    this.currentMessage = "Exercise Over!"
  }

  setupVectorScoreStaff = (staffContainerElement: HTMLDivElement) => {
    this.staffInstance = new MusicStaff(staffContainerElement, {
      staffType: this.config.clef,
      staffColor: 'var(--color-on-bg-surface)',
      staffBackgroundColor: 'var(--color-bg-surface-1)',
      width: 200,
      noteStartX: 60,
      scale: 1.2,
      spaceAbove: this.staffTypeSpacing.above,
      spaceBelow: this.staffTypeSpacing.below
    });

    this.staffInstance.drawNote("C4");
  }

  start() {
    if (this.status !== "idle") return;

    this.status = "playing";
    this.currentMessage = "";

    this.generateQuestion();

    this.timerInterval = setInterval(() => {
      this.timer--;

      if (this.timer < 1) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer = 0;
        this.handleTimeOut();
      }
    }, 1000);
  }

  handleInput(note: string) {
    if (this.status !== "playing" || !this.currentQuestionNoteObj) return;
    const parsedNote = convertNoteNameToObj(note);
    const currentQuestion = this.currentQuestionNoteObj;

    if (parsedNote.letter === currentQuestion.letter && parsedNote.accidental === currentQuestion.accidental) {
      this.correctAnswers++;
      pianoAudioService.playNote(currentQuestion, "med");
    } else {
      this.wrongAnswers++;
      sfxAudioService.play("wrong_guess");
    }

    this.generateQuestion();
  }

  handleMidiInput(note: string) {
    if (this.status !== "playing" || !this.currentQuestionNoteObj) return;
    const parsedNote = convertNoteNameToObj(note);
    const currentQuestion = this.currentQuestionNoteObj;

    if (parsedNote.letter === currentQuestion.letter && parsedNote.accidental === currentQuestion.accidental && parsedNote.octave === currentQuestion.octave) {
      this.correctAnswers++;
      pianoAudioService.playNote(currentQuestion, "med");
    } else {
      this.wrongAnswers++;
      sfxAudioService.play("wrong_guess");
    }

    this.generateQuestion();
  }

  destroy() {
    this.staffInstance = null;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}