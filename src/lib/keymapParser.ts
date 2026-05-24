import { KeyboardLayout, KeyBinding, KeyPosition, Layer, ParsedKeymap } from "../types";
import { displayKeyName, keyNameToChars } from "./keyNames";

type RawLayoutJson = {
  id?: string;
  name?: string;
  layouts?: Record<string, { layout?: KeyPosition[] }>;
};

const fixedArity: Record<string, number> = {
  kp: 1,
  lt: 2,
  mt: 2,
  mo: 1,
  to: 1,
  trans: 0,
  none: 0,
  mkp: 1,
  sys_reset: 0,
  studio_unlock: 0,
  bootloader: 0
};

export function parseLayoutJson(jsonText: string): KeyboardLayout {
  const raw = JSON.parse(jsonText) as RawLayoutJson;
  const firstLayout = raw.layouts ? Object.values(raw.layouts)[0] : undefined;
  const positions = firstLayout?.layout;

  if (!raw.id || !raw.name || !positions?.length) {
    throw new Error("JSON layout must contain id, name, and layouts.*.layout.");
  }

  return {
    id: raw.id,
    name: raw.name,
    positions: positions.map((pos) => ({
      row: Number(pos.row),
      col: Number(pos.col),
      x: Number(pos.x),
      y: Number(pos.y)
    }))
  };
}

export function parseZmkKeymap(keymapText: string, expectedKeys?: number): { layers: Layer[]; warnings: string[] } {
  const warnings: string[] = [];
  const keymapBlock = extractKeymapBlock(stripComments(keymapText));
  if (!keymapBlock) {
    throw new Error("Could not find a ZMK keymap block.");
  }

  const layers: Layer[] = [];
  const layerPattern = /([A-Za-z0-9_-]+)\s*\{([\s\S]*?)\n\s*\};/g;
  let match: RegExpExecArray | null;

  while ((match = layerPattern.exec(keymapBlock))) {
    const [, name, body] = match;
    const bindingsMatch = body.match(/bindings\s*=\s*<([\s\S]*?)>\s*;/);
    if (!bindingsMatch) continue;

    const displayName = body.match(/display-name\s*=\s*"([^"]+)"/)?.[1] ?? name;
    const bindings = parseBindings(bindingsMatch[1]);
    if (expectedKeys && bindings.length !== expectedKeys) {
      warnings.push(`${name}: expected ${expectedKeys} bindings, parsed ${bindings.length}.`);
    }

    layers.push({
      id: layers.length,
      name,
      displayName,
      bindings
    });
  }

  if (layers.length === 0) {
    throw new Error("No layers with bindings were found in the keymap block.");
  }

  return { layers, warnings };
}

export function parseKeymapFiles(layoutJsonText: string, keymapText: string): ParsedKeymap {
  const layout = parseLayoutJson(layoutJsonText);
  const parsed = parseZmkKeymap(keymapText, layout.positions.length);
  return {
    layout,
    layers: parsed.layers,
    warnings: parsed.warnings
  };
}

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function extractKeymapBlock(text: string): string | undefined {
  const start = text.indexOf("keymap");
  if (start < 0) return undefined;
  const open = text.indexOf("{", start);
  if (open < 0) return undefined;

  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) {
      return text.slice(open + 1, index);
    }
  }

  return undefined;
}

function parseBindings(bindingsText: string): KeyBinding[] {
  const tokens = bindingsText
    .replaceAll(",", " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const bindings: KeyBinding[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    if (!token.startsWith("&")) {
      index += 1;
      continue;
    }

    const behavior = token.slice(1);
    const arity = fixedArity[behavior];
    let params: string[];

    if (behavior === "bt") {
      params = [];
      index += 1;
      while (index < tokens.length && !tokens[index].startsWith("&")) {
        params.push(tokens[index]);
        index += 1;
      }
    } else if (arity !== undefined) {
      params = tokens.slice(index + 1, index + 1 + arity);
      index += 1 + arity;
    } else {
      params = [];
      index += 1;
      while (index < tokens.length && !tokens[index].startsWith("&")) {
        params.push(tokens[index]);
        index += 1;
      }
    }

    bindings.push(makeBinding(behavior, params));
  }

  return bindings;
}

function makeBinding(behavior: string, params: string[]): KeyBinding {
  const outputKey = behavior === "kp" ? params[0] : behavior === "lt" || behavior === "mt" ? params.at(-1) : undefined;
  const outputChars = keyNameToChars(outputKey);
  const supported = ["kp", "lt", "mt", "mo", "to", "trans", "none"].includes(behavior);

  return {
    behavior,
    params,
    raw: [`&${behavior}`, ...params].join(" "),
    display: bindingDisplay(behavior, params),
    outputChars,
    supported
  };
}

function bindingDisplay(behavior: string, params: string[]): string {
  if (behavior === "trans") return "▽";
  if (behavior === "none") return "×";
  if (behavior === "kp") return displayKeyName(params[0]);
  if (behavior === "lt") return `${displayKeyName(params[1])}\nL${params[0]}`;
  if (behavior === "mt") return `${displayKeyName(params[1])}\n${displayKeyName(params[0])}`;
  if (behavior === "mo") return `MO ${params[0]}`;
  if (behavior === "to") return `TO ${params[0]}`;
  return [`&${behavior}`, ...params].join(" ");
}
