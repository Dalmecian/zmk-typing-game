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
  const progress = session.target.length > 0
    ? Math.round((typed.length / session.target.length) * 100)
    : 0;

  return (
    <section className="prompt-lane" aria-label="課題">
      <div className="prompt-header">
        <p className="prompt-label">{areaName(session.stage)}</p>
        <div className="prompt-progress">
          <div className="prompt-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
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

function areaName(stage: number): string {
  if (stage <= 3) return "はじまりの草原";
  if (stage <= 6) return "静かな森";
  if (stage <= 10) return "古びた図書館";
  if (stage <= 15) return "にぎやかな街";
  if (stage <= 20) return "雲の上の塔";
  if (stage <= 30) return "深淵の洞窟";
  if (stage <= 40) return "星降る峠";
  if (stage <= 50) return "竜の祭壇";
  return "伝説の頂";
}
