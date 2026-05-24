import { MistakeEvent, PracticeItem, PracticeSession, ResolvedHint } from "../types";
import { isRomajiComplete, isRomajiPrefix } from "./romaji";
import { bufferForItem, itemTokens, nextExpectedForItem } from "./practice";

export type InputResult =
  | { status: "accepted"; session: PracticeSession }
  | { status: "rejected"; session: PracticeSession; mistake: MistakeEvent }
  | { status: "completed"; session: PracticeSession };

export function applyKey(
  key: string,
  session: PracticeSession,
  resolve: (expected: string) => ResolvedHint | undefined,
  now = Date.now()
): InputResult {
  if (session.completedAt) return { status: "completed", session };
  if (key.length !== 1 && key !== "Backspace" && key !== " ") return { status: "accepted", session };

  if (key === "Backspace") {
    const typed = session.typed.slice(0, -1);
    return {
      status: "accepted",
      session: {
        ...session,
        typed,
        currentBuffer: bufferForItem(session.item, typed),
        nextExpected: nextExpectedForItem(session.item, typed)
      }
    };
  }

  const actual = key === " " ? " " : key;
  const candidate = session.typed + actual;
  const accepted = acceptsCandidate(session.item, candidate);

  if (!accepted) {
    const expected = session.nextExpected || nextExpectedForItem(session.item, session.typed);
    const mistake: MistakeEvent = {
      expected,
      actual,
      index: session.typed.length,
      at: now,
      hint: resolve(expected)
    };

    return {
      status: "rejected",
      mistake,
      session: {
        ...session,
        startedAt: session.startedAt ?? now,
        totalKeypresses: session.totalKeypresses + 1,
        streak: 0,
        mistakes: [...session.mistakes, mistake]
      }
    };
  }

  const complete = completesCandidate(session.item, candidate);
  const nextSession: PracticeSession = {
    ...session,
    startedAt: session.startedAt ?? now,
    completedAt: complete ? now : undefined,
    typed: candidate,
    currentBuffer: bufferForItem(session.item, candidate),
    nextExpected: nextExpectedForItem(session.item, candidate),
    correctCount: session.correctCount + 1,
    totalKeypresses: session.totalKeypresses + 1,
    streak: session.streak + 1,
    bestStreak: Math.max(session.bestStreak, session.streak + 1)
  };

  return { status: complete ? "completed" : "accepted", session: nextSession };
}

function acceptsCandidate(item: PracticeItem, candidate: string): boolean {
  if (item.mode === "symbols") return item.target.startsWith(candidate);
  return isRomajiPrefix(candidate, itemTokens(item));
}

function completesCandidate(item: PracticeItem, candidate: string): boolean {
  if (item.mode === "symbols") return candidate === item.target;
  return isRomajiComplete(candidate, itemTokens(item));
}
