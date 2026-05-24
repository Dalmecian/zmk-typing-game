import { PracticeItem, PracticeMode, PracticeSession } from "../types";
import { canonicalRomaji, japaneseToRomajiTokens } from "./romaji";
import { currentRomajiBuffer, nextRomajiChars } from "./romajiProgress";

const japaneseItems: PracticeItem[] = [
  item("jp-word-riru", 1, "japanese", "りる", "りる", ["word", "rill"]),
  item("jp-word-kagi", 1, "japanese", "鍵", "かぎ", ["word"]),
  item("jp-word-yubi", 1, "japanese", "指", "ゆび", ["word"]),
  item("jp-word-layer", 1, "japanese", "レイヤ", "れいや", ["word", "layer"]),
  item("jp-word-key", 1, "japanese", "キー", "きー", ["word", "key"]),
  item("jp-word-magic", 1, "japanese", "まほう", "まほう", ["word"]),
  item("jp-phrase-rill-key", 2, "japanese", "リルのキー", "りるのきー", ["phrase"]),
  item("jp-phrase-lost-key", 2, "japanese", "鍵をなくしたリル", "かぎをなくしたりる", ["phrase", "rill"]),
  item("jp-short-look", 3, "japanese", "次のキーを見なさい", "つぎのきーをみなさい", ["sentence"]),
  item("jp-short-layer", 3, "japanese", "レイヤは逃げない", "れいやはにげない", ["sentence", "layer"]),
  item("jp-symbol-rill", 4, "japanese", "リル「それ、違うわよ」", "りる「それ、ちがうわよ」", ["sentence", "symbol"]),
  item("jp-symbol-memo", 4, "japanese", "メモ: キーは逃げない", "めも: きーはにげない", ["sentence", "symbol"])
];

const symbolItems: PracticeItem[] = [
  item("sym-home", 1, "symbols", "asdf jkl;", undefined, ["home"]),
  item("sym-layer", 1, "symbols", "layer key", undefined, ["word"]),
  item("sym-rill", 1, "symbols", "rill magic", undefined, ["word", "rill"]),
  item("sym-path", 2, "symbols", "key/map", undefined, ["symbol"]),
  item("sym-at", 2, "symbols", "look @ key", undefined, ["symbol"]),
  item("sym-note", 3, "symbols", "memo: layer is near", undefined, ["sentence", "symbol"]),
  item("sym-code", 4, "symbols", "const key = '@';", undefined, ["code", "symbol"])
];

export function makePracticeSession(mode: PracticeMode, previous?: PracticeSession): PracticeSession {
  const item = choosePracticeItem(mode, previous);
  const target = item.target;

  return {
    mode,
    item,
    stage: item.level,
    target,
    typed: "",
    currentBuffer: "",
    nextExpected: firstExpected(item),
    correctCount: 0,
    totalKeypresses: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: []
  };
}

export function allPracticeItems(mode: PracticeMode): PracticeItem[] {
  return mode === "japanese" ? japaneseItems : symbolItems;
}

export function accuracy(session: PracticeSession): number {
  if (session.totalKeypresses === 0) return 100;
  return Math.max(0, Math.round((session.correctCount / session.totalKeypresses) * 100));
}

export function wpm(session: PracticeSession, now = Date.now()): number {
  if (!session.startedAt) return 0;
  const end = session.completedAt ?? now;
  const minutes = Math.max((end - session.startedAt) / 60000, 1 / 60);
  return Math.round(session.correctCount / 5 / minutes);
}

export function itemTokens(item: PracticeItem) {
  return item.mode === "japanese" ? japaneseToRomajiTokens(item.reading ?? item.display) : [];
}

export function nextExpectedForItem(item: PracticeItem, typed: string): string {
  if (item.mode === "symbols") return item.target[typed.length] ?? "";
  return nextRomajiChars(typed, itemTokens(item))[0] ?? "";
}

export function bufferForItem(item: PracticeItem, typed: string): string {
  if (item.mode === "symbols") return typed.at(-1) ?? "";
  return currentRomajiBuffer(typed, itemTokens(item));
}

function choosePracticeItem(mode: PracticeMode, previous?: PracticeSession): PracticeItem {
  const items = allPracticeItems(mode);
  const highestLevel = previous ? Math.min(4, Math.max(1, previous.stage + (previous.mistakes.length <= 1 ? 1 : 0))) : 1;
  const candidates = items.filter((candidate) => candidate.level <= highestLevel);

  if (!previous || previous.mistakes.length === 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const missed = new Set(previous.mistakes.map((mistake) => mistake.expected).filter(Boolean));
  const weighted = candidates.flatMap((candidate) => {
    const weight = [...missed].some((char) => candidate.target.includes(char)) ? 3 : 1;
    return Array.from({ length: weight }, () => candidate);
  });
  return weighted[Math.floor(Math.random() * weighted.length)] ?? candidates[0];
}

function item(
  id: string,
  level: number,
  mode: PracticeMode,
  display: string,
  reading: string | undefined,
  tags: string[]
): PracticeItem {
  const target = mode === "japanese" ? canonicalRomaji(japaneseToRomajiTokens(reading ?? display)) : display;
  return { id, level, mode, display, reading, target, tags };
}

function firstExpected(item: PracticeItem): string {
  return nextExpectedForItem(item, "");
}
