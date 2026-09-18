import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { sessionId?: string; questionId?: string; selectedOption?: number; timedOut?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const sessionId = String(body.sessionId || "");
  const questionId = String(body.questionId || "");
  if (!sessionId || !questionId || !Number.isInteger(body.selectedOption)) return NextResponse.json({ error: "Réponse invalide." }, { status: 400 });

  const [{ data: session }, { data: question, error }] = await Promise.all([
    supabaseAdmin.from("fbi_quiz_sessions").select("*").eq("id", sessionId).maybeSingle(),
    supabaseAdmin.from("fbi_quiz_session_questions").select("id, level, presented_options, correct_option, points, verse_reference, explanation, answered, correct, timed_out").eq("session_id", sessionId).eq("question_id", questionId).maybeSingle(),
  ]);
  if (!session || session.status !== "active" || new Date(session.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "Session expirée." }, { status: 409 });
  if (error || !question) return NextResponse.json({ error: "Question non attribuée à cette session." }, { status: 404 });
  if (Number(question.level) !== Number(session.current_level)) return NextResponse.json({ error: "Cette question n'est pas active à ce stade de la partie." }, { status: 409 });
  if (question.answered) return NextResponse.json({ error: "Cette question a déjà été répondue.", alreadyAnswered: true }, { status: 409 });

  const options = Array.isArray(question.presented_options) ? question.presented_options : [];
  const selectedOption = Number(body.selectedOption);
  const timedOut = body.timedOut === true || selectedOption < 0;
  const correct = !timedOut && selectedOption === Number(question.correct_option);
  const points = correct ? Number(question.points || 0) : 0;
  const total = Number(session.total_answered || 0) + (timedOut ? 0 : 1);
  const correctCount = Number(session.correct_count || 0) + (correct ? 1 : 0);
  const score = Number(session.score || 0) + points;

  const updated = await supabaseAdmin.from("fbi_quiz_session_questions").update({ answered: true, correct, timed_out: timedOut, answered_at: new Date().toISOString() }).eq("id", question.id).eq("answered", false).select("id").maybeSingle();
  if (updated.error || !updated.data) return NextResponse.json({ error: "Cette réponse a déjà été traitée." }, { status: 409 });

  const sessionUpdate = await supabaseAdmin.from("fbi_quiz_sessions").update({ score, correct_count: correctCount, total_answered: total, updated_at: new Date().toISOString() }).eq("id", sessionId);
  if (sessionUpdate.error) return NextResponse.json({ error: "Impossible d'enregistrer le score." }, { status: 500 });

  return NextResponse.json({
    correct,
    correctOption: Number(question.correct_option),
    correctText: options[Number(question.correct_option)] || "",
    verseReference: question.verse_reference || "",
    explanation: question.explanation || "",
    points,
    timedOut,
    score,
    correctCount,
    totalAnswered: total,
  });
}
