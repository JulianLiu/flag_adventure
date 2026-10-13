import { motion } from "framer-motion";
import { flagPngUrl, flagSvgUrl } from "../game/flags";

interface Props {
  code: string;
  roundKey: number;
  wrongKey: number;
  tier: number;
}

const TIER_LABEL = ["", "常見國家", "島國", "地區旗幟"];

export default function FlagCard({ code, roundKey, wrongKey, tier }: Props) {
  return (
    <div key={`${roundKey}-${wrongKey}`} className={wrongKey > 0 ? "animate-shake" : undefined}>
      <motion.div
        key={roundKey}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-2xl border border-white/25 bg-white shadow-xl"
      >
        <img
          src={flagSvgUrl(code)}
          alt="國旗"
          draggable={false}
          className="aspect-[3/2] w-full select-none object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fbk) {
              img.dataset.fbk = "1";
              img.src = flagPngUrl(code);
            }
          }}
        />
      </motion.div>
      <div className="mt-2 text-center text-sm font-medium tracking-wide text-white/85">
        {TIER_LABEL[tier] ?? ""}
      </div>
    </div>
  );
}
