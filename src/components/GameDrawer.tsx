import { X } from "lucide-react";
import { FileLoader } from "./FileLoader";
import { KeyboardView } from "./KeyboardView";
import { MistakeEvent, ParsedKeymap } from "../types";

type GameDrawerProps = {
  open: boolean;
  parsed: ParsedKeymap;
  activeLayerName: string;
  highlightKeyIndex?: number;
  layerKeyIndex?: number;
  mistakes: MistakeEvent[];
  warnings: string[];
  error: string;
  onClose: () => void;
  onLayerChange: (layerName: string) => void;
  onLoaded: (parsed: ParsedKeymap) => void;
  onError: (message: string) => void;
};

export function GameDrawer({
  open,
  parsed,
  activeLayerName,
  highlightKeyIndex,
  layerKeyIndex,
  mistakes,
  warnings,
  error,
  onClose,
  onLayerChange,
  onLoaded,
  onError
}: GameDrawerProps) {
  return (
    <aside className={`game-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="drawer-header">
        <div>
          <p className="prompt-label">Coach / Map / Settings</p>
          <h2>{parsed.layout.name}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="閉じる">
          <X size={18} />
        </button>
      </div>

      <KeyboardView
        layout={parsed.layout}
        layers={parsed.layers}
        activeLayerName={activeLayerName}
        highlightKeyIndex={highlightKeyIndex}
        layerKeyIndex={layerKeyIndex}
        onLayerChange={onLayerChange}
      />

      <section className="drawer-section">
        <h3>Recent miss</h3>
        <div className="mistake-list">
          {mistakes.length === 0 && <span>まだミスはありません。</span>}
          {mistakes.slice(-8).map((mistake, index) => (
            <span key={`${mistake.at}-${index}`}>
              {mistake.actual || "?"}
              {" -> "}
              {mistake.expected || "?"}
            </span>
          ))}
        </div>
      </section>

      <section className="drawer-section">
        <h3>Keymap import</h3>
        <FileLoader onLoaded={onLoaded} onError={onError} />
        {error && <p className="error">{error}</p>}
        {warnings.map((warning) => (
          <p className="warning" key={warning}>
            {warning}
          </p>
        ))}
      </section>
    </aside>
  );
}
