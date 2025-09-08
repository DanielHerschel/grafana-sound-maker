export interface SoundManagerOptions {
  loop?: boolean;    // should the sound loop
  volume?: number;   // 0.0 - 1.0 (default 1)
  startAt?: number;  // seconds (default 0)
}

export class SoundManager {
  private audio: HTMLAudioElement | null = null;
  public isPlaying = false;
  private options: SoundManagerOptions = {};

  static #instance: SoundManager;

  static get instance(): SoundManager {
    if (!SoundManager.#instance) {
      SoundManager.#instance = new SoundManager();
    }
    return SoundManager.#instance
  }

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto";

    this.audio.addEventListener("play", () => (this.isPlaying = true));
    this.audio.addEventListener("ended", () => (this.isPlaying = false));
    this.audio.addEventListener("pause", () => (this.isPlaying = false));
  }

  /** Play sound, won’t restart if already playing */
  public play(): void {
    if (!this.audio) return;
    if (!this.isPlaying) {
      this.audio.play().catch((err: unknown) => {
        console.error("Error playing sound:", err);
      });
    }
  }

  /** Stop sound and reset to start */
  public stop(): void {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  /** Update volume (0.0 - 1.0) */
  public setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = this.clampVolume(volume);
    }
    this.options.volume = this.clampVolume(volume);
  }

  /** Change looping on the fly */
  public setLoop(loop: boolean): void {
    if (this.audio) {
      this.audio.loop = loop;
    }
    this.options.loop = loop;
  }

  /** Jump to a position (in seconds) */
  public seek(seconds: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, seconds);
    }
    this.options.startAt = seconds;
  }

  public async setSound(src: string): Promise<void> {
    if (!this.audio) {
      return;
    }
    if (this.audio.src === src) {
      return; 
    }
    
    this.audio.pause();
    this.audio.src = src;
    this.audio.load();
    if (this.isPlaying) {
      await this.audio.play();
    }
  }

  private clampVolume(v: number): number {
    return Math.max(0, Math.min(1, v));
  }
}

export default SoundManager;