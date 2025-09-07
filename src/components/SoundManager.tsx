export interface SoundManagerOptions {
  loop?: boolean;    // should the sound loop
  volume?: number;   // 0.0 - 1.0 (default 1)
  startAt?: number;  // seconds (default 0)
}

export class SoundManager {
  private audio: HTMLAudioElement;
  private isPlaying: boolean;

  constructor(src: string, options: SoundManagerOptions = {}) {
    this.audio = new Audio(src);
    this.audio.preload = "auto";

    // apply options
    this.audio.loop = options.loop ?? false;
    this.audio.volume = this.clampVolume(options.volume ?? 1);
    this.audio.currentTime = Math.max(0, options.startAt ?? 0);

    this.isPlaying = false;

    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
    });
    this.audio.addEventListener("ended", () => {
      this.isPlaying = false;
    });
    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
    });
  }

  /** Play sound, won’t restart if already playing */
  public play(): void {
    if (!this.isPlaying) {
      this.audio.play().catch((err: unknown) => {
        console.error("Error playing sound:", err);
      });
    }
  }

  /** Stop sound and reset to start */
  public stop(): void {
    if (this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  /** Update volume (0.0 - 1.0) */
  public setVolume(volume: number): void {
    this.audio.volume = this.clampVolume(volume);
  }

  /** Change looping on the fly */
  public setLoop(loop: boolean): void {
    this.audio.loop = loop;
  }

  /** Jump to a position (in seconds) */
  public seek(seconds: number): void {
    this.audio.currentTime = Math.max(0, seconds);
  }

  private clampVolume(v: number): number {
    return Math.max(0, Math.min(1, v));
  }
}

export default SoundManager;