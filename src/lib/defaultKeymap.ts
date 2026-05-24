import defaultLayoutJson from "../assets/default-keymap/AroundForty-RB.json?raw";
import defaultKeymapText from "../assets/default-keymap/AroundForty-RB.keymap?raw";
import { parseKeymapFiles } from "./keymapParser";

export function loadDefaultKeymap() {
  return parseKeymapFiles(defaultLayoutJson, defaultKeymapText);
}
