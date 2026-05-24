import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, RotateCcw, Settings } from "lucide-react";
import { GameDrawer } from "./components/GameDrawer";
import { GameHud } from "./components/GameHud";
import { InputBuffer } from "./components/InputBuffer";
import { NextKeyCoach } from "./components/NextKeyCoach";
import { PromptLane } from "./components/PromptLane";
import { Rill } from "./components/Rill";
import { loadDefaultKeymap } from "./lib/defaultKeymap";
import { resolveHint } from "./lib/hintResolver";
import { applyKey } from "./lib/inputEngine";
import { accuracy, makePracticeSession, wpm } from "./lib/practice";
import { loadParsedKeymap, loadSettings, saveParsedKeymap, saveSettings } from "./lib/storage";
import { ParsedKeymap, PracticeMode, PracticeSession, ResolvedHint } from "./types";

type RillMood = "idle" | "hit" | "miss" | "complete";

const idleLines = ["リル、見てるわよ。", "指、迷子にしないでよね。", "今日は逃げないキーから始めるわ。"];
const hitLines = ["ふん、悪くないじゃない。", "その調子よ、悔しいけど。", "今のはちょっとだけ良いわ。"];
const missLines = ["そこじゃないわよ。", "見なさい、塗ってあるでしょ。", "リルでも分かるわよ、その場所。"];
const completeLines = ["まあまあね。次いくわよ。", "リルが見てたからよ。"];

export function App() {
  const savedSettings = useMemo(() => loadSettings(), []);
  const [parsed, setParsed] = useState<ParsedKeymap>(() => loadParsedKeymap() ?? loadDefaultKeymap());
  const [mode, setMode] = useState<PracticeMode>(savedSettings.mode ?? "japanese");
  const [baseLayerName, setBaseLayerName] = useState(savedSettings.baseLayerName ?? "");
  const [keyboardLayerName, setKeyboardLayerName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [session, setSession] = useState<PracticeSession>(() => makePracticeSession(savedSettings.mode ?? "japanese"));
  const [latestHint, setLatestHint] = useState<ResolvedHint | undefined>();
  const [rillMood, setRillMood] = useState<RillMood>("idle");
  const [rillMessage, setRillMessage] = useState(randomLine(idleLines));
  const inputRef = useRef<HTMLInputElement>(null);

  const baseLayer = parsed.layers.find((layer) => layer.name === baseLayerName) ?? parsed.layers[0];
  const nextHint = useMemo(
    () => (baseLayer && session.nextExpected ? resolveHint(session.nextExpected, parsed.layers, baseLayer.name) : undefined),
    [baseLayer, parsed.layers, session.nextExpected]
  );
  const activeHint = latestHint ?? nextHint;
  const hintedLayer = parsed.layers.find((layer) => layer.displayName === activeHint?.layerName || layer.name === activeHint?.layerName);
  const activeKeyboardLayer = keyboardLayerName || hintedLayer?.name || baseLayer.name;
  const isComplete = Boolean(session.completedAt);

  useEffect(() => {
    const initialBase =
      savedSettings.baseLayerName && parsed.layers.some((layer) => layer.name === savedSettings.baseLayerName)
        ? savedSettings.baseLayerName
        : parsed.layers.find((layer) => /base/i.test(layer.name))?.name ?? parsed.layers[0].name;
    setBaseLayerName((current) => current || initialBase);
    setKeyboardLayerName((current) => current || initialBase);
  }, [parsed, savedSettings.baseLayerName]);

  useEffect(() => {
    saveSettings({ baseLayerName, mode });
  }, [baseLayerName, mode]);

  useEffect(() => {
    focusTyping();
  }, [session.item.id]);

  function focusTyping() {
    inputRef.current?.focus({ preventScroll: true });
  }

  function startSession(nextMode = mode) {
    const next = makePracticeSession(nextMode, session);
    setMode(nextMode);
    setSession(next);
    setLatestHint(undefined);
    setRillMood("idle");
    setRillMessage(randomLine(idleLines));
    window.setTimeout(focusTyping, 0);
  }

  function handleLoaded(next: ParsedKeymap) {
    setParsed(next);
    saveParsedKeymap(next);
    const nextBase = next.layers.find((layer) => /base/i.test(layer.name))?.name ?? next.layers[0].name;
    setBaseLayerName(nextBase);
    setKeyboardLayerName(nextBase);
    setError("");
    setDrawerOpen(false);
    startSession(mode);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Enter" && isComplete) {
      event.preventDefault();
      startSession();
      return;
    }
    if (event.key.length !== 1 && event.key !== "Backspace" && event.key !== " ") return;

    event.preventDefault();
    const result = applyKey(event.key, session, (expected) => resolveHint(expected, parsed.layers, baseLayer.name));
    setSession(result.session);

    if (result.status === "rejected") {
      setLatestHint(result.mistake.hint);
      setRillMood("miss");
      setRillMessage(randomLine(missLines));
      return;
    }

    setLatestHint(undefined);
    if (result.status === "completed") {
      setRillMood("complete");
      setRillMessage(randomLine(completeLines));
      return;
    }

    setRillMood("hit");
    setRillMessage(randomLine(hitLines));
  }

  function handleStageClick(target: EventTarget) {
    if (target instanceof HTMLButtonElement || target instanceof HTMLSelectElement || target instanceof HTMLInputElement) return;
    focusTyping();
  }

  return (
    <main className="game-app" onPointerDown={(event) => handleStageClick(event.target)}>
      <input
        ref={inputRef}
        className="focus-catcher"
        aria-label="typing input"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        value=""
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onChange={() => undefined}
        onKeyDown={handleKeyDown}
      />

      <header className="game-top">
        <div>
          <p className="brand">ZMK Typing Game</p>
          <strong>{parsed.layout.name}</strong>
        </div>
        <div className="top-actions">
          <button className={mode === "japanese" ? "pill selected" : "pill"} type="button" onClick={() => startSession("japanese")}>
            日本語
          </button>
          <button className={mode === "symbols" ? "pill selected" : "pill"} type="button" onClick={() => startSession("symbols")}>
            記号
          </button>
          <button className="icon-button" type="button" onClick={() => setDrawerOpen(true)} aria-label="設定とキーマップ">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <GameHud stage={session.stage} combo={session.streak} accuracy={accuracy(session)} miss={session.mistakes.length} />

      <section className={`game-stage ${rillMood}`} aria-label="typing stage">
        <PromptLane session={session} />
        <InputBuffer buffer={session.currentBuffer} focused={focused} />
        <NextKeyCoach char={session.nextExpected} hint={activeHint} layout={parsed.layout} isMistake={rillMood === "miss"} />

        {isComplete && (
          <div className="complete-panel">
            <strong>Stage clear</strong>
            <span>
              {wpm(session, session.completedAt)} WPM / {accuracy(session)}% accuracy
            </span>
            <button className="primary" type="button" onClick={() => startSession()}>
              <RotateCcw size={17} />
              次へ
            </button>
          </div>
        )}
      </section>

      <Rill mood={rillMood} message={rillMessage} />

      <button className="map-fab" type="button" onClick={() => setDrawerOpen(true)}>
        <Keyboard size={18} />
        Map
      </button>

      <GameDrawer
        open={drawerOpen}
        parsed={parsed}
        activeLayerName={activeKeyboardLayer}
        highlightKeyIndex={activeHint?.keyIndex}
        layerKeyIndex={activeHint?.viaLayerKeyIndex}
        mistakes={session.mistakes}
        warnings={parsed.warnings}
        error={error}
        onClose={() => {
          setDrawerOpen(false);
          window.setTimeout(focusTyping, 0);
        }}
        onLayerChange={setKeyboardLayerName}
        onLoaded={handleLoaded}
        onError={setError}
      />
    </main>
  );
}

function randomLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}
