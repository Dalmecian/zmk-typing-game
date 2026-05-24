import { KeyboardLayout, ResolvedHint } from "../types";
import { KeyMiniMap } from "./KeyMiniMap";

type NextKeyCoachProps = {
  char: string;
  hint?: ResolvedHint;
  layout?: KeyboardLayout;
  isMistake: boolean;
};

export function NextKeyCoach({ char, hint, layout, isMistake }: NextKeyCoachProps) {
  return (
    <section className={`next-coach ${isMistake ? "mistake" : ""}`} aria-label="次のキー">
      <div>
        <p className="coach-kicker">{isMistake ? "Miss -ここを押す" : "Next key"}</p>
        <strong>{displayChar(char)}</strong>
        <span>{hint ? compactInstruction(hint.instruction) : "keymap から位置を探せません"}</span>
      </div>
      {layout && (
        <KeyMiniMap
          layout={layout}
          targetKeyIndex={hint?.keyIndex}
          layerKeyIndex={hint?.viaLayerKeyIndex}
          targetBinding={hint?.binding}
          layerBinding={hint?.viaLayerBinding}
        />
      )}
    </section>
  );
}

function displayChar(char: string): string {
  if (char === " ") return "Space";
  if (char === "\n") return "Enter";
  return char || "Done";
}

function compactInstruction(instruction: string): string {
  return instruction.replace(/\s+/g, " ").replace(" を押す", "");
}
