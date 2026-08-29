import { SFX_PERCUSSION_NAMES, sfxAudioService, type SfxSoundName } from "$lib/audio/sfxAudioService.svelte";

export type PolyrhythmTrack = {
  id: string;
  color: TrackColor;
  subdivisions: number;
  volume: number;
  sound: SfxSoundName;
  muted: boolean;
};

type TrackPlaybackState = {
  nextHitTime: number;
  nextHitIndex: number;
};

export const trackColors = ["red", "yellow", "blue", "green", "orange", "purple"] as const;
export type TrackColor = typeof trackColors[number];

export class PolyrhythmPlayer {
  tracks: PolyrhythmTrack[] = $state([]);
  bpm: number = $state(120);
  barLengthBeats: number = $state(4);
  isPlaying: boolean = $state(false);
  currentBeatIndexByTrackId: Record<string, number> = $state({});

  private audioContext: AudioContext | null = null;
  private timerID: ReturnType<typeof setTimeout> | null = null;
  private barStartTime = 0;
  private playbackStateByTrackId: Map<string, TrackPlaybackState> = new Map();

  static readonly SCHEDULER_SLEEP_MS = 25.0;
  static readonly LOOKAHEAD_WINDOW_SECONDS = 0.05;

  static readonly MAX_TRACK_COUNT = 6;
  static readonly DEFAULT_BPM = 120;

  constructor() { }

  // === HELPERS ===

  private validateBpmValue(bpm: number): number {
    if (bpm < 40) return 40;
    if (bpm > 240) return 240;
    if (isNaN(bpm)) return PolyrhythmPlayer.DEFAULT_BPM;
    return bpm;
  }

  private get barLengthSeconds() {
    return (60.0 / this.bpm) * this.barLengthBeats;
  }

  private scheduleTrackHit(track: PolyrhythmTrack, timeToPlay: number, hitIndex: number) {
    if (!this.audioContext) return;

    const delayInSeconds = timeToPlay - this.audioContext.currentTime;
    const delayInMs = Math.max(0, delayInSeconds * 1000);

    setTimeout(() => {
      if (!track.muted) {
        // Handle tracks volume and id
        sfxAudioService.play(track.sound as any);
      }
      this.currentBeatIndexByTrackId[track.id] = hitIndex % track.subdivisions;
    }, delayInMs);
  }

  private scheduler() {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const barLength = this.barLengthSeconds;
    const scheduledSounds: string[] = [];

    for (const track of this.tracks) {
      const state = this.playbackStateByTrackId.get(track.id);
      if (!state) continue;

      const hitInterval = barLength / track.subdivisions;

      // Scheduled sounds used to ensure sounds that are played at same time don't play if it uses the same sound.
      while (state.nextHitTime < now + PolyrhythmPlayer.LOOKAHEAD_WINDOW_SECONDS) {
        if (!scheduledSounds.includes(track.sound)) {
          this.scheduleTrackHit(track, state.nextHitTime, state.nextHitIndex);
          scheduledSounds.push(track.sound);
        }

        state.nextHitIndex++;
        state.nextHitTime += hitInterval;
      }
    }

    this.timerID = setTimeout(() => this.scheduler(), PolyrhythmPlayer.SCHEDULER_SLEEP_MS);
  }

  private resetPlaybackPositions() {
    this.playbackStateByTrackId.clear();
    for (const track of this.tracks) {
      this.playbackStateByTrackId.set(track.id, {
        nextHitTime: this.barStartTime,
        nextHitIndex: 0,
      });
      this.currentBeatIndexByTrackId[track.id] = -1;
    }
  }

  private getNextTrackColor(): TrackColor {
    return trackColors[this.tracks.length % trackColors.length];
  }

  private getNextTrackSound(): SfxSoundName {
    return SFX_PERCUSSION_NAMES[this.tracks.length % trackColors.length];
  }

  // === PUBLIC METHODS ===

  play() {
    if (this.isPlaying) return;
    this.bpm = this.validateBpmValue(this.bpm);

    this.audioContext = Howler.ctx;
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.barStartTime = this.audioContext.currentTime;
    this.resetPlaybackPositions();
    this.isPlaying = true;

    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) clearTimeout(this.timerID);
    this.resetPlaybackPositions();
    sfxAudioService.stopAll();
  }

  togglePlay = () => {
    if (this.isPlaying) this.stop();
    else this.play();
  }

  addTrack(track: Omit<PolyrhythmTrack, "id">) {
    if (this.tracks.length >= PolyrhythmPlayer.MAX_TRACK_COUNT) return;

    // Prevents errors where crypto isn't defined (unsecure host, older browsers)
    let id = "";
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    }
    else {
      id = Math.random().toString(10).substring(2, 10);
    }

    this.tracks.push({ ...track, id });

    // If already playing, don't start the new track mid-beat — queue it to join
    // cleanly at the top of the next bar, same as the running tracks would.
    if (this.isPlaying && this.audioContext) {
      const elapsedBars = Math.floor((this.audioContext.currentTime - this.barStartTime) / this.barLengthSeconds);
      const nextBarStartTime = this.barStartTime + (elapsedBars + 1) * this.barLengthSeconds;

      this.playbackStateByTrackId.set(id, { nextHitTime: nextBarStartTime, nextHitIndex: 0 });
      this.currentBeatIndexByTrackId[id] = -1;
    }

    return id;
  }

  removeTrack(idx: number) {
    this.tracks.splice(idx, 1);
  }

  updateTrack(idx: number, updates: Partial<Omit<PolyrhythmTrack, "id">>) {
    const track = this.tracks[idx];
    if (!track) return;

    if (updates.subdivisions !== undefined) {
      let tempSub = Math.floor(updates.subdivisions);
      if (isNaN(tempSub) || tempSub < 1) tempSub = 1;
      if (tempSub > 16) tempSub = 16;

      updates.subdivisions = tempSub;
    }

    if (updates.color !== undefined) {
      let tempColor = updates.color;
      if (!trackColors.find(e => e === tempColor)) tempColor = this.getNextTrackColor();

      updates.color = tempColor;
    }

    if (updates.volume !== undefined) {
      let tempVol = Math.floor(updates.volume);
      if (isNaN(tempVol) || tempVol < 0) tempVol = 0;
      if (tempVol > 100) tempVol = 100;

      updates.volume = tempVol;
    }

    if (track) Object.assign(track, updates);
  }

  createDefaultTrack() {
    const newTrack: Omit<PolyrhythmTrack, "id"> = {
      subdivisions: 1,
      volume: 100,
      muted: false,
      sound: this.getNextTrackSound(),
      color: this.getNextTrackColor(),
    }

    this.addTrack(newTrack);
  }

  setBpm(newBpm: number) {
    this.stop();
    this.bpm = this.validateBpmValue(newBpm);
  }

  getBarProgress(): number {
    if (!this.audioContext || !this.isPlaying) return 0;

    const barLength = this.barLengthSeconds;
    if (barLength <= 0) return 0;

    const elapsed = this.audioContext.currentTime - this.barStartTime;
    return (elapsed % barLength) / barLength;
  }

  init() {
    const newTrack: Omit<PolyrhythmTrack, "id"> = {
      subdivisions: 3,
      volume: 100,
      muted: false,
      sound: "clave_1",
      color: "red",
    };

    this.addTrack(newTrack);

    const newTrack2: Omit<PolyrhythmTrack, "id"> = {
      subdivisions: 4,
      volume: 100,
      muted: false,
      sound: "clave_2",
      color: "yellow",
    };

    this.addTrack(newTrack2);
  }

  destroy() {
    this.tracks = [];
    this.stop();
  }
}