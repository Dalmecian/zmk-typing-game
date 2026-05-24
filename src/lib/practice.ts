import { PracticeItem, PracticeMode, PracticeSession } from "../types";
import { canonicalRomaji, japaneseToRomajiTokens } from "./romaji";
import { currentRomajiBuffer, nextRomajiChars } from "./romajiProgress";

// ═══════════════════════════════════════
// Japanese — 日常で使う単語・フレーズ中心
// ═══════════════════════════════════════

const japaneseItems: PracticeItem[] = [
  // ── Level 1: よく使う単語 ──
  item("jp-w-neko",     1, "japanese", "猫",         "ねこ",       ["word"]),
  item("jp-w-inu",      1, "japanese", "犬",         "いぬ",       ["word"]),
  item("jp-w-denwa",    1, "japanese", "電話",       "でんわ",     ["word"]),
  item("jp-w-eki",      1, "japanese", "駅",         "えき",       ["word"]),
  item("jp-w-mise",     1, "japanese", "店",         "みせ",       ["word"]),
  item("jp-w-gohan",    1, "japanese", "ごはん",     "ごはん",     ["word"]),
  item("jp-w-okane",    1, "japanese", "お金",       "おかね",     ["word"]),
  item("jp-w-shigoto",  1, "japanese", "仕事",       "しごと",     ["word"]),
  item("jp-w-gakkou",   1, "japanese", "学校",       "がっこう",   ["word"]),
  item("jp-w-tomodachi",1, "japanese", "友達",       "ともだち",   ["word"]),
  item("jp-w-heya",     1, "japanese", "部屋",       "へや",       ["word"]),
  item("jp-w-tenki",    1, "japanese", "天気",       "てんき",     ["word"]),
  item("jp-w-jikan",    1, "japanese", "時間",       "じかん",     ["word"]),
  item("jp-w-tabemono", 1, "japanese", "食べ物",     "たべもの",   ["word"]),
  item("jp-w-nomimono", 1, "japanese", "飲み物",     "のみもの",   ["word"]),
  item("jp-w-densha",   1, "japanese", "電車",       "でんしゃ",   ["word"]),
  item("jp-w-kuruma",   1, "japanese", "車",         "くるま",     ["word"]),
  item("jp-w-kasa",     1, "japanese", "傘",         "かさ",       ["word"]),
  item("jp-w-megane",   1, "japanese", "眼鏡",       "めがね",     ["word"]),
  item("jp-w-keitai",   1, "japanese", "携帯",       "けいたい",   ["word"]),

  // ── Level 2: 日常フレーズ ──
  item("jp-p-ohayo",     2, "japanese", "おはよう",                 "おはよう",               ["phrase"]),
  item("jp-p-oyasumi",   2, "japanese", "おやすみ",                 "おやすみ",               ["phrase"]),
  item("jp-p-arigatou",  2, "japanese", "ありがとう",               "ありがとう",             ["phrase"]),
  item("jp-p-sumimasen", 2, "japanese", "すみません",               "すみません",             ["phrase"]),
  item("jp-p-ganbatte",  2, "japanese", "がんばって",               "がんばって",             ["phrase"]),
  item("jp-p-otsukaresama",2,"japanese","お疲れさま",               "おつかれさま",           ["phrase"]),
  item("jp-p-itadaki",   2, "japanese", "いただきます",             "いただきます",           ["phrase"]),
  item("jp-p-gochiso",   2, "japanese", "ごちそうさま",             "ごちそうさま",           ["phrase"]),
  item("jp-p-ittekimasu",2, "japanese", "行ってきます",             "いってきます",           ["phrase"]),
  item("jp-p-tadaima",   2, "japanese", "ただいま",                 "ただいま",               ["phrase"]),
  item("jp-p-okaeri",    2, "japanese", "おかえり",                 "おかえり",               ["phrase"]),
  item("jp-p-daijoubu",  2, "japanese", "大丈夫",                   "だいじょうぶ",           ["phrase"]),
  item("jp-p-konnichiwa",2, "japanese", "こんにちは",               "こんにちは",             ["phrase"]),
  item("jp-p-konbanwa",  2, "japanese", "こんばんは",               "こんばんは",             ["phrase"]),
  item("jp-p-omedetou",  2, "japanese", "おめでとう",               "おめでとう",             ["phrase"]),

  // ── Level 3: 日常の文 ──
  item("jp-s-coffee",  3, "japanese", "コーヒーが飲みたい",                    "こーひーがのみたい",                   ["sentence"]),
  item("jp-s-densha",  3, "japanese", "電車に乗り遅れた",                      "でんしゃにのりおくれた",               ["sentence"]),
  item("jp-s-shukudai",3, "japanese", "宿題が終わらない",                      "しゅくだいがおわらない",               ["sentence"]),
  item("jp-s-ramen",   3, "japanese", "ラーメンが食べたい",                    "らーめんがたべたい",                   ["sentence"]),
  item("jp-s-tenki",   3, "japanese", "今日はいい天気ですね",                  "きょうはいいてんきですね",             ["sentence"]),
  item("jp-s-kaimono", 3, "japanese", "買い物に行きたい",                      "かいものにいきたい",                   ["sentence"]),
  item("jp-s-nemu",    3, "japanese", "眠いけど頑張ろう",                      "ねむいけどがんばろう",                 ["sentence"]),
  item("jp-s-neko",    3, "japanese", "猫がキーボードで寝てる",                "ねこがきーぼーどでねてる",             ["sentence"]),
  item("jp-s-sumafo",  3, "japanese", "スマホの充電がない",                    "すまほのじゅうでんがない",             ["sentence"]),
  item("jp-s-yasumi",  3, "japanese", "明日は休みだ",                          "あしたはやすみだ",                     ["sentence"]),
  item("jp-s-osoi",    3, "japanese", "遅刻しそうだ",                          "ちこくしそうだ",                       ["sentence"]),
  item("jp-s-samui",   3, "japanese", "今日は寒いね",                          "きょうはさむいね",                     ["sentence"]),
  item("jp-s-atsui",   3, "japanese", "暑くて溶けそう",                        "あつくてとけそう",                     ["sentence"]),
  item("jp-s-onaka",   3, "japanese", "お腹がすいた",                          "おなかがすいた",                       ["sentence"]),
  item("jp-s-kaeri",   3, "japanese", "早く家に帰りたい",                      "はやくいえにかえりたい",               ["sentence"]),

  // ── Level 4: 長め日常文 ──
  item("jp-l-conv1",   4, "japanese", "今日もいい天気だから散歩しよう",                   "きょうもいいてんきだからさんぽしよう",                 ["long"]),
  item("jp-l-conv2",   4, "japanese", "明日の会議の準備をしないと",                       "あしたのかいぎのじゅんびをしないと",                   ["long"]),
  item("jp-l-conv3",   4, "japanese", "週末に友達と映画を見に行く",                       "しゅうまつにともだちとえいがをみにいく",               ["long"]),
  item("jp-l-conv4",   4, "japanese", "コンビニでお弁当を買ってきて",                     "こんびにでおべんとうをかってきて",                     ["long"]),
  item("jp-l-conv5",   4, "japanese", "この店のパスタがおいしいらしい",                   "このみせのぱすたがおいしいらしい",                     ["long"]),
  item("jp-l-conv6",   4, "japanese", "駅前に新しいカフェができた",                       "えきまえにあたらしいかふぇができた",                   ["long"]),
  item("jp-l-conv7",   4, "japanese", "傘を持ってきたのに晴れている",                     "かさをもってきたのにはれている",                       ["long"]),
  item("jp-l-conv8",   4, "japanese", "夜更かしは体に悪いとわかってる",                   "よふかしはからだにわるいとわかってる",                 ["long"]),
  item("jp-l-conv9",   4, "japanese", "猫がまたテーブルの上に乗ってる",                   "ねこがまたてーぶるのうえにのってる",                   ["long"]),
  item("jp-l-conv10",  4, "japanese", "冷蔵庫に何もないから買い出しに行こう",             "れいぞうこになにもないからかいだしにいこう",           ["long"]),
];

// ═══════════════════════════════════════
// Symbol/English — コード・日常英語
// ═══════════════════════════════════════

const symbolItems: PracticeItem[] = [
  // ── Level 1 ──
  item("sym-home",    1, "symbols", "asdf jkl;",          undefined, ["home"]),
  item("sym-hello",   1, "symbols", "hello world",        undefined, ["word"]),
  item("sym-quick",   1, "symbols", "the quick brown",    undefined, ["word"]),
  item("sym-fox",     1, "symbols", "lazy fox jumps",     undefined, ["word"]),
  item("sym-type",    1, "symbols", "typing fast",        undefined, ["word"]),
  item("sym-code",    1, "symbols", "code magic",         undefined, ["word"]),
  item("sym-good",    1, "symbols", "good morning",       undefined, ["word"]),
  item("sym-thank",   1, "symbols", "thank you",          undefined, ["word"]),

  // ── Level 2 ──
  item("sym-path",    2, "symbols", "~/code/project",     undefined, ["symbol"]),
  item("sym-email",   2, "symbols", "user@dev.io",        undefined, ["symbol"]),
  item("sym-math",    2, "symbols", "x + y = 42",         undefined, ["symbol"]),
  item("sym-pipe",    2, "symbols", "cat | grep key",     undefined, ["symbol"]),
  item("sym-json",    2, "symbols", '{"hp": 100}',        undefined, ["symbol"]),
  item("sym-arrow",   2, "symbols", "() => {}",           undefined, ["symbol"]),
  item("sym-hash",    2, "symbols", "#include <stdio>",   undefined, ["symbol"]),
  item("sym-percent", 2, "symbols", "100% done!",         undefined, ["symbol"]),

  // ── Level 3 ──
  item("sym-const",   3, "symbols", "const x = 'hello';",              undefined, ["code"]),
  item("sym-func",    3, "symbols", "function run(key) {}",            undefined, ["code"]),
  item("sym-if",      3, "symbols", "if (hp <= 0) restart();",         undefined, ["code"]),
  item("sym-log",     3, "symbols", 'console.log("done!");',           undefined, ["code"]),
  item("sym-import",  3, "symbols", "import { App } from './app';",    undefined, ["code"]),
  item("sym-css",     3, "symbols", ".btn { color: #f7c948; }",        undefined, ["code"]),
  item("sym-git",     3, "symbols", "git push origin main",            undefined, ["code"]),
  item("sym-npm",     3, "symbols", "pnpm add react@latest",           undefined, ["code"]),

  // ── Level 4 ──
  item("sym-ternary", 4, "symbols", "hp > 0 ? 'alive' : 'dead'",                undefined, ["code"]),
  item("sym-map",     4, "symbols", "items.map((i) => i.name).join(', ')",       undefined, ["code"]),
  item("sym-sql",     4, "symbols", "SELECT * FROM users WHERE id > 5;",         undefined, ["code"]),
  item("sym-cli",     4, "symbols", "curl -X POST https://api.example.com",      undefined, ["code"]),
  item("sym-pangram", 4, "symbols", "The quick brown fox jumps over the lazy dog",undefined, ["sentence"]),
  item("sym-regex",   4, "symbols", "/^[a-z]+@[a-z]+\\.[a-z]{2,}$/",            undefined, ["code"]),
];

// ═══════════════════════════════════════
// Time attack — 短めテンポ重視
// ═══════════════════════════════════════

const timeAttackJpItems: PracticeItem[] = [
  item("ta-jp-neko",  1, "japanese", "猫",       "ねこ",       ["word"]),
  item("ta-jp-inu",   1, "japanese", "犬",       "いぬ",       ["word"]),
  item("ta-jp-eki",   1, "japanese", "駅",       "えき",       ["word"]),
  item("ta-jp-kasa",  1, "japanese", "傘",       "かさ",       ["word"]),
  item("ta-jp-heya",  1, "japanese", "部屋",     "へや",       ["word"]),
  item("ta-jp-mise",  1, "japanese", "店",       "みせ",       ["word"]),
  item("ta-jp-mizu",  1, "japanese", "水",       "みず",       ["word"]),
  item("ta-jp-hana",  1, "japanese", "花",       "はな",       ["word"]),
  item("ta-jp-sora",  1, "japanese", "空",       "そら",       ["word"]),
  item("ta-jp-yume",  1, "japanese", "夢",       "ゆめ",       ["word"]),
  item("ta-jp-ohayo", 1, "japanese", "おはよう", "おはよう",   ["phrase"]),
  item("ta-jp-ariga", 1, "japanese", "ありがとう","ありがとう", ["phrase"]),
  item("ta-jp-ganba", 1, "japanese", "がんばって","がんばって", ["phrase"]),
  item("ta-jp-daijo", 1, "japanese", "大丈夫",   "だいじょうぶ",["phrase"]),
  item("ta-jp-tadai", 1, "japanese", "ただいま", "ただいま",   ["phrase"]),
  item("ta-jp-okaer", 1, "japanese", "おかえり", "おかえり",   ["phrase"]),
];

const timeAttackSymItems: PracticeItem[] = [
  item("ta-sym-asdf",   1, "symbols", "asdf",     undefined, ["home"]),
  item("ta-sym-jkl",    1, "symbols", "jkl;",     undefined, ["home"]),
  item("ta-sym-the",    1, "symbols", "the",       undefined, ["word"]),
  item("ta-sym-code",   1, "symbols", "code",      undefined, ["word"]),
  item("ta-sym-type",   1, "symbols", "type",      undefined, ["word"]),
  item("ta-sym-key",    1, "symbols", "key",       undefined, ["word"]),
  item("ta-sym-run",    1, "symbols", "run",       undefined, ["word"]),
  item("ta-sym-hello",  1, "symbols", "hello",     undefined, ["word"]),
  item("ta-sym-world",  1, "symbols", "world",     undefined, ["word"]),
  item("ta-sym-quick",  1, "symbols", "quick",     undefined, ["word"]),
  item("ta-sym-good",   1, "symbols", "good",      undefined, ["word"]),
  item("ta-sym-done",   1, "symbols", "done",      undefined, ["word"]),
  item("ta-sym-fast",   1, "symbols", "fast",      undefined, ["word"]),
  item("ta-sym-jump",   1, "symbols", "jump",      undefined, ["word"]),
  item("ta-sym-pnpm",   1, "symbols", "pnpm",      undefined, ["code"]),
  item("ta-sym-git",    1, "symbols", "git",        undefined, ["code"]),
];

export function makePracticeSession(mode: PracticeMode, previous?: PracticeSession): PracticeSession {
  const practiceItem = choosePracticeItem(mode, previous);

  return {
    mode,
    item: practiceItem,
    stage: previous ? previous.stage + (previous.mistakes.length <= 1 ? 1 : 0) : 1,
    target: practiceItem.target,
    typed: "",
    currentBuffer: "",
    nextExpected: firstExpected(practiceItem),
    correctCount: 0,
    totalKeypresses: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: []
  };
}

export function makeTimeAttackSession(mode: PracticeMode): PracticeSession {
  const items = mode === "japanese" ? timeAttackJpItems : timeAttackSymItems;
  const practiceItem = items[Math.floor(Math.random() * items.length)];

  return {
    mode,
    item: practiceItem,
    stage: 1,
    target: practiceItem.target,
    typed: "",
    currentBuffer: "",
    nextExpected: firstExpected(practiceItem),
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
  const stage = previous ? previous.stage + (previous.mistakes.length <= 1 ? 1 : 0) : 1;
  const highestLevel = Math.min(4, Math.max(1, stage));
  const candidates = items.filter((c) => c.level <= highestLevel);
  const previousId = previous?.item.id;
  const filtered = candidates.length > 1 ? candidates.filter((c) => c.id !== previousId) : candidates;

  if (!previous || previous.mistakes.length === 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  const missed = new Set(previous.mistakes.map((m) => m.expected).filter(Boolean));
  const weighted = filtered.flatMap((c) => {
    const weight = [...missed].some((ch) => c.target.includes(ch)) ? 3 : 1;
    return Array.from({ length: weight }, () => c);
  });
  return weighted[Math.floor(Math.random() * weighted.length)] ?? filtered[0];
}

function item(id: string, level: number, mode: PracticeMode, display: string, reading: string | undefined, tags: string[]): PracticeItem {
  const target = mode === "japanese" ? canonicalRomaji(japaneseToRomajiTokens(reading ?? display)) : display;
  return { id, level, mode, display, reading, target, tags };
}

function firstExpected(item: PracticeItem): string {
  return nextExpectedForItem(item, "");
}
