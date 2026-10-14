import { useEffect, useState } from "react";
import { sfx } from "../game/audio";

/** 全螢幕切換鈕：不支援 Fullscreen API 的瀏覽器（如 iPhone Safari）自動隱藏 */
export default function FullscreenButton() {
  const [supported] = useState(
    () => typeof document !== "undefined" && document.fullscreenEnabled,
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => setActive(document.fullscreenElement != null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!supported) return null;

  async function toggle() {
    sfx.click();
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* 使用者取消或瀏覽器拒絕時忽略 */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "離開全螢幕" : "進入全螢幕"}
      title={active ? "離開全螢幕" : "進入全螢幕"}
      className="rounded-lg bg-white/15 px-2.5 py-1.5 backdrop-blur transition hover:bg-white/25"
    >
      {active ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 3v3a2 2 0 0 1-2 2H3" />
          <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
          <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          <path d="M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
        </svg>
      )}
    </button>
  );
}
