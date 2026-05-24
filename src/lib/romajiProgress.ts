import { RomajiToken } from "./romaji";

export function currentRomajiBuffer(typed: string, tokens: RomajiToken[]): string {
  return inspectProgress(typed.toLowerCase(), tokens)?.buffer ?? "";
}

export function nextRomajiChars(typed: string, tokens: RomajiToken[]): string[] {
  const chars = inspectProgress(typed.toLowerCase(), tokens)?.nextChars ?? [];
  return [...new Set(chars)].filter(Boolean);
}

function inspectProgress(
  typed: string,
  tokens: RomajiToken[],
  tokenIndex = 0
): { buffer: string; nextChars: string[] } | undefined {
  if (tokenIndex >= tokens.length) return { buffer: "", nextChars: [] };

  const token = tokens[tokenIndex];
  for (const option of token.options) {
    const lower = option.toLowerCase();

    if (typed === "") {
      return { buffer: "", nextChars: token.options.map((candidate) => candidate[0] ?? "") };
    }

    if (lower === typed) {
      return inspectProgress("", tokens, tokenIndex + 1);
    }

    if (lower.startsWith(typed)) {
      return {
        buffer: typed,
        nextChars: lower.length > typed.length ? [lower[typed.length]] : nextRomajiChars("", tokens.slice(tokenIndex + 1))
      };
    }

    if (typed.startsWith(lower)) {
      const next = inspectProgress(typed.slice(lower.length), tokens, tokenIndex + 1);
      if (next) return next;
    }
  }

  return undefined;
}
