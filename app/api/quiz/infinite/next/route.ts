import { NextRequest, NextResponse } from "next/server";
import {
  DIFFICULTY_ORDER,
  INFINITE_QUESTIONS,
  InfiniteDifficulty,
} from "@/lib/infiniteQuestions";
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

export async function POST(req: NextRequest) {
  let body: { difficulty?: string; excludeIds?: string[]; count?: number; studentName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const difficulty = body.difficulty as InfiniteDifficulty;
  if (!DIFFICULTY_ORDER.includes(difficulty)) {
    return NextResponse.json({ error: "Difficulte inconnue." }, { status: 400 });
  }
  const excludeIds = new Set(body.excludeIds || []);
  const count = Math.min(Math.max(body.count || 8, 1), 20);
  const studentKey = (body.studentName || "").trim().toLowerCase();

  // En plus des questions deja posees dans CETTE partie (excludeIds),
  // on evite aussi celles deja vues par ce participant lors de parties
  // precedentes -- cette memoire survit aux remises a zero du
  // classement, pour que "recommencer" propose reellement de nouvelles
  // questions.
  if (studentKey) {
    const { data: played } = await supabaseAdmin
      .from("fbi_played_questions")
      .select("question_id")
      .eq("student_key", studentKey);
    (played || []).forEach((r) => excludeIds.add(r.question_id));
  }

  const db = await supabaseAdmin
    .from("fbi_questions")
    .select("id, difficulty, theme, text, options, points")
    .eq("difficulty", difficulty)
    .eq("is_active", true);
  const pool = db.error || !db.data?.length
    ? INFINITE_QUESTIONS.filter((q) => q.difficulty === difficulty).map((q) => ({ ...q, points: 0 }))
    : db.data.map((q) => ({
        id: q.id,
        difficulty: q.difficulty as InfiniteDifficulty,
        theme: q.theme,
        text: q.text,
        options: q.options as string[],
        points: q.points,
      }));

  // On evite de repeter les questions deja posees (cette partie-ci ET
  // les parties precedentes de ce participant) tant que le reservoir
  // n'est pas epuise ; une fois epuise, on remelange depuis le debut
  // (le quiz doit rester jouable indefiniment).
  let available = pool.filter((q) => !excludeIds.has(q.id));
  if (available.length < count) {
    available = pool;
  }

  const picked = shuffle(available).slice(0, count);

  if (studentKey && picked.length) {
    // Enregistrement best-effort : si ca echoue, le jeu continue quand
    // meme, seule la memoire anti-repetition sera moins precise.
    await supabaseAdmin
      .from("fbi_played_questions")
      .upsert(
        picked.map((q) => ({ student_key: studentKey, question_id: q.id })),
        { onConflict: "student_key,question_id", ignoreDuplicates: true }
      );
  }

  const publicQuestions = picked.map((q) => ({
    id: q.id,
    difficulty: q.difficulty,
    theme: q.theme,
    text: q.text,
    options: shuffle(q.options),
    points: q.points,
  }));

  return NextResponse.json({ questions: publicQuestions });
}
