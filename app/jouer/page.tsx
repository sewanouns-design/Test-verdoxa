"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { InfiniteDifficulty } from "@/lib/infiniteQuestions";
import { pickRandomLevelUpMessage } from "@/lib/levelUpMessages";

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, centerX, startY + i * lineHeight));
}

// Message d'encouragement adapte au niveau de difficulte atteint --
// plus le niveau est avance, plus le ton valorise la performance.
// Pour "difficile", on alterne au hasard entre deux variantes pour un
// peu de variete.
const ENCOURAGEMENT_BY_DIFFICULTY: Record<InfiniteDifficulty, string[]> = {
  facile: ["Bon départ ! 🌱"],
  moyen: ["Tu progresses bien ! 💪"],
  difficile: ["Impressionnant ! 🔥", "Félicitation 🤩"],
  expert: ["Niveau Expert atteint, bravo ! 🏆"],
};

function pickEncouragement(difficulty: InfiniteDifficulty): string {
  const options = ENCOURAGEMENT_BY_DIFFICULTY[difficulty];
  return options[Math.floor(Math.random() * options.length)];
}

// Dessine un petit repere a 4 branches (etoile stylisee) a la position
// donnee -- utilise pour parsemer le fond de l'image partageable.
function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.15, y - r * 0.15, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.15, y + r * 0.15, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.15, y + r * 0.15, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.15, y - r * 0.15, x, y - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Suite pseudo-aleatoire deterministe (memes positions a chaque generation,
// pour un rendu stable) utilisee pour semer les etoiles et decors.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function drawScrollAndBooks(ctx: CanvasRenderingContext2D, size: number) {
  const baseY = size - 210;

  // Parchemin deroule, cote gauche
  ctx.save();
  ctx.fillStyle = "#d9c08f";
  ctx.beginPath();
  ctx.moveTo(60, baseY + 90);
  ctx.quadraticCurveTo(size * 0.32, baseY + 30, size * 0.52, baseY + 70);
  ctx.lineTo(size * 0.5, baseY + 110);
  ctx.quadraticCurveTo(size * 0.3, baseY + 75, 60, baseY + 130);
  ctx.closePath();
  ctx.fill();
  // rouleaux aux extremites
  ctx.fillStyle = "#b89a63";
  ctx.beginPath();
  ctx.ellipse(58, baseY + 108, 16, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.52, baseY + 88, 13, 22, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pile de livres, cote droit
  const bookColors = ["#5a3a2a", "#7a2e2e", "#3a4a35"];
  let by = baseY + 150;
  const bx = size * 0.62;
  const bw = size * 0.3;
  bookColors.forEach((color, i) => {
    const bh = 34;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(bx - i * 10, by, bw - i * 6, bh, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(bx - i * 10 + 10, by + 6, bw - i * 6 - 20, 4);
    ctx.restore();
    by += bh + 4;
  });
}

const QUESTIONS_PER_LEVEL = 8;
const STORAGE_KEY = "vedoxa.progress.v1";

const POINTS_BY_DIFFICULTY: Record<InfiniteDifficulty, number> = {
  facile: 10,
  moyen: 15,
  difficile: 20,
  expert: 25,
};

// Temps accorde par question, selon la difficulte du niveau en cours.
const TIME_BY_DIFFICULTY: Record<InfiniteDifficulty, number> = {
  facile: 45,
  moyen: 90,
  difficile: 135,
  expert: 180,
};

const DIFFICULTY_LABEL: Record<InfiniteDifficulty, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
  expert: "Expert",
};

function formatTimeLeft(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function difficultyForLevel(level: number): InfiniteDifficulty {
  if (level <= 3) return "facile";
  if (level <= 6) return "moyen";
  if (level <= 9) return "difficile";
  return "expert";
}

interface PublicQuestion {
  id: string;
  difficulty: InfiniteDifficulty;
  theme: string;
  text: string;
  options: string[];
  points?: number;
}

interface AnswerFeedback {
  correct: boolean;
  correctOption: number;
  correctText?: string;
  verseReference: string;
  explanation: string;
  points?: number;
}

interface LevelAnswer extends AnswerFeedback {
  selectedOption: number;
  timedOut?: boolean;
}

type Phase = "intro" | "loading" | "question" | "levelComplete" | "error";

interface SavedProgress {
  studentName: string;
  level: number;
  questions: PublicQuestion[];
  currentIndex: number;
  maxIndexReached: number;
  askedIds: string[];
  levelAnswers: (LevelAnswer | null)[];
  score: number;
  correctCount: number;
  totalAnswered: number;
  streak: number;
  bestStreak: number;
  phase: "question" | "levelComplete";
  resetVersion?: number;
}

function loadProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.studentName || !Array.isArray(parsed.questions)) return null;
    return parsed as SavedProgress;
  } catch {
    return null;
  }
}

function saveProgress(data: SavedProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Pas grave si le stockage local echoue (mode prive, quota...) : le
    // jeu continue normalement, seule la reprise ne sera pas possible.
  }
}

function clearProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // idem
  }
}

export default function InfiniteQuizPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [studentName, setStudentName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndexReached, setMaxIndexReached] = useState(0);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [levelAnswers, setLevelAnswers] = useState<(LevelAnswer | null)[]>(
    Array(QUESTIONS_PER_LEVEL).fill(null)
  );
  const [answering, setAnswering] = useState(false);

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [levelUpMessage, setLevelUpMessage] = useState("");
  const [sharingImage, setSharingImage] = useState(false);

  async function drawTCBImage(): Promise<{ blob: Blob; dataUrl: string } | null> {
    const size = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const navy = "#1E2A5E";
    const navyDeep = "#141C40";

    ctx.fillStyle = navyDeep;
    ctx.fillRect(0, 0, size, size);
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, navy);
    grad.addColorStop(1, navyDeep);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Etoiles semees dans le fond (positions stables entre deux generations)
    const rand = seededRandom(42);
    for (let i = 0; i < 26; i++) {
      const sx = rand() * size;
      const sy = rand() * (size - 260);
      drawSparkle(ctx, sx, sy, 4 + rand() * 7, 0.35 + rand() * 0.5);
    }

    // Decor illustre en bas de l'image
    drawScrollAndBooks(ctx, size);

    ctx.textAlign = "center";
    ctx.font = "120px serif";
    ctx.fillText("🔥", size / 2, 270);

    ctx.font = `700 54px Georgia, serif`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("VEDOXA", size / 2, 350);

    ctx.font = `700 46px Georgia, serif`;
    ctx.fillStyle = "#d4a017";
    ctx.fillText(pickEncouragement(difficultyForLevel(level)), size / 2, 430);

    ctx.font = `500 32px Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(studentName, size / 2, 500);

    ctx.font = `700 150px Georgia, serif`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Niveau ${level}`, size / 2, 660);

    ctx.font = `500 32px Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(`${DIFFICULTY_LABEL[difficultyForLevel(level)]} — ${score} points`, size / 2, 720);

    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.moveTo(size * 0.25, 770);
    ctx.lineTo(size * 0.75, 770);
    ctx.stroke();

    ctx.font = `400 30px Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    wrapCenteredText(ctx, "Grandis dans la connaissance de la Parole, un défi à la fois.", size / 2, 830, size - 160, 40);

    ctx.font = `600 26px Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("Défi biblique — Espace public", size / 2, size - 60);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        resolve({ blob, dataUrl: canvas.toDataURL("image/png") });
      }, "image/png");
    });
  }

  async function handleShare() {
    setSharingImage(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}`;
      const shareText = `J'ai atteint le niveau ${level} (${DIFFICULTY_LABEL[difficultyForLevel(level)]}) sur Vedoxa ! 🔥 À ton tour, relève le défi : ${link}`;

      const image = await drawTCBImage();
      const file = image ? new File([image.blob], "defi-biblique.png", { type: "image/png" }) : null;

      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
        canShare?: (data: ShareData) => boolean;
      };

      if (nav.share) {
        const shareData: ShareData = file ? { files: [file], text: shareText } : { text: shareText };
        const canShareFiles = !file || !nav.canShare || nav.canShare(shareData);
        if (canShareFiles) {
          try {
            await nav.share(shareData);
            return;
          } catch {
            // Annule ou echoue -> on retombe sur le lien WhatsApp classique.
          }
        }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    } finally {
      setSharingImage(false);
    }
  }
  const [errorMsg, setErrorMsg] = useState("");
  const [savingScore, setSavingScore] = useState(false);
  const [resumeAvailable, setResumeAvailable] = useState<SavedProgress | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeSettings, setTimeSettings] = useState<Record<InfiniteDifficulty, number>>(TIME_BY_DIFFICULTY);
  const resetVersionRef = useRef<number>(1);
  const [cheatWarning, setCheatWarning] = useState("");
  const [cancelledMessage, setCancelledMessage] = useState("");
  const hiddenAtRef = useRef<number | null>(null);
  const leaveInfractionsRef = useRef(0);
  const AWAY_GRACE_MS = 5000;

  // Detection anti-triche : changement d'onglet/appli pendant une
  // question. On ne surveille PAS la fermeture de la page ici, pour ne
  // pas casser la reprise apres actualisation (fonctionnalite separee).
  useEffect(() => {
    function handleVisibilityChange() {
      if (phase !== "question") return;
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }
      if (hiddenAtRef.current === null) return;
      const awayMs = Date.now() - hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (awayMs < AWAY_GRACE_MS) return;

      leaveInfractionsRef.current += 1;
      if (leaveInfractionsRef.current === 1) {
        setCheatWarning(
          "⚠️ Tu as quitte la page pendant le Défi. Encore un ecart et ta partie sera annulee."
        );
      } else {
        clearProgress();
        setCancelledMessage(
          "Ta partie a ete annulee car tu as quitte la page pendant le Défi. Tu peux recommencer."
        );
        setPhase("intro");
        setLevel(1);
        setQuestions([]);
        setCurrentIndex(0);
        setMaxIndexReached(0);
        setAskedIds([]);
        setLevelAnswers(Array(QUESTIONS_PER_LEVEL).fill(null));
        setScore(0);
        setCorrectCount(0);
        setTotalAnswered(0);
        setStreak(0);
        setBestStreak(0);
        setCheatWarning("");
        leaveInfractionsRef.current = 0;
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Le chrono repart a zero des qu'une NOUVELLE question devient "en
  // cours" (maxIndexReached avance, ou un nouveau niveau demarre) --
  // il ne depend jamais de la question actuellement affichee a l'ecran
  // (currentIndex), qui peut etre une question precedente consultee en
  // revision : le decompte continue en arriere-plan sur la question en
  // cours pendant ce temps-la.
  useEffect(() => {
    if (phase !== "question") {
      setTimeLeft(null);
      return;
    }
    if (levelAnswers[maxIndexReached]) {
      // La question "en cours" a deja une reponse enregistree (reprise
      // d'une partie sauvegardee juste avant un changement de niveau) :
      // pas de chrono a faire tourner.
      setTimeLeft(null);
      return;
    }
    setTimeLeft(timeSettings[difficultyForLevel(level)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxIndexReached, level, phase]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  async function handleTimeout() {
    const liveIdx = maxIndexReached;
    if (answering || levelAnswers[liveIdx]) return; // deja repondue entre-temps
    const liveQuestion = questions[liveIdx];
    if (!liveQuestion) return;

    setTimeLeft(null); // stoppe le decompte pendant qu'on traite l'expiration
    setCurrentIndex(liveIdx); // ramene la personne sur la question en cours

    try {
      const res = await fetch("/api/quiz/infinite/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: liveQuestion.id, selectedOption: -1, selectedText: "" }),
      });
      const json: AnswerFeedback = await res.json();
      json.correctOption = json.correctText ? liveQuestion.options.indexOf(json.correctText) : json.correctOption;

      const timedOutAnswer: LevelAnswer = { ...json, selectedOption: -1, timedOut: true };
      const nextLevelAnswers = [...levelAnswers];
      nextLevelAnswers[liveIdx] = timedOutAnswer;
      setLevelAnswers(nextLevelAnswers);
      // Le temps ecoule ne compte ni comme bonne ni comme mauvaise
      // reponse : score, serie et compteurs restent inchanges.
      persist({ levelAnswers: nextLevelAnswers });

      autoAdvanceTimer.current = setTimeout(() => {
        advance(nextLevelAnswers, score, correctCount, totalAnswered, streak, bestStreak, askedIds);
      }, 1000);
    } catch {
      // Si la requete echoue, on retente simplement le decompte pour ne
      // pas bloquer la personne indefiniment.
      setTimeLeft(timeSettings[difficultyForLevel(level)]);
    }
  }

  useEffect(() => {
    fetch("/api/quiz/settings").then(r => r.json()).then(j => {
      const s = j.settings;
      if (s) {
        setTimeSettings({ facile: s.easy_seconds || 45, moyen: s.medium_seconds || 90, difficile: s.hard_seconds || 135, expert: s.expert_seconds || 180 });
        resetVersionRef.current = s.reset_version || 1;
      }
      // On ne decide de proposer une reprise qu'une fois la version de
      // reinitialisation connue : si le super-admin a remis le
      // classement a zero depuis la derniere partie de cette personne,
      // sa progression sauvegardee est perimee et ne doit pas etre
      // proposee -- elle recommence obligatoirement a zero.
      const saved = loadProgress();
      if (saved && (saved.resetVersion || 1) >= resetVersionRef.current) {
        setResumeAvailable(saved);
      } else if (saved) {
        clearProgress();
      }
    }).catch(() => {
      const saved = loadProgress();
      if (saved) setResumeAvailable(saved);
    });
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  function persist(overrides: Partial<SavedProgress> = {}, nextPhase?: "question" | "levelComplete") {
    const data: SavedProgress = {
      studentName,
      level,
      questions,
      currentIndex,
      maxIndexReached,
      askedIds,
      levelAnswers,
      score,
      correctCount,
      totalAnswered,
      streak,
      bestStreak,
      phase: nextPhase || (phase === "levelComplete" ? "levelComplete" : "question"),
      resetVersion: resetVersionRef.current,
      ...overrides,
    };
    saveProgress(data);
  }

  function resumeGame(saved: SavedProgress) {
    setStudentName(saved.studentName);
    setLevel(saved.level);
    setQuestions(saved.questions);
    setCurrentIndex(saved.currentIndex);
    setMaxIndexReached(saved.maxIndexReached);
    setAskedIds(saved.askedIds);
    setLevelAnswers(saved.levelAnswers);
    setScore(saved.score);
    setCorrectCount(saved.correctCount);
    setTotalAnswered(saved.totalAnswered);
    setStreak(saved.streak);
    setBestStreak(saved.bestStreak);
    if (saved.phase === "levelComplete") {
      setLevelUpMessage(pickRandomLevelUpMessage());
    }
    setPhase(saved.phase);
    setResumeAvailable(null);
  }

  function startFresh() {
    clearProgress();
    setResumeAvailable(null);
    setStudentName("");
    setLevel(1);
    setQuestions([]);
    setCurrentIndex(0);
    setMaxIndexReached(0);
    setAskedIds([]);
    setLevelAnswers(Array(QUESTIONS_PER_LEVEL).fill(null));
    setScore(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setStreak(0);
    setBestStreak(0);
    setPhase("intro");
  }

  async function fetchLevelQuestions(forLevel: number, excludeIds: string[]) {
    setPhase("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/quiz/infinite/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: difficultyForLevel(forLevel),
          excludeIds,
          count: QUESTIONS_PER_LEVEL,
          studentName,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.questions?.length) {
        setErrorMsg(json.error || "Impossible de charger les questions.");
        setPhase("error");
        return;
      }
      const freshAnswers = Array(QUESTIONS_PER_LEVEL).fill(null);
      setQuestions(json.questions);
      setCurrentIndex(0);
      setMaxIndexReached(0);
      setLevelAnswers(freshAnswers);
      setPhase("question");
      persist({
        level: forLevel,
        questions: json.questions,
        currentIndex: 0,
        maxIndexReached: 0,
        levelAnswers: freshAnswers,
        askedIds: excludeIds,
      }, "question");
    } catch {
      setErrorMsg("Erreur de connexion. Réessaie.");
      setPhase("error");
    }
  }

  async function handleStart() {
    if (!studentName.trim()) {
      setErrorMsg("Merci d'indiquer ton nom et prénom pour commencer.");
      return;
    }
    setErrorMsg("");
    await fetchLevelQuestions(1, []);
  }

  async function handleSelect(optionIdx: number) {
    if (answering) return;
    const current = questions[currentIndex];
    if (!current) return;

    const previous = levelAnswers[currentIndex];
    if (previous) return; // reponse deja donnee -> definitive, plus modifiable (meme en revision)

    setAnswering(true);
    try {
      const res = await fetch("/api/quiz/infinite/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: current.id, selectedOption: optionIdx, selectedText: current.options[optionIdx] }),
      });
      const json: AnswerFeedback = await res.json();
      json.correctOption = json.correctText ? current.options.indexOf(json.correctText) : json.correctOption;

      const newAnswer: LevelAnswer = { ...json, selectedOption: optionIdx };
      const nextLevelAnswers = [...levelAnswers];
      nextLevelAnswers[currentIndex] = newAnswer;
      setLevelAnswers(nextLevelAnswers);

      let nextScore = score;
      let nextCorrect = correctCount;
      let nextTotal = totalAnswered;
      let nextStreak = streak;
      let nextBestStreak = bestStreak;
      let nextAskedIds = askedIds;

      // Premiere (et seule) reponse possible a cette question.
      nextTotal += 1;
      nextAskedIds = [...askedIds, current.id];
      setAskedIds(nextAskedIds);
      if (json.correct) {
        nextScore += json.points || current.points || POINTS_BY_DIFFICULTY[current.difficulty];
        nextCorrect += 1;
        nextStreak += 1;
        nextBestStreak = Math.max(bestStreak, nextStreak);
      } else {
        nextStreak = 0;
      }
      setScore(nextScore);
      setCorrectCount(nextCorrect);
      setTotalAnswered(nextTotal);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);

      persist({
        levelAnswers: nextLevelAnswers,
        score: nextScore,
        correctCount: nextCorrect,
        totalAnswered: nextTotal,
        streak: nextStreak,
        bestStreak: nextBestStreak,
        askedIds: nextAskedIds,
      });

      // Une bonne reponse enchaine directement sur la question suivante,
      // sans bouton "question suivante" a cliquer.
      if (json.correct) {
        autoAdvanceTimer.current = setTimeout(() => {
          advance(nextLevelAnswers, nextScore, nextCorrect, nextTotal, nextStreak, nextBestStreak, nextAskedIds);
        }, 1000);
      }
    } catch {
      setErrorMsg("Erreur de connexion. Réessaie.");
    } finally {
      setAnswering(false);
    }
  }

  async function saveScore(reachedLevel: number, finalScore: number, finalCorrect: number, finalTotal: number) {
    setSavingScore(true);
    try {
      await fetch("/api/quiz/infinite/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          level: reachedLevel,
          score: finalScore,
          correct: finalCorrect,
          total: finalTotal,
          contactEmail,
          whatsapp,
          contactConsent,
        }),
      });
    } catch {
      // Pas grave si l'enregistrement du classement echoue : le jeu continue.
    } finally {
      setSavingScore(false);
    }
  }

  async function advance(
    updatedAnswers: (LevelAnswer | null)[],
    curScore: number,
    curCorrect: number,
    curTotal: number,
    curStreak: number,
    curBestStreak: number,
    curAskedIds: string[]
  ) {
    const nextMax = Math.max(maxIndexReached, currentIndex + 1);
    if (currentIndex + 1 < QUESTIONS_PER_LEVEL) {
      setCurrentIndex((i) => i + 1);
      setMaxIndexReached(nextMax);
      persist({ currentIndex: currentIndex + 1, maxIndexReached: nextMax });
      return;
    }
    // Niveau termine !
    setLevelUpMessage(pickRandomLevelUpMessage());
    setMaxIndexReached(nextMax);
    await saveScore(level, curScore, curCorrect, curTotal);
    setPhase("levelComplete");
    persist(
      {
        maxIndexReached: nextMax,
        levelAnswers: updatedAnswers,
        score: curScore,
        correctCount: curCorrect,
        totalAnswered: curTotal,
        streak: curStreak,
        bestStreak: curBestStreak,
        askedIds: curAskedIds,
      },
      "levelComplete"
    );
  }

  function handleManualNext() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    advance(levelAnswers, score, correctCount, totalAnswered, streak, bestStreak, askedIds);
  }

  function goToQuestion(index: number) {
    if (index < 0 || index > maxIndexReached) return;
    setCurrentIndex(index);
    persist({ currentIndex: index });
  }

  async function handleNextLevel() {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    await fetchLevelQuestions(nextLevel, askedIds);
  }

  const current = questions[currentIndex];
  const currentAnswer = levelAnswers[currentIndex] || null;
  const progressPct = ((maxIndexReached + (levelAnswers[maxIndexReached] ? 1 : 0)) / QUESTIONS_PER_LEVEL) * 100;
  const difficulty = difficultyForLevel(level);

  const levelCorrectCount = levelAnswers.filter((a) => a?.correct).length;
  const levelNoteOn20 = Math.round((levelCorrectCount / QUESTIONS_PER_LEVEL) * 20);

  if (phase === "intro") {
    return (
      <div>
        <div className="hero-banner">
          <div className="hero-badge">🔥</div>
          <h1>VEDOXA</h1>
          <p>Enchaîne les niveaux et vois jusqu&apos;où tu peux aller !</p>
        </div>

        {cancelledMessage && (
          <div className="card" style={{ background: "#fbebe0", borderColor: "#e0a45c" }}>
            <p style={{ margin: 0, color: "#b5651d", fontWeight: 600 }}>⚠️ {cancelledMessage}</p>
          </div>
        )}

        {resumeAvailable ? (
          <div className="card">
            <h2>Partie en cours 👋</h2>
            <p className="muted" style={{ marginTop: -4 }}>
              {resumeAvailable.studentName}, tu t&apos;étais arrêté(e) au niveau{" "}
              {resumeAvailable.level}. Envie de continuer ?
            </p>
            <button type="button" className="btn" onClick={() => resumeGame(resumeAvailable)}>
              Reprendre là où j&apos;en étais ▶
            </button>
            <button
              type="button"
              className="btn secondary"
              style={{ marginTop: 10 }}
              onClick={startFresh}
            >
              Recommencer à zéro
            </button>
          </div>
        ) : (
          <div className="card">
            <h2>Comment ça marche ?</h2>
            <p className="muted" style={{ marginTop: -4 }}>
              8 questions par niveau. La difficulté augmente à chaque niveau
              franchi. Chaque bonne réponse te rapporte des points et une
              référence biblique pour approfondir. Vise le meilleur score
              possible !
            </p>
            <label htmlFor="infiniteName">Ton nom et prénom</label>
            <input
              id="infiniteName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ex: Marie AGBOSSOU"
            />

            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                📩 Recevoir des infos, ou etre contacte(e) si tu es dans les premiers (facultatif)
              </summary>
              <p className="muted" style={{ marginTop: 8 }}>
                Tu peux laisser ton e-mail ou ton WhatsApp si tu souhaites être recontacté(e) — par exemple si tu fais partie des premiers du classement. Ces champs ne sont pas nécessaires pour participer.
              </p>
              <label htmlFor="infiniteContactEmail">E-mail (facultatif)</label>
              <input
                id="infiniteContactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="exemple@email.com"
              />
              <label htmlFor="infiniteWhatsapp">WhatsApp (facultatif)</label>
              <input
                id="infiniteWhatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+229 ..."
              />
              {(contactEmail.trim() || whatsapp.trim()) && (
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <input
                    type="checkbox"
                    style={{ width: "auto", margin: "3px 0 0" }}
                    checked={contactConsent}
                    onChange={(e) => setContactConsent(e.target.checked)}
                  />
                  <span>J&apos;accepte d&apos;être recontacté(e) au sujet des quiz et activités bibliques.</span>
                </label>
              )}
            </details>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
            <button type="button" className="btn" onClick={handleStart}>
              Commencer le défi 🚀
            </button>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Link href="/" className="btn secondary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="card">
        <p className="muted">Préparation du niveau {level}...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="card">
        <h1>Oups</h1>
        <p className="subtitle">{errorMsg}</p>
        <button type="button" className="btn" onClick={() => fetchLevelQuestions(level, askedIds)}>
          Réessayer
        </button>
      </div>
    );
  }

  if (phase === "levelComplete") {
    return (
      <div>
        <div className="level-complete-banner">
          <div className="big-emoji">🎉</div>
          <h1 style={{ color: "white", marginBottom: 6 }}>Niveau {level} terminé !</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{levelUpMessage}</p>
        </div>

        <div className="stat-grid">
          <div className="stat-box">
            <span className="stat-number">{levelNoteOn20}/20</span>
            <span className="stat-label">Note du niveau</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{score}</span>
            <span className="stat-label">Points cumulés</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{correctCount}/{totalAnswered}</span>
            <span className="stat-label">Bonnes réponses</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">🔥 {bestStreak}</span>
            <span className="stat-label">Meilleure série</span>
          </div>
        </div>

        <div className="card">
          <button type="button" className="btn" onClick={handleNextLevel} disabled={savingScore}>
            Niveau suivant ({DIFFICULTY_LABEL[difficultyForLevel(level + 1)]}) →
          </button>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: 6 }}>Fais passer le mot 📣</h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
            Partage ta progression pour donner envie à d&apos;autres de relever le défi.
          </p>
          <button
            type="button"
            className="btn"
            style={{ background: "#25D366" }}
            onClick={handleShare}
            disabled={sharingImage}
          >
            {sharingImage ? "Préparation..." : "Partager sur WhatsApp"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/jouer/classement" className="btn secondary small">
            🏆 Voir le classement
          </Link>
          <Link href="/" className="btn secondary small">
            Arrêter ici
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="card">
        <p className="muted">Chargement...</p>
      </div>
    );
  }

  const isReviewing = currentIndex < maxIndexReached;

  return (
    <div>
      <div className="card" style={{ position: "sticky", top: 64, zIndex: 5 }}>
        <div className="row-between">
          <span className="level-badge">Niveau {level}</span>
          <span className={`difficulty-badge ${difficulty}`}>{DIFFICULTY_LABEL[difficulty]}</span>
        </div>
        {timeLeft !== null && (
          <div
            style={{
              textAlign: "center",
              marginTop: 6,
              fontWeight: 700,
              fontSize: "1.1rem",
              color: timeLeft <= 10 ? "#b5651d" : undefined,
            }}
          >
            Temps restant : {formatTimeLeft(timeLeft)}
          </div>
        )}
        <div className="infinite-progress-track">
          <div className="infinite-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="row-between" style={{ marginTop: 4 }}>
          <span className="muted">
            Question {currentIndex + 1}/{QUESTIONS_PER_LEVEL}
          </span>
          <span className="muted">
            {score} pts {streak > 1 && <span className="streak-badge">🔥 série de {streak}</span>}
          </span>
        </div>
      </div>

      {cheatWarning && (
        <div className="card" style={{ background: "#fbebe0", borderColor: "#e0a45c" }}>
          <p style={{ margin: 0, color: "#b5651d", fontWeight: 600 }}>{cheatWarning}</p>
        </div>
      )}

      <div className="card">
        {isReviewing && (
          <div className="muted" style={{ marginBottom: 8 }}>
            ↩ Tu revois une question précédente. Ta réponse est définitive.
          </div>
        )}
        <div className="muted" style={{ marginBottom: 6 }}>{current.theme}</div>
        <div className="question-text" style={{ fontSize: "1.05rem" }}>{current.text}</div>

        {current.options.map((opt, idx) => {
          let cls = "option-btn";
          if (currentAnswer) {
            if (idx === currentAnswer.correctOption) cls += " correct";
            else if (idx === currentAnswer.selectedOption) cls += " incorrect";
          }
          return (
            <button
              key={idx}
              type="button"
              className={cls}
              disabled={answering || !!currentAnswer}
              onClick={() => handleSelect(idx)}
            >
              {opt}
            </button>
          );
        })}

        {currentAnswer && (
          <div className="info-box" style={{ marginTop: 8 }}>
            {currentAnswer.timedOut
              ? "⏱ Temps écoulé !"
              : currentAnswer.correct
                ? "✅ Bonne réponse !"
                : "❌ Pas tout à fait."}{" "}
            {currentAnswer.verseReference && (
              <strong>({currentAnswer.verseReference})</strong>
            )}
            <div style={{ marginTop: 6 }}>{currentAnswer.explanation}</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {currentIndex > 0 && (
          <button type="button" className="btn secondary small" onClick={() => goToQuestion(currentIndex - 1)}>
            ◀ Précédente
          </button>
        )}
        {isReviewing && currentIndex + 1 <= maxIndexReached && (
          <button type="button" className="btn secondary small" onClick={() => goToQuestion(currentIndex + 1)}>
            {currentIndex + 1 < maxIndexReached ? "Suivante ▶" : "Revenir à ma question ▶"}
          </button>
        )}
        {currentAnswer && !currentAnswer.correct && !isReviewing && (
          <button type="button" className="btn small" onClick={handleManualNext}>
            {currentIndex + 1 < QUESTIONS_PER_LEVEL ? "Suivant →" : "Terminer le niveau"}
          </button>
        )}
      </div>
    </div>
  );
}
