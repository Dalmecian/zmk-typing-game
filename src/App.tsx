import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, RotateCcw, Settings } from "lucide-react";
import { GameDrawer } from "./components/GameDrawer";
import { GameHud, xpThreshold } from "./components/GameHud";
import { InputBuffer } from "./components/InputBuffer";
import { NextKeyCoach } from "./components/NextKeyCoach";
import { PromptLane } from "./components/PromptLane";
import { Rill } from "./components/Rill";
import { loadDefaultKeymap } from "./lib/defaultKeymap";
import { resolveHint } from "./lib/hintResolver";
import { applyKey } from "./lib/inputEngine";
import { accuracy, makePracticeSession, makeTimeAttackSession, wpm } from "./lib/practice";
import { loadParsedKeymap, loadSettings, saveParsedKeymap, saveSettings } from "./lib/storage";
import { AdventureState, ParsedKeymap, PracticeMode, PracticeSession, ResolvedHint, StatusAilment } from "./types";

type RillMood = "idle" | "hit" | "miss" | "complete";
type GameMode = "adventure" | "timeAttack";

const TIME_ATTACK_DURATION = 60; // seconds

const idleLines = ["リル、見てるわよ。", "指、迷子にしないでよね。", "今日は逃げないキーから始めるわ。"];
const hitLines = ["ふん、悪くないじゃない。", "その調子よ、悔しいけど。", "今のはちょっとだけ良いわ。"];
const missLines = ["そこじゃないわよ。", "見なさい、塗ってあるでしょ。", "リルでも分かるわよ、その場所。"];
const completeLines = ["まあまあね。次いくわよ。", "リルが見てたからよ。"];
const ailmentLines: Record<NonNullable<StatusAilment>, string[]> = {
  poison: ["毒喰らってるわよ、しっかりして！", "毒が回ってる…早く当てなさい！"],
  confusion: ["混乱してる…落ち着きなさい。", "頭がぐるぐるしてるでしょ？"],
  slow: ["遅い…遅すぎるわよ！", "カタツムリみたい。しっかりして。"],
};
const levelUpLines = ["レベルアップ！…まあ、リルのおかげね。", "成長してるじゃない。ちょっとだけ認めるわ。"];
const hpLowLines = ["HP危ないわよ！集中して！", "もう少しでやられるわよ！"];
const gameOverLines = ["もう…情けないわね。もう一回よ。", "倒れたの？しょうがないわね。"];
const taStartLines = ["タイムアタック！…リルは見てるだけよ。", "60秒勝負！行くわよ！"];
const taEndLines = ["お疲れ。…まあまあだったわ。", "終了！どうだった？"];

function initialAdventure(): AdventureState {
  return { hp: 100, maxHp: 100, xp: 0, level: 1, ailment: null, consecutiveMisses: 0 };
}

export function App() {
  const savedSettings = useMemo(() => loadSettings(), []);
  const [parsed, setParsed] = useState<ParsedKeymap>(() => loadParsedKeymap() ?? loadDefaultKeymap());
  const [mode, setMode] = useState<PracticeMode>(savedSettings.mode ?? "japanese");
  const [gameMode, setGameMode] = useState<GameMode>("adventure");
  const [baseLayerName, setBaseLayerName] = useState(savedSettings.baseLayerName ?? "");
  const [keyboardLayerName, setKeyboardLayerName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [session, setSession] = useState<PracticeSession>(() => makePracticeSession(savedSettings.mode ?? "japanese"));
  const [latestHint, setLatestHint] = useState<ResolvedHint | undefined>();
  const [rillMood, setRillMood] = useState<RillMood>("idle");
  const [rillMessage, setRillMessage] = useState(randomLine(idleLines));
  const [adventure, setAdventure] = useState<AdventureState>(initialAdventure);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  // Time attack state
  const [taTimeLeft, setTaTimeLeft] = useState(TIME_ATTACK_DURATION);
  const [taScore, setTaScore] = useState(0);
  const [taWordsCleared, setTaWordsCleared] = useState(0);
  const [taActive, setTaActive] = useState(false);
  const [taFinished, setTaFinished] = useState(false);

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

  // Poison tick
  useEffect(() => {
    if (adventure.ailment !== "poison" || gameOver) return;
    const timer = setInterval(() => {
      setAdventure((prev) => {
        const next = { ...prev, hp: Math.max(0, prev.hp - 2) };
        if (next.hp <= 0) {
          setGameOver(true);
          setRillMood("miss");
          setRillMessage(randomLine(gameOverLines));
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [adventure.ailment, gameOver]);

  // Time attack countdown
  useEffect(() => {
    if (!taActive || taFinished) return;
    const timer = setInterval(() => {
      setTaTimeLeft((prev) => {
        if (prev <= 1) {
          setTaActive(false);
          setTaFinished(true);
          setRillMood("complete");
          setRillMessage(randomLine(taEndLines));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [taActive, taFinished]);

  // Clear sparkle
  useEffect(() => {
    if (!sparkle) return;
    const t = setTimeout(() => setSparkle(false), 400);
    return () => clearTimeout(t);
  }, [sparkle]);

  const focusTyping = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function startSession(nextMode = mode) {
    const next = makePracticeSession(nextMode, session);
    setMode(nextMode);
    setSession(next);
    setLatestHint(undefined);
    setRillMood("idle");
    setRillMessage(randomLine(idleLines));
    window.setTimeout(focusTyping, 0);
  }

  function startTimeAttack(nextMode = mode) {
    setGameMode("timeAttack");
    setMode(nextMode);
    setTaTimeLeft(TIME_ATTACK_DURATION);
    setTaScore(0);
    setTaWordsCleared(0);
    setTaActive(true);
    setTaFinished(false);
    const next = makeTimeAttackSession(nextMode);
    setSession(next);
    setLatestHint(undefined);
    setRillMood("hit");
    setRillMessage(randomLine(taStartLines));
    window.setTimeout(focusTyping, 0);
  }

  function switchToAdventure(nextMode = mode) {
    setGameMode("adventure");
    setTaActive(false);
    setTaFinished(false);
    startSession(nextMode);
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

  function handleRestart() {
    setAdventure((prev) => ({ ...prev, hp: prev.maxHp, ailment: null, consecutiveMisses: 0 }));
    setGameOver(false);
    setRillMood("idle");
    setRillMessage(randomLine(idleLines));
    window.setTimeout(focusTyping, 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (gameOver) return;
    if (taFinished) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    // In adventure mode: Enter to advance on complete
    if (event.key === "Enter" && isComplete && gameMode === "adventure") {
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

      if (gameMode === "adventure") {
        // Adventure miss damage
        setAdventure((prev) => {
          const consec = prev.consecutiveMisses + 1;
          const damage = Math.min(5 + consec * 2, 15);
          let nextAilment = prev.ailment;
          if (consec >= 3 && !prev.ailment) {
            const ailments: NonNullable<StatusAilment>[] = ["poison", "confusion", "slow"];
            nextAilment = ailments[Math.floor(Math.random() * ailments.length)];
          }
          const nextHp = Math.max(0, prev.hp - damage);
          const nextState: AdventureState = { ...prev, hp: nextHp, consecutiveMisses: consec, ailment: nextAilment };

          if (nextHp <= 0) {
            setGameOver(true);
            setRillMessage(randomLine(gameOverLines));
          } else if (nextAilment && nextAilment !== prev.ailment) {
            setRillMessage(randomLine(ailmentLines[nextAilment]));
          } else if (nextAilment) {
            setRillMessage(randomLine(ailmentLines[nextAilment]));
          } else if (nextHp <= 30) {
            setRillMessage(randomLine(hpLowLines));
          } else {
            setRillMessage(randomLine(missLines));
          }
          return nextState;
        });
      } else {
        // Time attack: just show miss message
        setRillMessage(randomLine(missLines));
      }
      return;
    }

    setLatestHint(undefined);

    if (result.status === "completed") {
      if (gameMode === "timeAttack") {
        // Score and immediately advance to next word
        const streakBonus = result.session.streak;
        const wordScore = 100 + streakBonus * 10;
        setTaScore((prev) => prev + wordScore);
        setTaWordsCleared((prev) => prev + 1);

        if (taActive) {
          // Immediately start next time attack item
          const next = makeTimeAttackSession(mode);
          // Carry over streak
          next.streak = result.session.streak;
          next.bestStreak = Math.max(result.session.bestStreak, result.session.streak);
          setSession(next);
          setLatestHint(undefined);
          setRillMood("hit");
          setRillMessage(randomLine(hitLines));
        }
        return;
      }

      // Adventure mode complete
      setAdventure((prev) => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + 20),
        consecutiveMisses: 0,
      }));
      setRillMood("complete");
      setRillMessage(randomLine(completeLines));
      return;
    }

    // Correct key
    setSparkle(true);

    if (gameMode === "adventure") {
      // XP gain, ailment cure, level-up
      let didLevelUp = false;
      setAdventure((prev) => {
        const streak = result.session.streak;
        const xpGain = 10 + streak * 2;
        let nextXp = prev.xp + xpGain;
        let nextLevel = prev.level;
        let nextAilment = prev.ailment;

        if (streak >= 5 && prev.ailment) {
          nextAilment = null;
        }

        const threshold = xpThreshold(prev.level);
        if (nextXp >= threshold) {
          nextXp -= threshold;
          nextLevel += 1;
          didLevelUp = true;
        }

        return { ...prev, xp: nextXp, level: nextLevel, ailment: nextAilment, consecutiveMisses: 0 };
      });

      if (didLevelUp) {
        setShowLevelUp(true);
        setRillMood("hit");
        setRillMessage(randomLine(levelUpLines));
        setTimeout(() => setShowLevelUp(false), 800);
      } else {
        setRillMood("hit");
        setRillMessage(randomLine(hitLines));
      }
    } else {
      // Time attack: just show hit feedback
      setRillMood("hit");
      setRillMessage(randomLine(hitLines));
    }
  }

  function handleStageClick(target: EventTarget) {
    if (target instanceof HTMLButtonElement || target instanceof HTMLSelectElement || target instanceof HTMLInputElement) return;
    focusTyping();
  }

  const ailmentClass = adventure.ailment === "poison" ? "poisoned" : adventure.ailment === "confusion" ? "confused" : adventure.ailment === "slow" ? "slowed" : "";

  return (
    <main className={`game-app ${ailmentClass} ${gameOver ? "game-over" : ""}`} onPointerDown={(event) => handleStageClick(event.target)}>
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
          <button
            className={`pill ${gameMode === "adventure" && mode === "japanese" ? "selected" : ""}`}
            type="button"
            onClick={() => switchToAdventure("japanese")}
          >
            日本語
          </button>
          <button
            className={`pill ${gameMode === "adventure" && mode === "symbols" ? "selected" : ""}`}
            type="button"
            onClick={() => switchToAdventure("symbols")}
          >
            記号
          </button>
          <button
            className={`pill time-attack ${gameMode === "timeAttack" ? "selected" : ""}`}
            type="button"
            onClick={() => startTimeAttack(mode)}
          >
            TIME ATTACK
          </button>
          <button className="icon-button" type="button" onClick={() => setDrawerOpen(true)} aria-label="設定とキーマップ">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {gameMode === "adventure" ? (
        <GameHud
          stage={session.stage}
          combo={session.streak}
          accuracy={accuracy(session)}
          miss={session.mistakes.length}
          adventure={adventure}
        />
      ) : (
        <div className="game-hud">
          <div className={`hud-timer ${taTimeLeft <= 10 ? "urgent" : ""}`}>
            <span>Time</span>
            <strong>{taTimeLeft}s</strong>
            <div className="timer-bar-track">
              <div className="timer-bar-fill" style={{ width: `${(taTimeLeft / TIME_ATTACK_DURATION) * 100}%` }} />
            </div>
          </div>
          <div className="hud-sep" />
          <div className="ta-score">
            <span>Score</span>
            <strong>{taScore}</strong>
          </div>
          <div className="hud-sep" />
          <div className="hud-item">
            <span>Words</span>
            <strong>{taWordsCleared}</strong>
          </div>
          <div className="hud-sep" />
          <div className={`hud-item hud-combo ${session.streak >= 20 ? "rainbow" : session.streak >= 10 ? "pulse" : session.streak >= 5 ? "glow" : ""}`}>
            <span>Combo</span>
            <strong>{session.streak}</strong>
          </div>
        </div>
      )}

      <section className={`game-stage ${rillMood}`} aria-label="typing stage">
        <PromptLane session={session} sparkle={sparkle} />
        <InputBuffer buffer={session.currentBuffer} focused={focused} />
        <NextKeyCoach char={session.nextExpected} hint={activeHint} layout={parsed.layout} isMistake={rillMood === "miss"} />

        {isComplete && gameMode === "adventure" && (
          <div className="complete-panel">
            <strong>STAGE CLEAR</strong>
            <span>
              {wpm(session, session.completedAt)} WPM / {accuracy(session)}% acc
              <span className="hp-recovery"> / HP +20</span>
            </span>
            <button className="primary" type="button" onClick={() => startSession()}>
              <RotateCcw size={17} />
              次へ
            </button>
          </div>
        )}

        {taFinished && (
          <div className="time-up-panel">
            <h2>TIME UP!</h2>
            <div className="time-up-stats">
              <div className="time-up-stat">
                <span className="stat-label">Score</span>
                <span className="stat-value highlight">{taScore}</span>
              </div>
              <div className="time-up-stat">
                <span className="stat-label">Words</span>
                <span className="stat-value">{taWordsCleared}</span>
              </div>
              <div className="time-up-stat">
                <span className="stat-label">Best Combo</span>
                <span className="stat-value">{session.bestStreak}</span>
              </div>
            </div>
            <button className="primary" type="button" onClick={() => startTimeAttack(mode)}>
              <RotateCcw size={17} />
              もう一回
            </button>
          </div>
        )}
      </section>

      <Rill mood={rillMood} message={rillMessage} />

      {showLevelUp && (
        <div className="level-up-overlay">
          <div className="level-up-text">LEVEL UP!</div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-text">GAME OVER</div>
          <button className="primary" type="button" onClick={handleRestart}>
            もう一回
          </button>
        </div>
      )}

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
