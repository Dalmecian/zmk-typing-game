import { describe, expect, it } from "vitest";
import { allPracticeItems } from "./practice";

describe("practice items", () => {
  it("starts with short Japanese words", () => {
    const levelOne = allPracticeItems("japanese").filter((item) => item.level === 1);
    expect(levelOne.map((item) => item.reading)).toEqual(expect.arrayContaining(["りる", "かぎ", "ゆび", "れいや", "きー", "まほう"]));
    expect(levelOne.every((item) => item.target.length <= 6)).toBe(true);
  });

  it("includes natural Japanese symbol sentences", () => {
    const symbolItems = allPracticeItems("japanese").filter((item) => item.tags.includes("symbol"));
    expect(symbolItems.map((item) => item.display)).toEqual(expect.arrayContaining(["リル「それ、違うわよ」", "メモ: キーは逃げない"]));
    expect(symbolItems.some((item) => item.target.includes(":") || item.target.includes("[") || item.target.includes("]"))).toBe(true);
  });
});
