import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function BibleKnowledgePage() {
  const { data } = await supabaseAdmin
    .from("fbi_settings")
    .select("title, subtitle, is_active")
    .eq("id", 1)
    .maybeSingle();

  const configuredTitle = data?.title?.trim();
  const title = configuredTitle && configuredTitle.toLowerCase() !== "vedoxa"
    ? configuredTitle
    : "Verdoxa";
  const subtitle = data?.subtitle?.trim() && data.subtitle.toLowerCase() !== "grandis dans la connaissance de la parole, un défi à la fois."
    ? data.subtitle
    : "Ta prochaine découverte biblique commence ici.";

  return (
    <div className="home-page">
      <section className="hero-banner hero-banner-modern">
        <div className="hero-copy">
          <span className="eyebrow"><span aria-hidden="true">✦</span> Apprendre · jouer · grandir</span>
          <h1>{title}</h1>
          <p className="hero-lead">{subtitle}</p>
          <p className="hero-support">Des quiz bibliques vivants, une progression à ton rythme et une communauté qui avance avec toi.</p>
          <div className="hero-actions">
            {data?.is_active !== false ? (
              <Link href="/jouer" className="btn hero-primary">Lancer le défi <span aria-hidden="true">→</span></Link>
            ) : (
              <span className="btn hero-primary disabled-link">Défi bientôt disponible</span>
            )}
            <Link href="/jouer/classement" className="btn hero-secondary">Voir le classement</Link>
          </div>
          <div className="hero-proof">
            <span><strong>1 défi</strong> à la fois</span>
            <span><strong>4 niveaux</strong> pour progresser</span>
            <span><strong>100 %</strong> tourné vers la Parole</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-emblem">
            <img src="/icon-512.png" alt="" />
          </div>
          <span className="hero-spark spark-one">✦</span>
          <span className="hero-spark spark-two">✧</span>
        </div>
      </section>

      <section className="home-section intro-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Ton parcours commence aujourd’hui</span>
            <h2>La Bible, en mode défi.</h2>
          </div>
          <p>Chaque question est une occasion de comprendre, de retenir et d’aller un peu plus loin.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon" aria-hidden="true">⚡</span>
            <h3>Des questions qui montent en puissance</h3>
            <p>Commence sereinement, puis relève des questions de plus en plus stimulantes.</p>
          </article>
          <article className="feature-card feature-card-accent">
            <span className="feature-icon" aria-hidden="true">🌱</span>
            <h3>Chaque bonne réponse te fait grandir</h3>
            <p>Garde ton rythme, construis ta maîtrise et célèbre chaque étape franchie.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon" aria-hidden="true">🏆</span>
            <h3>Mesure-toi avec bienveillance</h3>
            <p>Consulte le classement, partage ton score et invite tes proches à jouer.</p>
          </article>
        </div>
      </section>

      {data?.is_active !== false ? (
        <section className="challenge-card">
          <div className="challenge-icon" aria-hidden="true">🔥</div>
          <div className="challenge-content">
            <span className="eyebrow">Défi du moment</span>
            <h2>Prêt à tester ce que tu sais déjà ?</h2>
            <p>Un quiz public ouvert à tous. Pas besoin d’être expert : viens apprendre en jouant.</p>
          </div>
          <Link href="/jouer" className="btn challenge-btn">Je relève le défi</Link>
        </section>
      ) : (
        <section className="challenge-card challenge-closed">
          <div className="challenge-icon" aria-hidden="true">⏳</div>
          <div className="challenge-content">
            <span className="eyebrow">À très vite</span>
            <h2>Le prochain défi se prépare.</h2>
            <p>Le test public est temporairement fermé. Reviens bientôt pour découvrir la prochaine série.</p>
          </div>
        </section>
      )}

      <section className="home-bottom-grid">
        <div className="card progress-card">
          <div className="row-between">
            <div>
              <span className="eyebrow">Ta progression</span>
              <h2>Un pas après l’autre</h2>
            </div>
            <span className="progress-emoji" aria-hidden="true">📖</span>
          </div>
          <p className="muted">Le meilleur score est toujours celui qui te donne envie de continuer.</p>
          <div className="level-road" aria-label="Progression en quatre niveaux">
            <span className="level-dot active">1</span><span className="level-line" /><span className="level-dot">2</span><span className="level-line" /><span className="level-dot">3</span><span className="level-line" /><span className="level-dot">4</span>
          </div>
          <div className="level-labels"><span>Découverte</span><span>Maîtrise</span><span>Expertise</span></div>
        </div>
        <div className="card ranking-card">
          <span className="eyebrow">Esprit de communauté</span>
          <h2>Qui sera au sommet ?</h2>
          <p className="muted">Compare tes résultats et retrouve les joueurs qui avancent avec toi.</p>
          <Link href="/jouer/classement" className="text-link">Explorer le classement <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <p className="home-signoff"><strong>Verdoxa</strong> — la connaissance qui prend vie.</p>
    </div>
  );
}
