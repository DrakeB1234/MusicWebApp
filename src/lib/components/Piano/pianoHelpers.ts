import { convertMidiToNoteName, convertNoteNameToMidi, getEnharmonicNote } from "$lib/helpers/musicTheory";

type KeyObj = {
  midi: number;
  noteName: string;
  enharmonicNoteName: string;
  type: "white" | "black";
  x: number;
};

export const keysConfig = {
  white: { width: 42, height: 180, radius: 0 },
  black: { width: 26, height: 108, radius: 4 },
};

export const blackKeysSet = new Set([1, 3, 6, 8, 10]);

const viewBoxPadding = 1;
export const getViewBoxWidth = (whiteKeysAmount: number) => whiteKeysAmount * keysConfig.white.width + viewBoxPadding;
export const viewBoxHeight = keysConfig.white.height + viewBoxPadding;

export function getActiveMidiNums(activeNotes: string[]) {
  let midis = new Set<number>();
  for (const note of activeNotes) {
    const midi = convertNoteNameToMidi(note);
    if (midi) midis.add(midi);
  }
  return midis;
}

export function generateKeys(startMidiNum: number, endMidiNum: number): KeyObj[] {
  let keys: KeyObj[] = [];

  const isFirstKeyBlack = blackKeysSet.has(startMidiNum % 12);
  let currentXPos = isFirstKeyBlack ? keysConfig.black.width / 2 : 0;

  const totalKeys = endMidiNum - startMidiNum + 1;

  for (let i = 0; i < totalKeys; i++) {
    const midi = startMidiNum + i;
    const noteName = convertMidiToNoteName(midi);
    const chroma = midi % 12;
    const isBlack = blackKeysSet.has(chroma);
    const type = isBlack ? "black" : "white";

    let xPos = currentXPos;

    if (isBlack) {
      xPos -= keysConfig.black.width / 2;
    } else {
      xPos = currentXPos;
      currentXPos += keysConfig.white.width;
    }

    const noteNameWithoutOctave = noteName.slice(0, -1);
    const enharmonicNoteName = getEnharmonicNote(noteNameWithoutOctave);

    keys.push({
      midi,
      noteName: noteNameWithoutOctave,
      enharmonicNoteName,
      type,
      x: xPos,
    });
  }

  return keys;
}