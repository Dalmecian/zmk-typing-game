type GameHudProps = {
  stage: number;
  combo: number;
  accuracy: number;
  miss: number;
};

export function GameHud({ stage, combo, accuracy, miss }: GameHudProps) {
  return (
    <div className="game-hud" aria-label="ステータス">
      <HudItem label="Stage" value={stage} />
      <HudItem label="Combo" value={combo} />
      <HudItem label="Accuracy" value={`${accuracy}%`} />
      <HudItem label="Miss" value={miss} tone={miss > 0 ? "warn" : undefined} />
    </div>
  );
}

function HudItem({ label, value, tone }: { label: string; value: string | number; tone?: "warn" }) {
  return (
    <div className={`hud-item ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
