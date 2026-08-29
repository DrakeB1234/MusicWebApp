import { pianoAudioService } from "$lib/audio/pianoAudioService.svelte";
import { sfxAudioService } from "$lib/audio/sfxAudioService.svelte";
import { convertNoteNameToObj, decrementNoteNameByInterval, getFullNoteNameFromObj, incrementNoteNameByInterval } from "$lib/helpers/musicTheory";
import { naturalNoteNames } from "$lib/helpers/musicTheoryConstants";
import type { GeneralNote, IntervalEntry } from "$lib/helpers/musicTheoryTypes";
import { MusicStaff } from "vector-score";
import type { IntervalEarConfig } from "./intervalEarTrainingHelpers";
import { statsDataService, type IntervalEarTrainingStats } from "$lib/data/intervalEarTrainingDataService";

type ExerciseState = "idle" | "playing" | "answered" | "finished";

type CurrentQuestion = {
  rootNote: GeneralNote;
  intervalNote: GeneralNote;
  targetInterval: IntervalEntry;
  type: string;
  direction: string;
} | null;

export class IntervalEarTrainingController {
  selectedIntervals: IntervalEntry[] = $state([]);

  // State
  status: ExerciseState = $state("idle");
  currentQuestion: CurrentQuestion = null;

  correctGuessInterval = $state("");
  wrongGuessInterval = $state("");

  wrongAnswers = $state(0);
  correctAnswers = $state(0);
  questionNumber = $state(0);

  isNextQuestionDisabled = $derived(this.status !== "answered" && this.status !== "idle");
  isExerciseOver = $derived(this.status === "finished");

  currentMessage = $derived(this.getCurrentUIMessage(this.status));

  private config: IntervalEarConfig;
  private intervalAudioTimer: ReturnType<typeof setTimeout> | null = null;
  private staffInstance: MusicStaff | null = null;
  private sessionStats: IntervalEarTrainingStats = {};

  constructor(config: IntervalEarConfig) {
    this.config = config;
    this.selectedIntervals = config.selectedIntervals;
  }

  private generateNewQuestion() {
    if (this.status === "finished") return;

    this.questionNumber += 1;
    this.status = "playing";
    this.correctGuessInterval = "";
    this.wrongGuessInterval = "";

    const randomInterval = this.selectedIntervals[Math.floor(Math.random() * this.selectedIntervals.length)];
    const randomNoteLetter = naturalNoteNames[Math.floor(Math.random() * naturalNoteNames.length)];
    const randomOctave = this.config.octaveRangeLow +
      Math.floor(Math.random() * (this.config.octaveRangeHigh - this.config.octaveRangeLow + 1))

    const rootName = randomNoteLetter + randomOctave;
    const rootNoteObj = convertNoteNameToObj(rootName);

    const randomType = this.config.selectedTypes[Math.floor(Math.random() * this.config.selectedTypes.length)];
    const randomDirection = this.config.selectedDirections[Math.floor(Math.random() * this.config.selectedDirections.length)];

    const intervalNoteObj = this.getIntervalNoteByDirection(rootNoteObj, randomInterval.interval, randomDirection);

    this.currentQuestion = {
      rootNote: rootNoteObj,
      intervalNote: intervalNoteObj,
      targetInterval: randomInterval,
      type: randomType,
      direction: randomDirection
    };

    this.playInterval();

    // Reset notes that are drawn on staff
    this.clearVectorScoreNotes();
  }

  private handleInput(guessedInterval: string) {
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion || this.status !== "playing") return;
    const targetInterval = currentQuestion.targetInterval.interval;
    let localStat: IntervalEarTrainingStats = {
      [targetInterval]: {
        correct: 0,
        wrong: 0
      }
    };

    if (targetInterval === guessedInterval) {
      this.correctAnswers += 1;
      this.wrongGuessInterval = "";
      localStat[targetInterval].correct += 1;
      sfxAudioService.play("correct_guess");
    } else {
      this.wrongAnswers += 1;
      this.wrongGuessInterval = guessedInterval;
      localStat[targetInterval].wrong += 1;
      sfxAudioService.play("wrong_guess");
    }
    statsDataService.saveSessionStats(localStat);

    this.correctGuessInterval = currentQuestion!.targetInterval.interval;

    if (this.questionNumber >= this.config.questionsAmount) {
      this.status = "finished";
    } else {
      this.status = "answered";
    }

    // After input, draw the correct interval to the staff
    const rootNote = getFullNoteNameFromObj(currentQuestion.rootNote);

    const correctNotesToDraw = [rootNote, getFullNoteNameFromObj(currentQuestion.intervalNote)];
    this.drawVectorScoreNotes(correctNotesToDraw);
    this.applyClassesVectorScoreNotes(0, "correct-note");

    const gussedIntervaledNote = this.getIntervalNoteByDirection(currentQuestion.rootNote, guessedInterval, currentQuestion.direction);
    const gussedNotesToDraw = [rootNote, getFullNoteNameFromObj(gussedIntervaledNote)];
    this.drawVectorScoreNotes(gussedNotesToDraw);
    if (this.wrongGuessInterval === "") this.applyClassesVectorScoreNotes(2, "correct-note");
    else this.applyClassesVectorScoreNotes(2, "wrong-note");
  }

  private playInterval() {
    if (!this.currentQuestion) return;

    pianoAudioService.stopAll();
    if (this.intervalAudioTimer) {
      clearTimeout(this.intervalAudioTimer);
      this.intervalAudioTimer = null;
    }

    const { type, rootNote, intervalNote } = this.currentQuestion;

    if (type === "melodic") {
      pianoAudioService.playNote(rootNote);
      this.intervalAudioTimer = setTimeout(() => {
        pianoAudioService.playNote(intervalNote);
      }, 800);
    } else {
      pianoAudioService.playNote(rootNote);
      pianoAudioService.playNote(intervalNote);
    }
  }

  private playRequestedInterval(interval: string) {
    if (!this.currentQuestion) return;

    pianoAudioService.stopAll();
    if (this.intervalAudioTimer) {
      clearTimeout(this.intervalAudioTimer);
      this.intervalAudioTimer = null;
    }

    const { type, direction, rootNote } = this.currentQuestion;

    const intervalNote = this.getIntervalNoteByDirection(rootNote, interval, direction);

    if (type === "melodic") {
      pianoAudioService.playNote(rootNote);
      this.intervalAudioTimer = setTimeout(() => {
        pianoAudioService.playNote(intervalNote);
      }, 800);
    } else {
      pianoAudioService.playNote(rootNote);
      pianoAudioService.playNote(intervalNote);
    }
  }

  private getIntervalNoteByDirection(rootNote: GeneralNote, interval: string, direction: string): GeneralNote {
    let intervalNoteName = "";

    const fullRootNoteName = getFullNoteNameFromObj(rootNote);

    if (direction === "descending") intervalNoteName = decrementNoteNameByInterval(fullRootNoteName, interval);
    else intervalNoteName = incrementNoteNameByInterval(fullRootNoteName, interval);
    return convertNoteNameToObj(intervalNoteName);
  }

  private getCurrentUIMessage(status: ExerciseState) {
    switch (status) {
      case "idle": return "Click the next arrow to start";
      case "playing": return "Identify the played interval";
      case "answered": {
        return (this.wrongGuessInterval !== "" ? "Incorrect. " : "Correct! ") + "Click the next arrow to start";
      }
      case "finished": return "Exercise Over!";
    }
  }

  private drawVectorScoreNotes(notes: string[]) {
    if (!this.staffInstance) return;
    this.staffInstance.drawNote(notes);
  }

  private applyClassesVectorScoreNotes(groupIndexStart: number, className: string) {
    if (!this.staffInstance) return;
    this.staffInstance.addClassToNoteByIndex(className, groupIndexStart);
    this.staffInstance.addClassToNoteByIndex(className, groupIndexStart + 1);
  }

  private clearVectorScoreNotes() {
    if (!this.staffInstance) return;
    this.staffInstance.clearAllNotes();
  }

  // If class state is already answered, then whatever interval pressed by user is played.
  handleIntervalButtonClick = (interval: string) => {
    if (this.status === "playing") this.handleInput(interval);
    else if (this.status === "answered") this.playRequestedInterval(interval);
  }

  handleNextButtonClick = () => {
    if (this.status === "idle" || this.status === "answered") {
      this.generateNewQuestion();
    }
  }

  handleReplayIntervalClick = () => {
    if (this.status !== "idle") this.playInterval();
  }

  setupVectorScoreStaff = (staffContainerElement: HTMLDivElement) => {
    this.staffInstance = new MusicStaff(staffContainerElement, {
      staffType: 'grand',
      staffColor: 'var(--color-on-bg-surface)',
      staffBackgroundColor: 'var(--color-bg-surface-1)',
      width: 220,
      noteStartX: 20,
      scale: 1.2,
      spaceAbove: 2,
      spaceBelow: 2
    });
  }

  destroy() {
    if (this.intervalAudioTimer) clearTimeout(this.intervalAudioTimer);
    if (this.staffInstance) {
      this.staffInstance.clearAllNotes();
      this.staffInstance = null;
    }
  }
}