import { browser } from "$app/environment";
import { intervalObjs } from "$lib/helpers/musicTheoryConstants";
import { readStorage, removeStorage, writeStorage } from "./storage";

export type IntervalEarTrainingStats = {
  [interval: string]: { correct: number; wrong: number };
};

const STATS_STORAGE_KEY = "ToneTools_IntervalStats";

export const statsDataService = {

  getStats(): IntervalEarTrainingStats {
    if (!browser) return {};

    const rawStats = readStorage<IntervalEarTrainingStats>(STATS_STORAGE_KEY, {});
    const orderedStats: IntervalEarTrainingStats = {};

    for (const intervalObj of intervalObjs) {
      const key = intervalObj.interval;
      if (rawStats[key]) {
        orderedStats[key] = rawStats[key];
      }
    }

    return orderedStats;
  },

  saveSessionStats(sessionStats: IntervalEarTrainingStats) {
    const allStats = this.getStats();

    for (const [interval, stats] of Object.entries(sessionStats)) {
      if (!allStats[interval]) {
        allStats[interval] = { correct: 0, wrong: 0 };
      }
      allStats[interval].correct += stats.correct;
      allStats[interval].wrong += stats.wrong;
    }

    writeStorage(STATS_STORAGE_KEY, allStats);
  },

  resetSessionStats() {
    removeStorage(STATS_STORAGE_KEY);
  }
};