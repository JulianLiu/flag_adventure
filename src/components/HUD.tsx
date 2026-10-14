import FullscreenButton from "./FullscreenButton";

interface Props {
  round: number;
  total: number;
  score: number;
  streak: number;
  best: number;
  muted: boolean;
  onToggleMute: () => void;
  onHint: () => void;
  onCapital: () => void;
  onSkip: () => void;
}

export default function HUD({
  round,
  total,
  score,
  streak,
  best,
  muted,
  onToggleMute,
  onHint,
  onCapital,
  onSkip,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2 text-white">
      <div className="text-sm font-medium">
        第 {round}/{total} 題
        <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs">
          得分 {score}
        </span>
        {streak >= 2 && (
          <span className="ml-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-bold text-slate-900">
            連擊 ×{streak}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="mr-1 hidden text-xs text-white/70 sm:inline">最佳 {best}</span>
        <button
          type="button"
          onClick={onHint}
          className="rounded-lg bg-white/15 px-2.5 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-white/25"
        >
          提示
        </button>
        <button
          type="button"
          onClick={onCapital}
          className="rounded-lg bg-white/15 px-2.5 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-white/25"
        >
          首都
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg bg-white/15 px-2.5 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-white/25"
        >
          跳過
        </button>
        <FullscreenButton />
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "開啟音效" : "靜音"}
          className="rounded-lg bg-white/15 px-2.5 py-1.5 text-sm backdrop-blur transition hover:bg-white/25"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
