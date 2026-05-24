import { KeyboardLayout, Layer } from "../types";
import { layerIdFromHoldBinding } from "../lib/hintResolver";

type KeyboardViewProps = {
  layout: KeyboardLayout;
  layers: Layer[];
  activeLayerName: string;
  highlightKeyIndex?: number;
  layerKeyIndex?: number;
  onLayerChange: (layerName: string) => void;
};

export function KeyboardView({
  layout,
  layers,
  activeLayerName,
  highlightKeyIndex,
  layerKeyIndex,
  onLayerChange
}: KeyboardViewProps) {
  const activeLayer = layers.find((layer) => layer.name === activeLayerName) ?? layers[0];
  const maxX = Math.max(...layout.positions.map((position) => position.x));
  const maxY = Math.max(...layout.positions.map((position) => position.y));

  return (
    <section className="keyboard-panel" aria-label="キーボード">
      <div className="panel-header">
        <h2>Layer map</h2>
        <select value={activeLayer.name} onChange={(event) => onLayerChange(event.target.value)}>
          {layers.map((layer) => (
            <option key={layer.name} value={layer.name}>
              {layer.displayName}
            </option>
          ))}
        </select>
      </div>
      <div
        className="keyboard"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(maxX) + 1}, minmax(34px, 1fr))`,
          gridTemplateRows: `repeat(${Math.ceil(maxY) + 1}, minmax(42px, auto))`
        }}
      >
        {layout.positions.map((position, index) => {
          const binding = activeLayer.bindings[index];
          const isTarget = index === highlightKeyIndex;
          const isLayerKey = index === layerKeyIndex;
          const layerId = binding ? layerIdFromHoldBinding(binding) : undefined;

          return (
            <button
              className={`key ${isTarget ? "target" : ""} ${isLayerKey ? "layer-source" : ""}`}
              key={`${position.row}-${position.col}-${index}`}
              style={{
                gridColumn: `${Math.round(position.x) + 1} / span 1`,
                gridRow: `${Math.round(position.y)} / span 1`
              }}
              title={binding?.raw ?? "empty"}
              type="button"
              onClick={() => layerId !== undefined && layers[layerId] ? onLayerChange(layers[layerId].name) : undefined}
            >
              <span>{binding?.display ?? "?"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
