import { describe, expect, it } from "vitest";
import { canonicalRomaji, isRomajiComplete, isRomajiPrefix, japaneseToRomajiTokens } from "./romaji";

describe("romaji", () => {
  it("accepts practical IME alternatives", () => {
    const tokens = japaneseToRomajiTokens("しちつ");
    expect(isRomajiComplete("shichitsu", tokens)).toBe(true);
    expect(isRomajiComplete("sititu", tokens)).toBe(true);
  });

  it("handles sokuon and digraphs", () => {
    const tokens = japaneseToRomajiTokens("きょう、ちゃっと");
    expect(canonicalRomaji(tokens)).toBe("kyou,chatto");
    expect(isRomajiPrefix("kyou,chatt", tokens)).toBe(true);
    expect(isRomajiComplete("kyou,chatto", tokens)).toBe(true);
  });

  it("allows n and nn for ん", () => {
    const tokens = japaneseToRomajiTokens("りん");
    expect(isRomajiComplete("rin", tokens)).toBe(true);
    expect(isRomajiComplete("rinn", tokens)).toBe(true);
  });
});
