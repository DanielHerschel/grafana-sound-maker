type enabled = boolean;
type soundURL = string;
type volume = number;
type startAt = number;
type loop = boolean;

export interface SimpleOptions {
  soundURL: soundURL;
  enabled: enabled;
  volume: volume;
  startAt: startAt;
  loop: loop;
}
