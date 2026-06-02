import { useEffect, useMemo, useState } from "react";

const LS_KEY = "colorhub_saved_colors_v1";

function InfoAccordion() {
  const [open, setOpen] = useState(null);

  // ---------------- QUIZ ----------------
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ---------------- Color Playground (Local) ----------------
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [savedColors, setSavedColors] = useState([]);
  const isPlaygroundOpen = open === "red";

  // ---------------- Challenge (Local) ----------------
  const [truthColors, setTruthColors] = useState([]); 
  const [challengePlaying, setChallengePlaying] = useState(false);

  const [pickedSlots, setPickedSlots] = useState([null, null, null, null]);
  const [challengeScore, setChallengeScore] = useState(null);


  const [previewColor, setPreviewColor] = useState("#ffffff");
  const [playStep, setPlayStep] = useState(0);
  const [phase, setPhase] = useState("idle"); 

  const [seqTimer] = useState({ t: null });

  const toggle = (id) => setOpen(open === id ? null : id);

  // ---------------- QUIZ DATA ----------------
  const quiz = useMemo(
    () => [
      {
        id: 1,
        q: "Which color was once more expensive than gold?",
        options: ["Emerald Green", "Tyrian Purple", "Indigo", "Scarlet Red"],
        answer: "Tyrian Purple",
        fact: "Tyrian Purple was made from sea snails and used only by emperors.",
      },
      {
        id: 2,
        q: "Which color can humans distinguish the MOST shades of?",
        options: ["Red", "Blue", "Green", "Yellow"],
        answer: "Green",
        fact: "Humans evolved to see many green shades because of forests.",
      },
      {
        id: 3,
        q: "Which color can bees NOT see?",
        options: ["Red", "Blue", "Green", "Ultraviolet"],
        answer: "Red",
        fact: "Bees cannot see red, it appears as black to them.",
      },
    ],
    []
  );

  const handlePick = (id, opt) => setAnswers((prev) => ({ ...prev, [id]: opt }));
  const score = quiz.filter((q) => answers[q.id] === q.answer).length;

  const checkScore = async () => {
    setShowResult(true);
    if (isPlaying) return;

    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 250);
  };

  const resetQuiz = async () => {
    setAnswers({});
    setShowResult(false);
    setIsPlaying(false);
  };

  // ---------------- Local Storage: Load/Save ----------------
  const saveToLocalStorage = (colors) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(colors));
    } catch (e) {
      console.error("Failed to write localStorage:", e);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to read localStorage:", e);
      return [];
    }
  };

  useEffect(() => {
    if (isPlaygroundOpen) {
      setSavedColors(loadFromLocalStorage());
    } else {
      stopChallengePlayback();
      setPhase("idle");
      setPlayStep(0);
      setPreviewColor("#ffffff");
    }

  }, [isPlaygroundOpen]);

  // ---------------- Playground actions (Local) ----------------
  const handleColorChange = (e) => {
    const value = e.target.value;
    setCurrentColor(value);
  };

  const nextId = () => `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const handleSaveColor = () => {
    const newColor = { id: nextId(), hex: currentColor, label: `Saved ${currentColor}` };
    setSavedColors((prev) => {
      const updated = [...prev, newColor];
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const handleUseSavedColor = (color) => {
    setCurrentColor(color.hex);
  };

  const handleDeleteColor = (id) => {
    setSavedColors((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const hexToRgbText = (hex) => {
    try {
      let h = hex.startsWith("#") ? hex.slice(1) : hex;
      if (h.length !== 6) return "";
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `RGB(${r}, ${g}, ${b})`;
    } catch {
      return "";
    }
  };

  // ---------------- Challenge helpers ----------------
  const nextEmptySlotIndex = () => pickedSlots.findIndex((x) => x === null);

  const scoreLabel = (p) => {
    if (p >= 95) return "Perfect";
    if (p >= 75) return "Good";
    if (p >= 50) return "Close";
    return "Off";
  };

  // ---------------- Color math (HSL family-aware) ----------------
  const hexToRgb = (hex) => {
    const h = hex.startsWith("#") ? hex.slice(1) : hex;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  };

  const rgbToHsl = ({ r, g, b }) => {
    const rn = r / 255,
      gn = g / 255,
      bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));

      switch (max) {
        case rn:
          h = ((gn - bn) / d) % 6;
          break;
        case gn:
          h = (bn - rn) / d + 2;
          break;
        default:
          h = (rn - gn) / d + 4;
          break;
      }

      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }

    return { h, s, l };
  };

  const hueDiff = (h1, h2) => {
    const d = Math.abs(h1 - h2);
    return Math.min(d, 360 - d);
  };


  const colorSimilarityPercent = (trueHex, pickHex) => {
    if (!trueHex || !pickHex) return 0;

    const t = rgbToHsl(hexToRgb(trueHex));
    const p = rgbToHsl(hexToRgb(pickHex));
    const HUE_FAMILY_WINDOW = 25; 
    const TARGET_COLORFUL_SAT = 0.12; 
    const PICK_GRAY_SAT = 0.05;

    const dh = hueDiff(t.h, p.h);
    if (t.s > TARGET_COLORFUL_SAT && p.s < PICK_GRAY_SAT) return 0;
    if (dh > HUE_FAMILY_WINDOW) return 0;

    const hueScore = 1 - dh / HUE_FAMILY_WINDOW; 
    const satScore = 1 - Math.min(1, Math.abs(t.s - p.s)); 
    const lightScore = 1 - Math.min(1, Math.abs(t.l - p.l)); 

    const total = hueScore * 0.6 + satScore * 0.25 + lightScore * 0.15;

    return Math.max(0, Math.min(100, Math.round(total * 100)));
  };

  const randomHex = () => {
    const n = Math.floor(Math.random() * 0xffffff);
    return `#${n.toString(16).padStart(6, "0")}`;
  };

  // ---------------- Challenge: playback (Local) ----------------
  const stopChallengePlayback = () => {
    if (seqTimer.t) clearTimeout(seqTimer.t);
    seqTimer.t = null;
    setChallengePlaying(false);
    setPhase("idle");
    setPlayStep(0);
    setPreviewColor("#ffffff");
  };

  const playSequence = async (colors) => {
    stopChallengePlayback();

    setPhase("ready");
    setChallengePlaying(true);
    setPlayStep(0);
    setPreviewColor("#ffffff");

    await new Promise((r) => {
      seqTimer.t = setTimeout(r, 450);
    });

    setPhase("playing");

    let i = 0;
    const step = () => {
      const hex = colors[i];
      setPreviewColor(hex);
      setPlayStep(i + 1);

      i += 1;

      if (i < colors.length) {
        seqTimer.t = setTimeout(step, 1000);
      } else {
        seqTimer.t = null;
        setChallengePlaying(false);
        setPhase("idle");
        setPlayStep(0);
        setPreviewColor("#ffffff");
      }
    };

    step();
  };

  const startNewChallenge = async () => {
    if (!isPlaygroundOpen) return;
    if (challengePlaying) return;

    setChallengeScore(null);
    setPickedSlots([null, null, null, null]);

    const colors = [randomHex(), randomHex(), randomHex(), randomHex()];
    setTruthColors(colors);
    await playSequence(colors);
  };

  const replaySameChallengeColors = async () => {
    if (!isPlaygroundOpen) return;
    if (challengePlaying) return;
    if (!truthColors || truthColors.length !== 4) return;

    setChallengeScore(null);
    await playSequence(truthColors);
  };

  const addPickFromLivePicker = () => {
    if (!isPlaygroundOpen) return;
    if (challengePlaying) return;
    if (truthColors.length !== 4) return;

    const idx = nextEmptySlotIndex();
    if (idx === -1) return;

    setPickedSlots((prev) => {
      const copy = [...prev];
      copy[idx] = currentColor;
      return copy;
    });
  };

  const clearPicks = () => {
    if (challengePlaying) return;
    setPickedSlots([null, null, null, null]);
  };

  const removePickAt = (idx) => {
    if (challengePlaying) return;
    setPickedSlots((prev) => {
      const copy = [...prev];
      copy[idx] = null;
      const compact = copy.filter((x) => x !== null);
      while (compact.length < 4) compact.push(null);
      return compact;
    });
  };

  const canSubmit = pickedSlots.every((x) => x !== null);

  const submitChallenge = async () => {
    if (challengePlaying) return;
    if (!canSubmit) return;
    if (!truthColors || truthColors.length !== 4) return;

    const perColor = truthColors.map((trueHex, idx) =>
      colorSimilarityPercent(trueHex, pickedSlots[idx])
    );

    const percent = Math.round(perColor.reduce((a, b) => a + b, 0) / perColor.length);

    setChallengeScore({ percent, perColor });
  };

  // ---------------- UI ----------------
  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* ---------- ACCORDION 1: COLOR PLAYGROUND ---------- */}
      <div>
        <button
          onClick={() => toggle("red")}
          className="w-full flex items-center gap-3 bg-link text-secondary px-4 py-3 rounded-lg shadow-md hover:bg-link/60 transition-colors"
        >
          <span
            className={`text-black text-lg transform transition-transform duration-300 ${
              open === "red" ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
          <span className="font-semibold">Color Playground</span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            open === "red" ? "max-h-[1600px] mt-3" : "max-h-0"
          }`}
        >
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg px-4 py-4 text-sm text-secondary space-y-4">
            {/* Challenge Mode */}
            <div className="bg-background/10 border border-secondary/20 rounded-lg p-3 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-sm">Challenge Mode</h3>
                  <p className="text-[0.70rem] text-secondary/70 mt-1">
                    Step 1: Replay 4 colors (1 second each). Step 2: Recreate them with the Live Color Picker. Step 3:
                    Capture 4 picks in order and submit for evaluation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (challengePlaying ? stopChallengePlayback() : startNewChallenge())}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      challengePlaying ? "bg-red-600 text-white hover:bg-red-700" : "bg-primary text-background hover:bg-primary/80"
                    }`}
                  >
                    {challengePlaying ? "Stop" : "Replay Colors"}
                  </button>

                  <button
                    onClick={submitChallenge}
                    disabled={challengePlaying || !canSubmit || truthColors.length !== 4}
                    className="px-3 py-2 rounded-lg bg-link text-secondary text-xs font-semibold hover:bg-link/70 disabled:opacity-50"
                  >
                    Submit for Evaluation
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded border border-secondary/30 shadow"
                    style={{ backgroundColor: previewColor }}
                    title={previewColor}
                  />
                  <div className="text-xs">
                    {phase === "ready" ? (
                      <div className="font-semibold text-secondary">Ready…</div>
                    ) : (
                      <div className="font-mono">Now Showing: {previewColor}</div>
                    )}
                    <div className="text-[0.70rem] text-secondary/70 mt-1">
                      {challengePlaying ? "Memorize the sequence." : "Replay to start a new random sequence."}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-secondary/80 flex items-center gap-3">
                  <span className="font-mono">{challengePlaying && phase === "playing" ? `${playStep}/4` : "0/4"}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`inline-block w-2 h-2 rounded-full border border-secondary/40 ${
                          challengePlaying && phase === "playing" && playStep >= n ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[0.75rem] font-semibold">Captured Picks (Order Matters)</div>

                  <button
                    onClick={clearPicks}
                    disabled={challengePlaying || pickedSlots.every((x) => x === null)}
                    className="px-3 py-2 rounded-lg border border-secondary/40 text-secondary text-xs font-semibold hover:bg-secondary/5 disabled:opacity-50"
                  >
                    Clear Picks
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {pickedSlots.map((hx, idx) => (
                    <div
                      key={idx}
                      className="bg-background/10 border border-secondary/20 rounded-md p-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-8 h-8 rounded border border-secondary/30 shrink-0"
                          style={{ backgroundColor: hx || "transparent" }}
                        />
                        <div className="min-w-0">
                          <div className="text-[0.65rem] text-secondary/70 font-semibold">Pick {idx + 1}</div>
                          <div className="font-mono text-[0.65rem] text-secondary/80 truncate">{hx || "Empty"}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => removePickAt(idx)}
                        disabled={challengePlaying || !hx}
                        className="text-[0.70rem] px-2 py-1 rounded border border-secondary/40 hover:bg-secondary/10 disabled:opacity-50"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {challengeScore && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      onClick={startNewChallenge}
                      disabled={challengePlaying}
                      className="px-3 py-2 rounded-lg bg-primary text-background text-xs font-semibold hover:bg-primary/80 disabled:opacity-50"
                    >
                      Play Again (New Colors)
                    </button>

                    <button
                      onClick={replaySameChallengeColors}
                      disabled={challengePlaying || !truthColors || truthColors.length !== 4}
                      className="px-3 py-2 rounded-lg border border-secondary/40 text-secondary text-xs font-semibold hover:bg-secondary/5 disabled:opacity-50"
                    >
                      Replay Same Colors
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.70rem] text-secondary/70 font-semibold">Evaluation</span>
                  <span className="text-[0.70rem] text-secondary/90 font-semibold">
                    {challengeScore ? `${challengeScore.percent}%` : "Not evaluated yet"}
                  </span>
                </div>

                <div className="w-full h-2 rounded bg-background/20 overflow-hidden">
                  <div
                    className="h-full rounded bg-primary transition-all duration-500"
                    style={{ width: `${challengeScore?.percent ?? 0}%` }}
                  />
                </div>

                {challengeScore?.perColor?.length === 4 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {challengeScore.perColor.map((p, idx) => (
                      <div key={idx} className="bg-background/10 border border-secondary/20 rounded-md p-2 text-center">
                        <div className="text-[0.65rem] text-secondary/70 font-semibold">Color {idx + 1}</div>
                        <div className="text-sm font-bold text-secondary">{p}%</div>
                        <div className="text-[0.65rem] text-secondary/70 font-semibold">{scoreLabel(p)}</div>
                        <div className="w-full h-1 rounded bg-background/20 overflow-hidden mt-1">
                          <div className="h-full rounded bg-primary" style={{ width: `${p}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-secondary/20 my-2" />
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Free Mode (Playground)</h3>
                <p className="text-xs md:text-sm text-secondary/90 mt-1">
                UI-only demo (no backend). “Add Pick” fills the Captured Picks (order matters). “Save this color” stores it for later.

                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Live Color Picker</h3>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={handleColorChange}
                      className="w-14 h-14 rounded border border-secondary/40 bg-background cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-mono">Hex: {currentColor}</div>
                      <div className="font-mono text-secondary/80">{hexToRgbText(currentColor)}</div>
                    </div>
                  </div>

                  <div className="mt-2 w-full h-16 rounded border border-secondary/30" style={{ backgroundColor: currentColor }} />

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <button
                      onClick={addPickFromLivePicker}
                      disabled={truthColors.length !== 4 || challengePlaying || nextEmptySlotIndex() === -1}
                      className="px-3 py-2 rounded-lg bg-link text-secondary text-xs font-semibold hover:bg-link/70 disabled:opacity-50"
                      title={truthColors.length !== 4 ? "Start the challenge first" : ""}
                    >
                      Add Pick
                    </button>

                    <button
                      onClick={handleSaveColor}
                      className="px-3 py-2 rounded-lg border border-secondary/40 text-secondary text-xs font-semibold hover:bg-secondary/5"
                    >
                      Save this color
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Saved Colors</h3>

                  {savedColors.length === 0 && (
                    <p className="text-[0.75rem] text-secondary/70">
                      No saved colors yet. Pick a color and click <span className="font-semibold">Save this color</span>.
                    </p>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {savedColors.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-3 bg-background/20 rounded-md px-3 py-2 border border-secondary/20"
                      >
                        <button onClick={() => handleUseSavedColor(c)} className="flex items-center gap-3 flex-1 text-left">
                          <div className="w-10 h-10 rounded border border-secondary/30" style={{ backgroundColor: c.hex }} />
                          <div className="text-[0.75rem]">
                            <div className="font-mono font-semibold">{c.hex}</div>
                            <div className="text-secondary/70">{hexToRgbText(c.hex)}</div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleDeleteColor(c.id)}
                          className="text-[0.70rem] px-2 py-1 rounded border border-secondary/40 hover:bg-secondary/10"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[0.70rem] text-secondary/60 pt-2">
                Storage: <span className="font-mono">UI-only version</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- ACCORDION 2: QUIZ ---------- */}
      <div>
        <button
          onClick={() => toggle("blue")}
          className="w-full flex items-center gap-3 bg-link text-secondary px-4 py-3 rounded-lg shadow-md hover:bg-link/60 transition-colors"
        >
          <span
            className={`text-background text-lg transform transition-transform duration-300 ${
              open === "blue" ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>

          <span className="font-semibold">Color quiz</span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${open === "blue" ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg px-4 py-3 text-sm space-y-5">
            <h3 className="font-bold text-secondary text-base">🎨 Color Quiz</h3>

            {quiz.map((q) => (
              <div key={q.id} className="bg-white/20 rounded-lg p-3 border border-secondary/20 space-y-2">
                <p className="text-secondary font-semibold text-sm">
                  {q.id}. {q.q}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt;
                    const correct = opt === q.answer;

                    return (
                      <button
                        key={opt}
                        onClick={() => handlePick(q.id, opt)}
                        className={`text-left text-xs px-3 py-2 rounded-md border transition-all
                          ${
                            showResult && correct
                              ? "bg-green-800 border-green-400"
                              : showResult && selected && !correct
                              ? "bg-red-900 border-red-400"
                              : selected
                              ? "bg-link/40 border-link/80"
                              : "bg-background/50 border-secondary/20 hover:bg-background/60"
                          }
                        `}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {showResult && <p className="text-[11px] text-secondary mt-1">💡 {q.fact}</p>}
              </div>
            ))}

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <button
                onClick={checkScore}
                className="px-4 py-2 bg-link text-secondary rounded-lg text-sm hover:bg-link/70 disabled:opacity-50"
                disabled={isPlaying}
              >
                Check Answers
              </button>

              <button
                onClick={resetQuiz}
                className="px-4 py-2 border border-secondary/40 text-secondary rounded-lg text-xs hover:bg-secondary/5"
              >
                Reset
              </button>

              {showResult && (
                <span className="text-sm text-secondary font-medium">
                  Score: {score} / {quiz.length}
                </span>
              )}
            </div>

            <div className="text-[0.70rem] text-secondary/60 pt-2">
              Mode: <span className="font-mono">UI-only version</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoAccordion;
