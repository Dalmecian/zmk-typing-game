import { describe, expect, it } from "vitest";
import { applyKey } from "./inputEngine";
import { allPracticeItems, makePracticeSession } from "./practice";

describe("input engine", () => {
  it("keeps Japanese display text separate from romaji target", () => {
    const item = allPracticeItems("japanese").find((candidate) => candidate.id === "jp-phrase-lost-key");
    expect(item?.display).toBe("鍵をなくしたリル");
    expect(item?.reading).toBe("かぎをなくしたりる");
    expect(item?.target).toBe("kagiwonakushitariru");
    expect(item?.target).not.toContain("鍵");
  });

  it("accepts keys and backspace without losing the buffer", () => {
    let session = makePracticeSession("japanese");
    session = {
      ...session,
      item: allPracticeItems("japanese")[0],
      target: allPracticeItems("japanese")[0].target,
      nextExpected: "r"
    };

    const first = applyKey("r", session, () => undefined, 1000);
    expect(first.status).toBe("accepted");
    expect(first.session.typed).toBe("r");
    expect(first.session.currentBuffer).toBe("r");

    const second = applyKey("i", first.session, () => undefined, 1001);
    expect(second.status).toBe("accepted");
    expect(second.session.typed).toBe("ri");

    const third = applyKey("Backspace", second.session, () => undefined, 1002);
    expect(third.session.typed).toBe("r");
    expect(third.session.currentBuffer).toBe("r");
  });

  it("rejects wrong keys without advancing the target", () => {
    const session = makePracticeSession("symbols");
    const result = applyKey("?", session, () => undefined, 1000);
    expect(result.status).toBe("rejected");
    expect(result.session.typed).toBe("");
    expect(result.session.mistakes).toHaveLength(1);
  });
});
