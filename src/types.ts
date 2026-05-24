export type KeyPosition = {
  row: number;
  col: number;
  x: number;
  y: number;
};

export type KeyboardLayout = {
  id: string;
  name: string;
  positions: KeyPosition[];
};

export type KeyBinding = {
  behavior: string;
  params: string[];
  raw: string;
  display: string;
  outputChars: string[];
  supported: boolean;
};

export type Layer = {
  id: number;
  name: string;
  displayName: string;
  bindings: KeyBinding[];
};

export type ParsedKeymap = {
  layout: KeyboardLayout;
  layers: Layer[];
  warnings: string[];
};

export type ResolvedHint = {
  char: string;
  layerName: string;
  keyIndex: number;
  binding: KeyBinding;
  viaLayerKeyIndex?: number;
  viaLayerBinding?: KeyBinding;
  instruction: string;
};

export type MistakeEvent = {
  expected: string;
  actual: string;
  index: number;
  at: number;
  hint?: ResolvedHint;
};

export type PracticeMode = "symbols" | "japanese";

export type PracticeItem = {
  id: string;
  level: number;
  mode: PracticeMode;
  display: string;
  reading?: string;
  target: string;
  tags: string[];
};

export type PracticeSession = {
  mode: PracticeMode;
  item: PracticeItem;
  stage: number;
  target: string;
  typed: string;
  currentBuffer: string;
  nextExpected: string;
  startedAt?: number;
  completedAt?: number;
  correctCount: number;
  totalKeypresses: number;
  streak: number;
  bestStreak: number;
  mistakes: MistakeEvent[];
};
