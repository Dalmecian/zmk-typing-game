export type RomajiToken = {
  kana: string;
  options: string[];
};

const kanaMap: Record<string, string[]> = {
  あ: ["a"],
  い: ["i"],
  う: ["u"],
  え: ["e"],
  お: ["o"],
  か: ["ka"],
  き: ["ki"],
  く: ["ku"],
  け: ["ke"],
  こ: ["ko"],
  さ: ["sa"],
  し: ["shi", "si"],
  す: ["su"],
  せ: ["se"],
  そ: ["so"],
  た: ["ta"],
  ち: ["chi", "ti"],
  つ: ["tsu", "tu"],
  て: ["te"],
  と: ["to"],
  な: ["na"],
  に: ["ni"],
  ぬ: ["nu"],
  ね: ["ne"],
  の: ["no"],
  は: ["ha"],
  ひ: ["hi"],
  ふ: ["fu", "hu"],
  へ: ["he"],
  ほ: ["ho"],
  ま: ["ma"],
  み: ["mi"],
  む: ["mu"],
  め: ["me"],
  も: ["mo"],
  や: ["ya"],
  ゆ: ["yu"],
  よ: ["yo"],
  ら: ["ra"],
  り: ["ri"],
  る: ["ru"],
  れ: ["re"],
  ろ: ["ro"],
  わ: ["wa"],
  を: ["wo", "o"],
  ん: ["n", "nn"],
  が: ["ga"],
  ぎ: ["gi"],
  ぐ: ["gu"],
  げ: ["ge"],
  ご: ["go"],
  ざ: ["za"],
  じ: ["ji", "zi"],
  ず: ["zu"],
  ぜ: ["ze"],
  ぞ: ["zo"],
  だ: ["da"],
  ぢ: ["ji", "di"],
  づ: ["zu", "du"],
  で: ["de"],
  ど: ["do"],
  ば: ["ba"],
  び: ["bi"],
  ぶ: ["bu"],
  べ: ["be"],
  ぼ: ["bo"],
  ぱ: ["pa"],
  ぴ: ["pi"],
  ぷ: ["pu"],
  ぺ: ["pe"],
  ぽ: ["po"],
  ぁ: ["xa", "la"],
  ぃ: ["xi", "li"],
  ぅ: ["xu", "lu"],
  ぇ: ["xe", "le"],
  ぉ: ["xo", "lo"],
  ー: ["-"],
  "、": [","],
  "。": ["."],
  "，": [","],
  "．": ["."],
  "！": ["!"],
  "？": ["?"],
  "（": ["("],
  "）": [")"],
  "「": ["["],
  "」": ["]"],
  "・": ["/"],
  " ": [" "]
};

const digraphs: Record<string, string[]> = {
  きゃ: ["kya"],
  きゅ: ["kyu"],
  きょ: ["kyo"],
  しゃ: ["sha", "sya"],
  しゅ: ["shu", "syu"],
  しょ: ["sho", "syo"],
  ちゃ: ["cha", "tya", "cya"],
  ちゅ: ["chu", "tyu", "cyu"],
  ちょ: ["cho", "tyo", "cyo"],
  にゃ: ["nya"],
  にゅ: ["nyu"],
  にょ: ["nyo"],
  ひゃ: ["hya"],
  ひゅ: ["hyu"],
  ひょ: ["hyo"],
  みゃ: ["mya"],
  みゅ: ["myu"],
  みょ: ["myo"],
  りゃ: ["rya"],
  りゅ: ["ryu"],
  りょ: ["ryo"],
  ぎゃ: ["gya"],
  ぎゅ: ["gyu"],
  ぎょ: ["gyo"],
  じゃ: ["ja", "jya", "zya"],
  じゅ: ["ju", "jyu", "zyu"],
  じょ: ["jo", "jyo", "zyo"],
  びゃ: ["bya"],
  びゅ: ["byu"],
  びょ: ["byo"],
  ぴゃ: ["pya"],
  ぴゅ: ["pyu"],
  ぴょ: ["pyo"]
};

const smallTsu = new Set(["っ", "ッ"]);
const smallKana = new Set(["ゃ", "ゅ", "ょ"]);

export function japaneseToRomajiTokens(input: string): RomajiToken[] {
  const chars = [...toHiragana(input)];
  const tokens: RomajiToken[] = [];

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    if (smallTsu.has(char)) {
      const next = readKanaToken(chars, index + 1);
      if (next) {
        tokens.push({
          kana: char,
          options: next.options
            .map((option) => firstConsonant(option) + option)
            .filter((option) => option.length > 1)
        });
        index += next.length;
      }
      continue;
    }

    const token = readKanaToken(chars, index);
    if (token) {
      tokens.push({ kana: token.kana, options: token.options });
      index += token.length - 1;
      continue;
    }

    tokens.push({ kana: char, options: [char] });
  }

  return tokens;
}

export function canonicalRomaji(tokens: RomajiToken[]): string {
  return tokens.map((token) => token.options[0] ?? "").join("");
}

export function isRomajiPrefix(typed: string, tokens: RomajiToken[]): boolean {
  return matchTokens(typed.toLowerCase(), tokens, false);
}

export function isRomajiComplete(typed: string, tokens: RomajiToken[]): boolean {
  return matchTokens(typed.toLowerCase(), tokens, true);
}

function matchTokens(typed: string, tokens: RomajiToken[], requireComplete: boolean): boolean {
  const memo = new Set<string>();

  function visit(offset: number, tokenIndex: number): boolean {
    const key = `${offset}:${tokenIndex}`;
    if (memo.has(key)) return false;
    memo.add(key);

    if (offset === typed.length) {
      return requireComplete ? tokenIndex === tokens.length : true;
    }
    if (tokenIndex >= tokens.length) return false;

    for (const option of tokens[tokenIndex].options) {
      const lower = option.toLowerCase();
      const rest = typed.slice(offset);
      if (lower.startsWith(rest) && !requireComplete) return true;
      if (typed.startsWith(lower, offset) && visit(offset + lower.length, tokenIndex + 1)) return true;
    }

    return false;
  }

  return visit(0, 0);
}

function readKanaToken(chars: string[], index: number): { kana: string; options: string[]; length: number } | undefined {
  const pair = `${chars[index] ?? ""}${chars[index + 1] ?? ""}`;
  if (digraphs[pair]) return { kana: pair, options: digraphs[pair], length: 2 };

  const char = chars[index];
  if (!char || smallKana.has(char)) return undefined;
  if (kanaMap[char]) return { kana: char, options: kanaMap[char], length: 1 };
  return undefined;
}

function toHiragana(input: string): string {
  return input.replace(/[ァ-ン]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}

function firstConsonant(option: string): string {
  const first = option[0]?.toLowerCase() ?? "";
  return /^[bcdfghjklmnpqrstvwxyz]$/.test(first) ? first : "";
}
