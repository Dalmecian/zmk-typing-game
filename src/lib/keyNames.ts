const letterNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const baseKeyChars: Record<string, string[]> = {
  ...Object.fromEntries(letterNames.map((letter) => [letter, [letter.toLowerCase()]])),
  N0: ["0"],
  N1: ["1"],
  N2: ["2"],
  N3: ["3"],
  N4: ["4"],
  N5: ["5"],
  N6: ["6"],
  N7: ["7"],
  N8: ["8"],
  N9: ["9"],
  NUMBER_0: ["0"],
  NUMBER_1: ["1"],
  NUMBER_2: ["2"],
  NUMBER_3: ["3"],
  NUMBER_4: ["4"],
  NUMBER_5: ["5"],
  NUMBER_6: ["6"],
  NUMBER_7: ["7"],
  NUMBER_8: ["8"],
  NUMBER_9: ["9"],
  SPACE: [" "],
  TAB: ["\t"],
  ENTER: ["\n"],
  COMMA: [","],
  DOT: ["."],
  PERIOD: ["."],
  SLASH: ["/"],
  FSLH: ["/"],
  BACKSLASH: ["\\"],
  MINUS: ["-"],
  EQUAL: ["="],
  PLUS: ["+"],
  UNDER: ["_"],
  UNDERSCORE: ["_"],
  AT: ["@"],
  AT_SIGN: ["@"],
  HASH: ["#"],
  CARET: ["^"],
  PERCENT: ["%"],
  DOLLAR: ["$"],
  AMPERSAND: ["&"],
  ASTERISK: ["*"],
  ASTRK: ["*"],
  EXCL: ["!"],
  EXCLAMATION: ["!"],
  QUESTION: ["?"],
  DOUBLE_QUOTES: ['"'],
  SINGLE_QUOTE: ["'"],
  GRAVE: ["`"],
  TILDE: ["~"],
  COLON: [":"],
  SEMICOLON: [";"],
  LEFT_PARENTHESIS: ["("],
  RIGHT_PARENTHESIS: [")"],
  LEFT_BRACKET: ["["],
  RIGHT_BRACKET: ["]"],
  LEFT_BRACE: ["{"],
  RIGHT_BRACE: ["}"],
  LESS_THAN: ["<"],
  GREATER_THAN: [">"]
};

export function keyNameToChars(keyName: string | undefined): string[] {
  if (!keyName) return [];
  const normalized = keyName.replace(/^&/, "").trim();
  if (baseKeyChars[normalized]) return baseKeyChars[normalized];

  const nested = normalized.match(/^(?:L[CGAS]|R[CGAS]|LC|LG|LA|LS|RC|RG|RA|RS)\((.+)\)$/);
  if (nested) {
    return keyNameToChars(nested[1]);
  }

  return [];
}

export function displayKeyName(keyName: string | undefined): string {
  if (!keyName) return "";
  return keyName
    .replace("LEFT_", "L")
    .replace("RIGHT_", "R")
    .replace("_ARROW", "")
    .replaceAll("_", " ");
}
