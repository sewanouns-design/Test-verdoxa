import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function BibleKnowledgePage() {
  const { data } = await supabaseAdmin
    .from("fbi_settings")
    .select("title, subtitle, is_active")
    .eq("id", 1)
    .maybeSingle();
  const title = data?.title || "VEDOXA";

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-badge">🔥</div>
        <h1>{title}</h1>
        <p>{data?.subtitle || "Grandis dans la connaissance de la Parole, un défi à la fois — et gagne des récompenses."}</p>
      </div>
      {data?.is_active !== false ? (
        <div className="card">
          <h2>Test de connaissance biblique</h2>
          <p className="muted">
            Un test public ouvert à tous. Les questions deviennent progressivement
            plus difficiles.
          </p>
          <Link href="/jouer" className="btn">
            Commencer le test
          </Link>
        </div>
      ) : (
        <div className="card">
          <p className="muted">Le test public est temporairement fermé.</p>
        </div>
      )}
      <div className="card">
        <p className="muted" style={{ margin: 0 }}>
          VEDOXA · Test public de connaissance biblique, par niveaux
        </p>
      </div>
    </div>
  );
}
