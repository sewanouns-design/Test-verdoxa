import { NextRequest, NextResponse } from "next/server";
import { DIFFICULTY_ORDER, INFINITE_QUESTIONS, InfiniteDifficulty } from "@/lib/infiniteQuestions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeName(value: unknown) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function keyForName(value: string) {
  return value.toLocaleLowerCase().normalize("NFKC");
}

export async function POST(req: NextRequest) {
  let body: { difficulty?: string; excludeIds?: string[]; count?: number; studentName?: string; sessionId?: string; level?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  const difficulty = body.difficulty as InfiniteDifficulty;
  if (!DIFFICULTY_ORDER.includes(difficulty)) return NextResponse.json({ error: "Difficulté inconnue." }, { status: 400 });

  const studentName = normalizeName(body.studentName);
  if (!studentName || studentName.length > 60) return NextResponse.json({ error: "Nom invalide (2 à 60 caractères)." }, { status: 400 });

  const { data: settings } = await supabaseAdmin.from("fbi_settings").select("questions_per_level, reset_version, is_active, easy_points, medium_points, hard_points, expert_points").eq("id", 1).maybeSingle();
  if (settings && settings.is_active === false) return NextResponse.json({ error: "Le test est temporairement désactivé." }, { status: 403 });

  const requestedCount = Number(body.count);
  const configuredCount = Number(settings?.questions_per_level || 8);
  const count = Math.min(Math.max(Number.isFinite(requestedCount) && requestedCount > 0 ? Math.floor(requestedCount) : configuredCount, 1), 20);
  const level = Math.max(1, Math.floor(Number(body.level) || 1));
  const resetVersion = Number(settings?.reset_version || 1);
  const studentKey = keyForName(studentName);

  let sessionId = String(body.sessionId || "");
  let session: any = null;
  if (sessionId) {
    const result = await supabaseAdmin.from("fbi_quiz_sessions").select("*").eq("id", sessionId).maybeSingle();
    if (result.error || !result.data) return NextResponse.json({ error: "Session de jeu introuvable. Recommence une partie." }, { status: 409 });
    session = result.data;
    if (session.status !== "active" || new Date(session.expires_at).getTime() < Date.now() || session.reset_version !== resetVersion) {
      return NextResponse.json({ error: "Cette session a expiré ou appartient à une ancienne période. Recommence une partie." }, { status: 409 });
    }
    if (session.student_key !== studentKey) return NextResponse.json({ error: "Session invalide." }, { status: 403 });
    if (level !== Number(session.current_level) + 1) return NextResponse.json({ error: "Progression de niveau invalide." }, { status: 409 });
    const { count: answeredCount } = await supabaseAdmin.from("fbi_quiz_session_questions").select("id", { count: "exact", head: true }).eq("session_id", sessionId).eq("level", Number(session.current_level)).eq("answered", true);
    if (Number(answeredCount || 0) < configuredCount) return NextResponse.json({ error: "Termine le niveau en cours avant de passer au suivant." }, { status: 409 });
  } else {
    const created = await supabaseAdmin.from("fbi_quiz_sessions").insert({ student_name: studentName, student_key: studentKey, reset_version: resetVersion, current_level: level }).select("*").single();
    if (created.error || !created.data) return NextResponse.json({ error: "Impossible de créer la session de jeu." }, { status: 500 });
    session = created.data;
    sessionId = session.id;
  }

  const excludeIds = new Set(Array.isArray(body.excludeIds) ? body.excludeIds.map(String) : []);
  const { data: played } = await supabaseAdmin.from("fbi_played_questions").select("question_id").eq("student_key", studentKey);
  (played || []).forEach((r) => excludeIds.add(r.question_id));

  const db = await supabaseAdmin.from("fbi_questions").select("id, difficulty, theme, text, options, correct_option, verse_reference, explanation, points").eq("difficulty", difficulty).eq("is_active", true);
  let pool: any[];
  if (!db.error && db.data?.length) {
    pool = db.data.map((q) => ({ ...q, id: String(q.id), options: Array.isArray(q.options) ? q.options.map(String) : [] }));
  } else {
    pool = INFINITE_QUESTIONS.filter((q) => q.difficulty === difficulty).map((q) => ({ ...q, id: q.id, correct_option: q.correctOption, verse_reference: q.verseReference, points: q.difficulty === "facile" ? 10 : q.difficulty === "moyen" ? 15 : q.difficulty === "difficile" ? 20 : 25 }));
  }

  let available = pool.filter((q) => !excludeIds.has(q.id));
  if (available.length < count) available = pool;
  if (available.length < count) return NextResponse.json({ error: `Pas assez de questions actives pour le niveau ${difficulty}.` }, { status: 409 });

  const pointByDifficulty: Record<string, number> = {
    facile: Number(settings?.easy_points || 10), moyen: Number(settings?.medium_points || 15),
    difficile: Number(settings?.hard_points || 20), expert: Number(settings?.expert_points || 25),
  };

  const picked = shuffle(available).slice(0, count);
  const sessionRows = picked.map((q) => {
    const presented = shuffle(q.options);
    const correctText = q.options[q.correct_option];
    const presentedCorrect = presented.indexOf(correctText);
    return {
      session_id: sessionId,
      question_id: q.id,
      level,
      presented_options: presented,
      correct_option: presentedCorrect,
      points: pointByDifficulty[difficulty] || Number(q.points) || 10,
      verse_reference: String(q.verse_reference || q.verseReference || ""),
      explanation: String(q.explanation || ""),
    };
  });

  const inserted = await supabaseAdmin.from("fbi_quiz_session_questions").insert(sessionRows);
  if (inserted.error) return NextResponse.json({ error: "Impossible de préparer les questions." }, { status: 500 });

  await supabaseAdmin.from("fbi_played_questions").upsert(picked.map((q) => ({ student_key: studentKey, question_id: q.id })), { onConflict: "student_key,question_id", ignoreDuplicates: true });
  await supabaseAdmin.from("fbi_quiz_sessions").update({ current_level: Math.max(Number(session.current_level || 1), level) }).eq("id", sessionId);

  const publicQuestions = picked.map((q, i) => ({ id: q.id, difficulty: q.difficulty, theme: q.theme, text: q.text, options: sessionRows[i].presented_options, points: sessionRows[i].points }));
  return NextResponse.json({ sessionId, questions: publicQuestions, questionsPerLevel: count });
}
