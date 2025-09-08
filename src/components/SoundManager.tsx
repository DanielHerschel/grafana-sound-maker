export interface SoundManagerOptions {
  loop?: boolean;    // should the sound loop
  volume?: number;   // 0.0 - 1.0 (default 1)
  startAt?: number;  // seconds (default 0)
}

export class SoundManager {
  private audio: HTMLAudioElement | null = null;
  public isPlaying = false;
  private objectUrl: string | null = null;
  private options: SoundManagerOptions;

  constructor(src: string, options: SoundManagerOptions = {}) {
    this.options = options;
    this.init(src)
  }

  /** Initialize the SoundManager with a sound source */
  private async init(src: string): Promise<void> {
    this.dispose();

    this.audio = new Audio();
    this.audio.preload = "auto";
    await this.setSound(src);
    

    // apply options
    this.audio.loop = this.options.loop ?? false;
    this.audio.volume = this.clampVolume(this.options.volume ?? 1);
    this.audio.currentTime = Math.max(0, this.options.startAt ?? 0);

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

  /** Dispose and free resources */
  public dispose(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio.load();
      this.audio = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.isPlaying = false;
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