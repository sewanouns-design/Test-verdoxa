"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const VERSES = [
  { reference: "Psaume 119:105", text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.", theme: "Direction" },
  { reference: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie.", theme: "Courage" },
  { reference: "Proverbes 3:5", text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.", theme: "Confiance" },
  { reference: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu.", theme: "Paix" },
  { reference: "Matthieu 5:14", text: "Vous êtes la lumière du monde.", theme: "Impact" },
];

const BADGES = [
  ["🌱", "Premier pas", "Ton premier quiz terminé"],
  ["🔥", "Régulier", "3 jours dans la Parole"],
  ["📖", "Curieux", "25 questions explorées"],
  ["🏆", "Persévérant", "Un niveau terminé"],
  ["✨", "Approfondi", "5 versets sauvegardés"],
  ["🌟", "Ambassadeur", "Un parcours de 7 jours"],
];

const STORAGE = "verdoxa.spiritual-profile.v1";

type Profile = { streak: number; xp: number; savedVerses: string[]; journal: string; reminders: boolean; visited: string };
const DEFAULT_PROFILE: Profile = { streak: 1, xp: 120, savedVerses: [], journal: "", reminders: false, visited: "" };

function todayKey() { return new Date().toISOString().slice(0, 10); }
function currentVerse() { return VERSES[new Date().getDate() % VERSES.length]; }

export default function ParcoursPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [copied, setCopied] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const verse = useMemo(currentVerse, []);
  const level = Math.max(1, Math.floor(profile.xp / 100));
  const levelProgress = profile.xp % 100;
  const isSaved = profile.savedVerses.includes(verse.reference);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
    } catch { /* mode privé : l’espace continue à fonctionner */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(profile)); } catch { /* ignore */ }
  }, [profile]);

  function toggleVerse() {
    setProfile((p) => ({ ...p, savedVerses: isSaved ? p.savedVerses.filter((v) => v !== verse.reference) : [...p.savedVerses, verse.reference], xp: isSaved ? p.xp : p.xp + 10 }));
  }
  async function shareVerse() {
    const text = `${verse.text} — ${verse.reference}\nDécouvert sur Verdoxa.`;
    if (navigator.share) await navigator.share({ title: "Verset du jour — Verdoxa", text });
    else { await navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  }
  function listenVerse() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(`${verse.text}. ${verse.reference}`);
    speech.lang = "fr-FR";
    speech.rate = 0.92;
    window.speechSynthesis.speak(speech);
  }
  function toggleTheme() { setDarkMode((value) => { document.documentElement.classList.toggle("verdoxa-dark", !value); return !value; }); }
  function saveJournal(value: string) { setProfile((p) => ({ ...p, journal: value })); }

  return (
    <div className={`journey-page ${largeText ? "large-text" : ""}`}>
      <section className="journey-hero">
        <div>
          <span className="eyebrow"><span aria-hidden="true">✦</span> Mon parcours Verdoxa</span>
          <h1>Grandir, un jour à la fois.</h1>
          <p>Retrouve ici tes défis, tes découvertes et les petits pas qui construisent ton parcours dans la Parole.</p>
        </div>
        <div className="journey-level"><span>Niveau {level}</span><strong>{profile.xp} XP</strong><div className="xp-track"><i style={{ width: `${levelProgress}%` }} /></div><small>{100 - levelProgress} XP avant le prochain niveau</small></div>
      </section>

      <div className="journey-grid journey-top-grid">
        <section className="journey-card verse-card">
          <div className="card-kicker"><span>Verset du jour</span><span className="theme-pill">{verse.theme}</span></div>
          <blockquote>“{verse.text}”</blockquote>
          <p className="verse-reference">{verse.reference}</p>
          <div className="card-actions"><button className="btn small" onClick={toggleVerse}>{isSaved ? "★ Sauvegardé" : "☆ Sauvegarder"}</button><button className="btn small secondary" onClick={listenVerse}>Écouter</button><button className="btn small secondary" onClick={shareVerse}>{copied ? "Copié !" : "Partager"}</button></div>
        </section>
        <section className="journey-card streak-card"><span className="big-emoji" aria-hidden="true">🔥</span><span className="eyebrow">Ta régularité</span><strong>{profile.streak} jour{profile.streak > 1 ? "s" : ""}</strong><p>Reviens demain pour entretenir ton élan. Ici, chaque retour compte.</p><Link href="/jouer" className="text-link">Faire le défi du jour →</Link></section>
      </div>

      <section className="journey-card weekly-card"><div><span className="eyebrow">Défi de la semaine</span><h2>7 jours pour nourrir ta curiosité</h2><p className="muted">Un mini-objectif simple : ouvrir Verdoxa et découvrir une nouvelle question chaque jour.</p></div><div className="week-dots">{[1,2,3,4,5,6,7].map((day) => <span className={day <= profile.streak ? "done" : ""} key={day}>{day <= profile.streak ? "✓" : day}</span>)}</div></section>

      <section className="journey-card"><div className="section-heading compact"><div><span className="eyebrow">Tes récompenses</span><h2>Chaque étape mérite d’être célébrée.</h2></div><span className="badge-count">{Math.min(BADGES.length, Math.max(1, Math.floor(profile.xp / 100)))} / {BADGES.length}</span></div><div className="badge-grid">{BADGES.map(([icon, name, desc], index) => <article className={`journey-badge ${index < Math.max(1, Math.floor(profile.xp / 100)) ? "unlocked" : "locked"}`} key={name}><span>{index < Math.max(1, Math.floor(profile.xp / 100)) ? icon : "?"}</span><strong>{name}</strong><small>{desc}</small></article>)}</div></section>

      <div className="journey-grid journey-bottom-grid">
        <section className="journey-card journal-card"><span className="eyebrow">Journal personnel</span><h2>Ce que je retiens aujourd’hui</h2><p className="muted">Une phrase, une prière ou une idée à garder pour toi.</p><textarea value={profile.journal} onChange={(e) => saveJournal(e.target.value)} placeholder="Écris ici ta réflexion…" /><small className="saved-note">Enregistré automatiquement sur cet appareil.</small></section>
        <section className="journey-card tools-card"><span className="eyebrow">Ton espace, tes réglages</span><h2>Apprendre à ta manière</h2><label className="setting-row"><span><b>Rappels doux</b><small>Recevoir un rappel du défi</small></span><input type="checkbox" checked={profile.reminders} onChange={(e) => setProfile((p) => ({ ...p, reminders: e.target.checked }))} /></label><label className="setting-row"><span><b>Texte agrandi</b><small>Pour une lecture plus confortable</small></span><input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} /></label><button className="btn small secondary setting-button" onClick={toggleTheme}>{darkMode ? "Mode clair" : "Mode sombre"}</button></section>
      </div>

      <section className="journey-card community-card"><div className="community-icon" aria-hidden="true">🤝</div><div><span className="eyebrow">Défi entre proches</span><h2>Et si tu invitais quelqu’un à jouer ?</h2><p className="muted">Crée ton petit groupe d’étude, partage ton score et avancez ensemble dans la Parole.</p></div><button className="btn secondary small" onClick={shareVerse}>Inviter un proche</button></section>
    </div>
  );
}
