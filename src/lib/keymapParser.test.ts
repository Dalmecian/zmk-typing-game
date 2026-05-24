import { describe, expect, it } from "vitest";
import { parseKeymapFiles } from "./keymapParser";

const layoutJson = JSON.stringify({
  id: "AroundForty-RB",
  name: "AroundForty-RB",
  layouts: {
    default_layout: {
      layout: Array.from({ length: 4 }, (_, index) => ({ row: 1, col: index, x: index, y: 1 }))
    }
  },
  sensors: []
});

const keymapText = `
/ {
  keymap {
    compatible = "zmk,keymap";

    Win-Base {
      display-name = "Win-Base";
      bindings = <
        &kp Q &lt 1 SPACE &mt LEFT_SHIFT Z &kp COMMA
      >;
    };

    Win-Fnc {
      display-name = "Win-Fnc";
      bindings = <
        &kp EXCLAMATION &trans &kp LC(A) &kp AT_SIGN
      >;
    };
  };
};
`;

describe("keymap parser", () => {
  it("parses layout JSON and ZMK layers", () => {
    const parsed = parseKeymapFiles(layoutJson, keymapText);
    expect(parsed.layout.positions).toHaveLength(4);
    expect(parsed.layers.map((layer) => layer.name)).toEqual(["Win-Base", "Win-Fnc"]);
    expect(parsed.layers[0].bindings[1]).toMatchObject({
      behavior: "lt",
      params: ["1", "SPACE"],
      outputChars: [" "]
    });
    expect(parsed.layers[0].bindings[2]).toMatchObject({
      behavior: "mt",
      params: ["LEFT_SHIFT", "Z"],
      outputChars: ["z"]
    });
  });

  it("keeps modifier notation displayable", () => {
    const parsed = parseKeymapFiles(layoutJson, keymapText);
    expect(parsed.layers[1].bindings[2].raw).toBe("&kp LC(A)");
    expect(parsed.layers[1].bindings[2].outputChars).toEqual(["a"]);
  });
});
