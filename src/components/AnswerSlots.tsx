import { motion } from "framer-motion";

interface Props {
  slots: (string | null)[];
  status: "playing" | "correct" | "wrong";
  onRemoveAt: (slotIndex: number) => void;
}

export default function AnswerSlots({ slots, status, onRemoveAt }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {slots.map((ch, i) => (
        <motion.button
          key={i}
          type="button"
          onClick={() => onRemoveAt(i)}
          whileTap={ch ? { scale: 0.88 } : undefined}
          className={[
            "flex h-12 min-w-12 items-center justify-center rounded-xl border px-2 text-2xl font-bold transition-colors",
            ch
              ? status === "correct"
                ? "border-emerald-300 bg-emerald-400 text-white"
                : status === "wrong"
                  ? "border-red-300 bg-red-400 text-white"
                  : "border-amber-200 bg-amber-50 text-slate-800"
              : "border-dashed border-white/50 bg-white/10 text-transparent",
          ].join(" ")}
        >
          {ch ?? "　"}
        </motion.button>
      ))}
    </div>
  );
}
