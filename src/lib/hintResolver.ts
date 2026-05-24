import { KeyBinding, Layer, ResolvedHint } from "../types";

export function resolveHint(char: string, layers: Layer[], baseLayerName: string): ResolvedHint | undefined {
  const normalized = normalizeTargetChar(char);
  if (!normalized) return undefined;

  const baseLayer = layers.find((layer) => layer.name === baseLayerName) ?? layers[0];
  const direct = findInLayer(normalized, baseLayer);
  if (direct) {
    return {
      char,
      layerName: baseLayer.displayName,
      keyIndex: direct.keyIndex,
      binding: direct.binding,
      instruction: `${baseLayer.displayName} の ${direct.binding.display.replace(/\n/g, " / ")} を押す`
    };
  }

  for (const [viaLayerKeyIndex, viaLayerBinding] of baseLayer.bindings.entries()) {
    const layerId = layerIdFromHoldBinding(viaLayerBinding);
    if (layerId === undefined) continue;
    const layer = layers[layerId];
    if (!layer) continue;

    const candidate = findInLayer(normalized, layer);
    if (!candidate) continue;

    return {
      char,
      layerName: layer.displayName,
      keyIndex: candidate.keyIndex,
      binding: candidate.binding,
      viaLayerKeyIndex,
      viaLayerBinding,
      instruction: `${baseLayer.displayName} の ${viaLayerBinding.display.replace(/\n/g, " / ")} で ${layer.displayName} を使い、${candidate.binding.display.replace(/\n/g, " / ")} を押す`
    };
  }

  for (const layer of layers) {
    const candidate = findInLayer(normalized, layer);
    if (candidate) {
      return {
        char,
        layerName: layer.displayName,
        keyIndex: candidate.keyIndex,
        binding: candidate.binding,
        instruction: `${layer.displayName} の ${candidate.binding.display.replace(/\n/g, " / ")} を押す`
      };
    }
  }

  return undefined;
}

export function layerIdFromHoldBinding(binding: KeyBinding): number | undefined {
  if (binding.behavior === "lt" || binding.behavior === "mo" || binding.behavior === "to") {
    const layerId = Number(binding.params[0]);
    return Number.isFinite(layerId) ? layerId : undefined;
  }
  return undefined;
}

function findInLayer(char: string, layer: Layer): { keyIndex: number; binding: KeyBinding } | undefined {
  for (const [keyIndex, binding] of layer.bindings.entries()) {
    if (binding.outputChars.map(normalizeTargetChar).includes(char)) {
      return { keyIndex, binding };
    }
  }
  return undefined;
}

function normalizeTargetChar(char: string): string {
  return char === "\n" ? "\n" : char.toLowerCase();
}
