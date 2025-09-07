export interface SoundManagerOptions {
  loop?: boolean;    // should the sound loop
  volume?: number;   // 0.0 - 1.0 (default 1)
  startAt?: number;  // seconds (default 0)
}

export class SoundManager {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
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

    let finalSrc = src;

    // If it's a remote URL, fetch the file and create an object URL
    if (/^https?:\/\//.test(src)) {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }
      const blob = await response.blob();
      this.objectUrl = URL.createObjectURL(blob);
      finalSrc = this.objectUrl;
      console.log("");
    }

    this.audio.src = finalSrc;
    this.audio.load();
  }

  private clampVolume(v: number): number {
    return Math.max(0, Math.min(1, v));
  }
}

export default SoundManager;

// export interface SoundManagerOptions {
//   loop?: boolean;    // should the sound loop
//   volume?: number;   // 0.0 - 1.0 (default 1)
//   startAt?: number;  // seconds (default 0)
// }

// export class SoundManager {
//   private audio: HTMLAudioElement;
//   private isPlaying: boolean;

//   constructor(src: string, options: SoundManagerOptions = {}) {
//     this.audio = new Audio(src);
//     this.audio.preload = "auto";

//     // apply options
//     this.audio.loop = options.loop ?? false;
//     this.audio.volume = this.clampVolume(options.volume ?? 1);
//     this.audio.currentTime = Math.max(0, options.startAt ?? 0);

//     this.isPlaying = false;

//     this.audio.addEventListener("play", () => {
//       this.isPlaying = true;
//     });
//     this.audio.addEventListener("ended", () => {
//       this.isPlaying = false;
//     });
//     this.audio.addEventListener("pause", () => {
//       this.isPlaying = false;
//     });
//   }

//   /** Play sound, won’t restart if already playing */
//   public play(): void {
//     if (!this.isPlaying) {
//       this.audio.play().catch((err: unknown) => {
//         console.error("Error playing sound:", err);
//       });
//     }
//   }

//   /** Stop sound and reset to start */
//   public stop(): void {
//     if (this.isPlaying) {
//       this.audio.pause();
//       this.audio.currentTime = 0;
//     }
//   }

//   /** Update volume (0.0 - 1.0) */
//   public setVolume(volume: number): void {
//     this.audio.volume = this.clampVolume(volume);
//   }

//   /** Change looping on the fly */
//   public setLoop(loop: boolean): void {
//     this.audio.loop = loop;
//   }

//   /** Jump to a position (in seconds) */
//   public seek(seconds: number): void {
//     this.audio.currentTime = Math.max(0, seconds);
//   }

//   public setSound(src: string) {
//     this.stop();
//     this.audio.src = src;
//     this.audio.load();
//   }

//   private clampVolume(v: number): number {
//     return Math.max(0, Math.min(1, v));
//   }
// }

// export default SoundManager;