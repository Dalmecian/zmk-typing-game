import { KeyboardLayout, KeyBinding } from "../types";

type KeyMiniMapProps = {
  layout: KeyboardLayout;
  targetKeyIndex?: number;
  layerKeyIndex?: number;
  targetBinding?: KeyBinding;
  layerBinding?: KeyBinding;
};

export function KeyMiniMap({ layout, targetKeyIndex, layerKeyIndex, targetBinding, layerBinding }: KeyMiniMapProps) {
  const maxX = Math.max(...layout.positions.map((position) => position.x));
  const maxY = Math.max(...layout.positions.map((position) => position.y));

  return (
    <div
      className="mini-map"
      aria-label="押す場所"
      style={{
        gridTemplateColumns: `repeat(${Math.ceil(maxX) + 1}, minmax(12px, 1fr))`,
        gridTemplateRows: `repeat(${Math.ceil(maxY) + 1}, 16px)`
      }}
    >
      {layout.positions.map((position, index) => {
        const isLayer = index === layerKeyIndex;
        const isTarget = index === targetKeyIndex;
        const label = isTarget ? targetBinding?.display : isLayer ? layerBinding?.display : "";
        return (
          <span
            aria-label={label}
            className={`mini-key ${isLayer ? "layer" : ""} ${isTarget ? "target" : ""}`}
            key={`${position.row}-${position.col}-${index}`}
            style={{
              gridColumn: `${Math.round(position.x) + 1} / span 1`,
              gridRow: `${Math.round(position.y)} / span 1`
            }}
          />
        );
      })}
    </div>
  );
}
