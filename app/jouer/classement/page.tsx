import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function InfiniteLeaderboardPage() {
  const { data } = await supabaseAdmin
    .from("fbi_scores")
    .select("student_name, best_level, best_score, best_correct, best_total")
    .order("best_level", { ascending: false })
    .order("best_score", { ascending: false })
    .limit(20);

  const ranking = data || [];

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-badge">🏆</div>
        <h1>Classement Verdoxa</h1>
        <p>Les meilleurs défis relevés jusqu&apos;ici.</p>
      </div>

      {ranking.length === 0 ? (
        <div className="card">
          <p className="muted">Personne n&apos;a encore relevé le défi. Sois le premier !</p>
        </div>
      ) : (
        <div className="card">
          {ranking.map((row, idx) => (
            <div
              className="row-between"
              key={row.student_name + idx}
              style={{
                padding: "10px 0",
                borderTop: idx === 0 ? "none" : "1px solid var(--border)",
              }}
            >
              <div className="row-between" style={{ gap: 10, justifyContent: "flex-start" }}>
                <span className="rank-badge">{idx + 1}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{row.student_name}</div>
                  <div className="muted">
                    Niveau {row.best_level} · {row.best_correct}/{row.best_total} bonnes réponses
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: "var(--navy)" }}>{row.best_score} pts</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        <Link href="/jouer" className="btn">
          🔥 Rejouer
        </Link>
        <Link href="/" className="btn secondary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
