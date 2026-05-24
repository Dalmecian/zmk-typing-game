import { Upload } from "lucide-react";
import { ParsedKeymap } from "../types";
import { parseKeymapFiles } from "../lib/keymapParser";

type FileLoaderProps = {
  onLoaded: (parsed: ParsedKeymap) => void;
  onError: (message: string) => void;
};

export function FileLoader({ onLoaded, onError }: FileLoaderProps) {
  async function handleLoad(formData: FormData) {
    const layoutFile = formData.get("layout") as File | null;
    const keymapFile = formData.get("keymap") as File | null;

    if (!layoutFile || !keymapFile || layoutFile.size === 0 || keymapFile.size === 0) {
      onError("AroundForty-RB.json と .keymap の2ファイルを選択してください。");
      return;
    }

    try {
      const [layoutText, keymapText] = await Promise.all([layoutFile.text(), keymapFile.text()]);
      onLoaded(parseKeymapFiles(layoutText, keymapText));
    } catch (error) {
      onError(error instanceof Error ? error.message : "keymap の読み込みに失敗しました。");
    }
  }

  return (
    <form
      className="loader"
      action={handleLoad}
    >
      <label>
        <span>物理配置 JSON</span>
        <input type="file" name="layout" accept=".json,application/json" />
      </label>
      <label>
        <span>ZMK .keymap</span>
        <input type="file" name="keymap" accept=".keymap,.txt,text/plain" />
      </label>
      <button type="submit" className="primary">
        <Upload size={18} />
        読み込む
      </button>
    </form>
  );
}
