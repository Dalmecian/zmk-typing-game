import { AdventureState, StatusAilment } from "../types";

type GameHudProps = {
  stage: number;
  combo: number;
  accuracy: number;
  miss: number;
  adventure: AdventureState;
};

export function GameHud({ stage, combo, accuracy, miss, adventure }: GameHudProps) {
  const hpPct = Math.max(0, (adventure.hp / adventure.maxHp) * 100);
  const hpClass = hpPct > 50 ? "hp-high" : hpPct > 25 ? "hp-mid" : "hp-low";

  const xpForNext = xpThreshold(adventure.level);
  const xpPct = Math.min(100, (adventure.xp / xpForNext) * 100);

  const comboClass =
    combo >= 20 ? "rainbow" : combo >= 10 ? "pulse" : combo >= 5 ? "glow" : "";

  return (
    <div className="game-hud" aria-label="ステータス">
      <div className="hud-item">
        <span>Stg</span>
        <strong>{stage}</strong>
      </div>

      <div className="hud-sep" />

      <div className="hud-item">
        <span>Lv</span>
        <strong>{adventure.level}</strong>
      </div>

      <div className="hud-sep" />

      <div className="hud-item hp-bar-wrap">
        <span>HP</span>
        <div className="hp-bar-track">
          <div
            className={`hp-bar-fill ${hpClass}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <strong>{adventure.hp}</strong>
      </div>

      <div className="hud-sep" />

      <div className="hud-item xp-bar-wrap">
        <span>XP</span>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <div className="hud-sep" />

      <div className={`hud-item hud-combo ${comboClass}`}>
        <span>Combo</span>
        <strong>{combo}</strong>
      </div>

      <div className="hud-sep" />

      <div className="hud-item">
        <span>Acc</span>
        <strong>{accuracy}%</strong>
      </div>

      <div className={`hud-item ${miss > 0 ? "warn" : ""}`}>
        <span>Miss</span>
        <strong>{miss}</strong>
      </div>

      {adventure.ailment && (
        <>
          <div className="hud-sep" />
          <AilmentBadge ailment={adventure.ailment} />
        </>
      )}
    </div>
  );
}

function AilmentBadge({ ailment }: { ailment: NonNullable<StatusAilment> }) {
  const labels: Record<NonNullable<StatusAilment>, string> = {
    poison: "POISON",
    confusion: "CONFUSE",
    slow: "SLOW",
  };
  return <span className={`ailment-icon ${ailment}`}>{labels[ailment]}</span>;
}

export function xpThreshold(level: number): number {
  return 50 + level * 30;
}
