import { motion } from "framer-motion";
import type { PoolTile } from "../game/flags";

interface Props {
  pool: PoolTile[];
  onPick: (tileId: number) => void;
}

export default function CharPool({ pool, onPick }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {pool.map((t) => {
        if (t.removedByHint) {
          return <div key={t.id} className="h-14 rounded-xl bg-white/10" />;
        }
        const disabled = t.used;
        return (
          <motion.button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(t.id)}
            whileTap={disabled ? undefined : { scale: 0.88 }}
            animate={disabled ? { opacity: 0.35, scale: 0.96 } : { opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={[
              "h-14 rounded-xl border text-2xl font-bold shadow",
              disabled
                ? "border-white/20 bg-slate-300/60 text-transparent"
                : "border-white/60 bg-white text-slate-800 active:bg-amber-100",
            ].join(" ")}
          >
            {t.char}
          </motion.button>
        );
      })}
    </div>
  );
}
