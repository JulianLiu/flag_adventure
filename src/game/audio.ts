/* Web Audio API 自行合成音效，無外部音檔，無版權問題 */

let ctx: AudioContext | null = null;
let muted = localStorage.getItem("flag-muted") === "1";

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  localStorage.setItem("flag-muted", m ? "1" : "0");
}

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** iOS 需由使用者手勢解鎖 */
export function unlockAudio(): void {
  ac();
}

function tone(
  freq: number,
  dur = 0.08,
  type: OscillatorType = "square",
  vol = 0.06,
  when = 0,
  slideTo?: number,
): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  select() {
    tone(620, 0.07, "square", 0.05);
  },
  deselect() {
    tone(380, 0.07, "square", 0.045);
  },
  click() {
    tone(500, 0.05, "triangle", 0.05);
  },
  hint() {
    tone(520, 0.09, "sine", 0.06);
    tone(780, 0.1, "sine", 0.06, 0.08);
  },
  correct() {
    // C5 E5 G5 C6 琶音
    tone(523.25, 0.12, "triangle", 0.07, 0);
    tone(659.25, 0.12, "triangle", 0.07, 0.09);
    tone(783.99, 0.12, "triangle", 0.07, 0.18);
    tone(1046.5, 0.22, "triangle", 0.08, 0.27);
  },
  wrong() {
    tone(160, 0.28, "sawtooth", 0.07, 0, 110);
  },
  transition() {
    tone(300, 0.16, "sine", 0.05, 0, 720);
  },
  complete() {
    tone(523.25, 0.14, "triangle", 0.07, 0);
    tone(659.25, 0.14, "triangle", 0.07, 0.12);
    tone(783.99, 0.14, "triangle", 0.07, 0.24);
    tone(1046.5, 0.3, "triangle", 0.08, 0.36);
    tone(1318.5, 0.35, "sine", 0.05, 0.5);
  },
};
