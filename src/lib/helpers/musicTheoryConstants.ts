import type { GeneralChord, IntervalEntry } from "./musicTheoryTypes";

export const regexChordSymbolToken = /^(?<note>[A-Ga-g])-?(?<accidental>(?:sharp|flat)?)-?(?<symbol>.*?)(?:-?bass(?<bassNote>.*))?$/;
export const regexScaleToken = /^(?<note>[A-Ga-g])-?(?<accidental>(?:sharp|flat)?)-?(?<scale>.*)$/;

export const naturalNoteNames = ["C", "D", "E", "F", "G", "A", "B"];
export const accidentalNames = ["n", "#", "b"];

export const keyNamesFlatted = ["C", "G", "D", "A", "E", "B", "F", "Bb", "Eb", "Ab", "Db", "Gb"];

export const majorModes = ["major", "ionian", "lydian", "mixolydian"];
export const minorModes = ["minor", "aeolian", "dorian", "phrygian", "locrian"];

export const intervalObjs: IntervalEntry[] = [
  { name: "Perfect Unison", interval: "P1" },
  { name: "Minor Second", interval: "m2" },
  { name: "Major Second", interval: "M2" },
  { name: "Minor Third", interval: "m3" },
  { name: "Major Third", interval: "M3" },
  { name: "Perfect Fourth", interval: "P4" },
  { name: "Tritone", interval: "A4" },
  { name: "Perfect Fifth", interval: "P5" },
  { name: "Minor Sixth", interval: "m6" },
  { name: "Major Sixth", interval: "M6" },
  { name: "Minor Seventh", interval: "m7" },
  { name: "Major Seventh", interval: "M7" },
  { name: "Perfect Octave", interval: "P8" },
]

export const chordCategories = ["Common", "Major", "Minor", "Dominant", "Diminished", "Suspended"];
export const chordCategoryEntries: Record<string, Pick<GeneralChord, "name" | "symbol">[]> = {
  "Common": [
    { name: "major", symbol: "maj" },
    { name: "minor", symbol: "min" },
    { name: "major seventh", symbol: "maj7" },
    { name: "minor seventh", symbol: "min7" },
    { name: "dominant seventh", symbol: "7" },
    { name: "sixth", symbol: "6" },
    { name: "suspended second", symbol: "sus2" },
    { name: "suspended fourth", symbol: "sus4" },
    { name: "augmented", symbol: "aug" },
    { name: "diminished", symbol: "dim" },
  ],
  "Major": [
    { name: "major", symbol: "maj" },
    { name: "major seventh", symbol: "maj7" },
    { name: "major ninth", symbol: "maj9" },
    { name: "major thirteenth", symbol: "maj13" },
    { name: "sixth", symbol: "6" },
    { name: "added ninth", symbol: "add9" },
    { name: "added eleventh", symbol: "add11" },
    { name: "added thirteenth", symbol: "add13" },
  ],
  "Minor": [
    { name: "minor", symbol: "min" },
    { name: "minor sixth", symbol: "min6" },
    { name: "minor seventh", symbol: "min7" },
    { name: "minor ninth", symbol: "min9" },
    { name: "minor thirteenth", symbol: "min13" },
    { name: "minor major seventh", symbol: "mmaj7" },
  ],
  "Dominant": [
    { name: "dominant seventh", symbol: "7" },
    { name: "ninth", symbol: "9" },
    { name: "eleventh", symbol: "11" },
    { name: "thirteenth", symbol: "13" },
    { name: "dominant seventh suspended fourth", symbol: "7sus4" },
    { name: "dominant ninth suspended fourth", symbol: "9sus4" },
  ],
  "Diminished": [
    { name: "diminished", symbol: "dim" },
    { name: "diminished seventh", symbol: "dim7" },
    { name: "half diminished", symbol: "m7b5" },
  ],
  "Suspended": [
    { name: "suspended second", symbol: "sus2" },
    { name: "suspended fourth", symbol: "sus4" },
    { name: "dominant seventh suspended fourth", symbol: "7sus4" },
  ],
};
export const modeNumeralMap: Record<string, string[]> = {
  "major": ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  "ionian": ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  "dorian": ["i", "ii", "III", "IV", "v", "vi°", "VII"],
  "phrygian": ["i", "II", "III", "iv", "v°", "VI", "vii"],
  "lydian": ["I", "II", "iii", "iv°", "V", "vi", "vii"],
  "mixolydian": ["I", "ii", "iii°", "IV", "v", "vi", "VII"],
  "minor": ["i", "ii°", "III", "iv", "v", "VI", "VII"],
  "aeolian": ["i", "ii°", "III", "iv", "v", "VI", "VII"],
  "locrian": ["i°", "II", "iii", "iv", "V", "VI", "vii"],

  "harmonic minor": ["i", "ii°", "III+", "iv", "V", "VI", "vii°"],
  "melodic minor": ["i", "ii", "III+", "IV", "V", "vi°", "vii°"],
};

export const modeFormulaMap: Record<string, string[]> = {
  "major": ["1", "2", "3", "4", "5", "6", "7"],
  "ionian": ["1", "2", "3", "4", "5", "6", "7"],
  "dorian": ["1", "2", "b3", "4", "5", "6", "b7"],
  "phrygian": ["1", "b2", "b3", "4", "5", "b6", "b7"],
  "lydian": ["1", "2", "3", "#4", "5", "6", "7"],
  "mixolydian": ["1", "2", "3", "4", "5", "6", "b7"],
  "minor": ["1", "2", "b3", "4", "5", "b6", "b7"],
  "aeolian": ["1", "2", "b3", "4", "5", "b6", "b7"],
  "locrian": ["1", "b2", "b3", "4", "5", "6", "7"],

  "harmonic minor": ["1", "2", "b3", "4", "5", "b6", "7"],
  "melodic minor": ["1", "2", "b3", "4", "5", "6", "7"],
};

export const simpleChordSymbols = [
  "maj",
  "m",
  "diminished",
  "augmented",
  "sus2",
  "sus4",
  "7",
  "m7",
  "maj7",
  "dim7",
  "m7b5",
  "7sus4",
  "6",
  "m6",
  "9",
  "m9",
  "maj9",
  "11",
  "m11",
  "13",
  "m13",
  "maj13",
  "add9",
  "6/9",
];

export enum chordInversionNames {
  "root",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th"
}