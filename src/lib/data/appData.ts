import type { IconType } from "$lib/components/Icons/Icon.svelte";
import DAW from "$lib/components/Icons/DAW.svelte";
import Metronome from "$lib/components/Icons/Metronome.svelte";
import Polyrhythm from "$lib/components/Icons/Polyrhythm.svelte";

interface DataEntry {
  name: string;
  description: string;
  href: string;
  urlName: string;
  color: string;
  icon: IconType
};

export interface IntervalsExerciseEntry {
  title: string;
  description: string;
  href: string,
  color: "purple" | "violet" | "blue" | "green";
  icon: IconType;
}

export const exercisesData: DataEntry[] = [
  {
    name: "Intervals Ear Training",
    description: "Improve your ear training with either custom or guided interval training exercises!",
    href: "/exercises/interval-ear-training",
    urlName: "interval-ear-training",
    color: "green",
    icon: "book"
  },
  {
    name: "Sight Reading",
    description: "Play the corresponding note shown on the staff, customize the exercise to match your skill level!",
    href: "/exercises/sight-reading",
    urlName: "sight-reading",
    color: "green",
    icon: "musicNote"
  },
  // {
  //   name: "Scales Companion",
  //   description: "Companion for your daily practicing of scales, featuring midi detection, built-in metronome, and more!",
  //   href: "/exercises/scales-companion",
  //   urlName: "scales-companion",
  //   color: "purple",
  //   icon: Scale
  // },
];

export const toolsData: DataEntry[] = [
  {
    name: "Metronome",
    description: "Easy to use and simple metronome to use for many musical applications!",
    href: "/tools/metronome",
    urlName: "metronome",
    color: "violet",
    icon: Metronome
  },
  {
    name: "Polyrhythms",
    description: "In depth and deeply customizable polyrhythm creator with many options and customization available!",
    href: "/tools/polyrhythms",
    urlName: "polyrhythms",
    color: "violet",
    icon: Polyrhythm
  },
  {
    name: "Indentify Chord",
    description: "Lookup a chord that you know the notes to on a piano roll, then view the details on it!",
    href: "/tools/indentify-chord",
    urlName: "indentify-chord",
    color: "violet",
    icon: "search"
  },
  {
    name: "Chords Library",
    description: "Search any chord and play them in app, or lookup how to play it on your instrument.",
    href: "/tools/chords-library",
    urlName: "chords-library",
    color: "violet",
    icon: "dictionary"
  },
  {
    name: "Scales Library",
    description: "Find the notes and diatonic chords in any scale.",
    href: "/tools/scales-library",
    urlName: "scales-library",
    color: "violet",
    icon: "stacks"
  },
  {
    name: "Chord Progression",
    description: "Create and save chord progressions for practicing or writing music.",
    href: "/tools/chord-progression",
    urlName: "chord-progression",
    color: "violet",
    icon: DAW,
  },
]
