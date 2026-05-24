import { PracticeSession } from "../types";

type PromptLaneProps = {
  session: PracticeSession;
  sparkle?: boolean;
};

export function PromptLane({ session, sparkle }: PromptLaneProps) {
  const typed = session.typed;
  const remaining = session.target.slice(typed.length);
  const current = remaining[0] ?? "";
  const rest = remaining.slice(1);

  return (
    <section className="prompt-lane" aria-label="課題">
      <p className="prompt-label">{labelForLevel(session.stage)}</p>
      <h1>{session.item.display}</h1>
      {session.item.reading && session.item.reading !== session.item.display && <p className="reading">{session.item.reading}</p>}
      <div className="romaji-track" aria-label="入力進捗">
        <span className="romaji-typed">{typed}</span>
        {current && <span className={`romaji-current${sparkle ? " sparkle" : ""}`}>{current}</span>}
        <span className="romaji-rest">{rest}</span>
      </div>
    </section>
  );
}

function labelForLevel(level: number): string {
  if (level === 1) return "Word";
  if (level === 2) return "Phrase";
  if (level === 3) return "Sentence";
  return "Symbols";
}
