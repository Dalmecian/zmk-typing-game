import { describe, expect, it } from "vitest";
import { parseKeymapFiles } from "./keymapParser";
import { resolveHint } from "./hintResolver";

const layoutJson = JSON.stringify({
  id: "Test",
  name: "Test",
  layouts: {
    default_layout: {
      layout: [
        { row: 1, col: 0, x: 0, y: 1 },
        { row: 1, col: 1, x: 1, y: 1 },
        { row: 1, col: 2, x: 2, y: 1 }
      ]
    }
  }
});

const keymapText = `
/ {
  keymap {
    Base {
      bindings = <
        &kp A &lt 1 SPACE &kp B
      >;
    };
    Symbols {
      bindings = <
        &kp EXCLAMATION &trans &kp AT_SIGN
      >;
    };
  };
};
`;

describe("hint resolver", () => {
  it("resolves direct base-layer keys", () => {
    const parsed = parseKeymapFiles(layoutJson, keymapText);
    const hint = resolveHint("a", parsed.layers, "Base");
    expect(hint?.keyIndex).toBe(0);
    expect(hint?.viaLayerKeyIndex).toBeUndefined();
  });

  it("resolves keys through a layer tap binding", () => {
    const parsed = parseKeymapFiles(layoutJson, keymapText);
    const hint = resolveHint("@", parsed.layers, "Base");
    expect(hint?.layerName).toBe("Symbols");
    expect(hint?.keyIndex).toBe(2);
    expect(hint?.viaLayerKeyIndex).toBe(1);
  });
});
