import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import countriesData from "./data/countries.json";
import { buildCharPool, shuffled, type Country, type PoolTile } from "./game/flags";
import { isMuted, setMuted, sfx, unlockAudio } from "./game/audio";
import FlagCard from "./components/FlagCard";
import AnswerSlots from "./components/AnswerSlots";
import CharPool from "./components/CharPool";
import HUD from "./components/HUD";

type Status = "playing" | "correct" | "wrong";

const COUNTRIES = countriesData as Country[];
const ALL_NAMES = COUNTRIES.map((c) => c.zhTW);
const BEST_KEY = "flag-best-score";

function loadBest(): number {
  const v = Number(localStorage.getItem(BEST_KEY) ?? 0);
  return Number.isFinite(v) ? v : 0;
}

export default function App() {
  const [order, setOrder] = useState<number[]>(() => shuffled(COUNTRIES.map((_, i) => i)));
  const [roundIdx, setRoundIdx] = useState(0);
  const [pool, setPool] = useState<PoolTile[]>([]);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [status, setStatus] = useState<Status>("playing");
  const [wrongKey, setWrongKey] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [muted, setMutedState] = useState(isMuted());
  const [showEn, setShowEn] = useState(false);
  const [showCapital, setShowCapital] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  const country = COUNTRIES[order[roundIdx]];
  const answer = country?.zhTW ?? "";
  const answerChars = useMemo(() => [...answer], [answer]);

  const startRound = useCallback(
    (idx: number, currentOrder: number[]) => {
      const c = COUNTRIES[currentOrder[idx]];
      if (!c) return;
      setPool(buildCharPool(c.zhTW, ALL_NAMES, 12));
      setPicked(new Array([...c.zhTW].length).fill(null));
      setStatus("playing");
      setShowEn(false);
      setShowCapital(false);
      sfx.transition();
    },
    [],
  );

  useEffect(() => {
    startRound(0, order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem(BEST_KEY, String(score));
    }
  }, [score, best]);

  const goNext = useCallback(
    (nextIdx: number) => {
      if (nextIdx >= order.length) {
        setDone(true);
        sfx.complete();
        void confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
        return;
      }
      setRoundIdx(nextIdx);
      startRound(nextIdx, order);
    },
    [order, startRound],
  );

  const checkAnswer = useCallback(
    (nextPicked: (number | null)[], nextPool: PoolTile[]) => {
      if (nextPicked.some((p) => p === null)) {
        setStatus("playing");
        return;
      }
      const tileById = new Map(nextPool.map((t) => [t.id, t]));
      const text = nextPicked.map((id) => (id === null ? "" : (tileById.get(id)?.char ?? ""))).join("");
      if (text === answer) {
        setStatus("correct");
        const gained = 100 + streak * 20;
        setScore((s) => s + gained);
        setStreak((s) => s + 1);
        setCorrectCount((c) => c + 1);
        sfx.correct();
        void confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 } });
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => goNext(roundIdx + 1), 1100);
      } else {
        setStatus("wrong");
        setStreak(0);
        setWrongKey((k) => k + 1);
        sfx.wrong();
      }
    },
    [answer, goNext, roundIdx, streak],
  );

  function handlePick(tileId: number) {
    if (done || status === "correct") return;
    unlockAudio();
    const emptySlot = picked.indexOf(null);
    if (emptySlot === -1) return;
    const tile = pool.find((t) => t.id === tileId);
    if (!tile || tile.used || tile.removedByHint) return;
    sfx.select();
    const nextPool = pool.map((t) => (t.id === tileId ? { ...t, used: true } : t));
    const nextPicked = [...picked];
    nextPicked[emptySlot] = tileId;
    setPool(nextPool);
    setPicked(nextPicked);
    checkAnswer(nextPicked, nextPool);
  }

  function handleRemoveAt(slotIndex: number) {
    if (done || status === "correct") return;
    const tileId = picked[slotIndex];
    if (tileId === null) return;
    unlockAudio();
    sfx.deselect();
    setPool((p) => p.map((t) => (t.id === tileId ? { ...t, used: false } : t)));
    setPicked((p) => {
      const next = [...p];
      next[slotIndex] = null;
      return next;
    });
    setStatus("playing");
  }

  function handleHint() {
    unlockAudio();
    const victim = pool.find((t) => {
      if (t.used || t.removedByHint) return false;
      return !answerChars.includes(t.char);
    });
    if (!victim) {
      setShowEn(true);
      sfx.hint();
      return;
    }
    sfx.hint();
    setPool((p) => p.map((t) => (t.id === victim.id ? { ...t, removedByHint: true } : t)));
    setShowEn(true);
  }

  function handleCapital() {
    unlockAudio();
    sfx.hint();
    setShowCapital(true);
  }

  function handleSkip() {
    unlockAudio();
    sfx.click();
    setStreak(0);
    if (timer.current) window.clearTimeout(timer.current);
    goNext(roundIdx + 1);
  }

  function handleRestart() {
    unlockAudio();
    sfx.click();
    const nextOrder = shuffled(COUNTRIES.map((_, i) => i));
    setOrder(nextOrder);
    setRoundIdx(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setDone(false);
    startRound(0, nextOrder);
  }

  const slotChars = picked.map((id) => {
    if (id === null) return null;
    return pool.find((t) => t.id === id)?.char ?? null;
  });

  if (!country) return null;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-3 px-4 py-4 sm:py-6">
      <header className="text-center">
        <h1 className="text-2xl font-black tracking-wide text-white drop-shadow">
          🚩 旗幟探險
        </h1>
        <p className="mt-0.5 text-sm text-white/75">看國旗，選出正確的國家名字</p>
      </header>

      <HUD
        round={Math.min(roundIdx + 1, order.length)}
        total={order.length}
        score={score}
        streak={streak}
        best={best}
        muted={muted}
        onToggleMute={() => {
          const next = !muted;
          setMuted(next);
          setMutedState(next);
          if (!next) {
            unlockAudio();
            sfx.click();
          }
        }}
        onHint={handleHint}
        onCapital={handleCapital}
        onSkip={handleSkip}
      />

      {done ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-xl"
        >
          <div className="text-5xl">🏆</div>
          <h2 className="text-2xl font-black text-slate-800">全部完成！</h2>
          <p className="text-slate-600">
            答對 {correctCount}/{order.length} 題，得分 {score} 分
            {score >= best && score > 0 ? "（新紀錄！）" : `（最佳 ${best} 分）`}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="mt-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow transition hover:bg-blue-700"
          >
            再玩一次
          </button>
        </motion.div>
      ) : (
        <>
          <FlagCard code={country.code} roundKey={roundIdx} wrongKey={wrongKey} tier={country.tier} />

          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <AnswerSlots slots={slotChars} status={status} onRemoveAt={handleRemoveAt} />
            <div className="mt-2 min-h-6 text-center text-sm font-medium">
              <AnimatePresence mode="wait">
                {status === "correct" ? (
                  <motion.p
                    key="ok"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-emerald-200"
                  >
                    答對了！{country.zhTW}（{country.en}）+{100 + (streak - 1) * 20} 分
                  </motion.p>
                ) : status === "wrong" ? (
                  <motion.p
                    key="no"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-red-200"
                  >
                    答錯了，再試試看！共 {answerChars.length} 個字
                  </motion.p>
                ) : showEn || showCapital ? (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white/80"
                  >
                    提示：
                    {showCapital ? `首都 ${country.capitalZh}` : ""}
                    {showCapital && showEn ? "・" : ""}
                    {showEn ? `英文 ${country.en}` : ""}，共 {answerChars.length} 個字
                  </motion.p>
                ) : (
                  <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/60">
                    點下方文字填入答案，點上方已選字可退回
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <CharPool pool={pool} onPick={handlePick} />

          <footer className="mt-auto pt-2 text-center text-xs text-white/50">
            國旗圖來源 FlagCDN・共 {order.length} 題・輕鬆玩無時間限制
          </footer>
        </>
      )}
    </div>
  );
}
