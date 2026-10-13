export interface Country {
  code: string;
  zhTW: string;
  en: string;
  capitalZh: string;
  tier: number;
}

export function flagSvgUrl(code: string): string {
  return `https://flagcdn.com/${code}.svg`;
}

/** 高解析備援（640px PNG） */
export function flagPngUrl(code: string, width = 640): string {
  return `https://flagcdn.com/w${width}/${code}.png`;
}

export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface PoolTile {
  id: number;
  char: string;
  used: boolean;
  removedByHint: boolean;
}

/**
 * 產生選字池：答案字 + 干擾字補到 poolSize（預設 12）。
 * 干擾字只從全題庫的正體字取，且避開答案已含的字，避免歧義。
 */
export function buildCharPool(
  answer: string,
  allNames: string[],
  poolSize = 12,
): PoolTile[] {
  const answerChars = [...answer];
  const answerSet = new Set(answerChars);

  const pool: string[] = [];
  const freq = new Map<string, string[]>();
  for (const name of allNames) {
    for (const ch of [...name]) {
      if (answerSet.has(ch)) continue;
      if (!freq.has(ch)) freq.set(ch, []);
      freq.get(ch)!.push(name);
    }
  }
  const candidates = shuffled([...freq.keys()]);
  const need = Math.max(poolSize - answerChars.length, 0);
  for (let i = 0; i < need; i++) {
    if (candidates.length === 0) break;
    // 循環取用，避免字不夠時卡住
    pool.push(candidates[i % candidates.length]);
  }
  const tiles = shuffled([...answerChars, ...pool]);
  return tiles.map((char, id) => ({ id, char, used: false, removedByHint: false }));
}
