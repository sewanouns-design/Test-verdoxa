"use client";
import { useEffect, useState } from "react";

type Row = { rank: number; id: string; studentName: string; bestLevel: number; bestScore: number; bestCorrect: number; bestTotal: number; createdAt: string; updatedAt: string };

export default function PublicBibleRankingPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/ranking", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de charger le classement.");
      setRows(data.ranking || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur de chargement."); }
    finally { setLoading(false); }
  }
  async function resetRanking() {
    if (!confirm("Remettre le classement a zero ? Tous les participants actuels seront definitivement retires -- ils devront rejouer pour reapparaitre. Cette action est irreversible.")) return;
    setResetting(true); setError("");
    try {
      const response = await fetch("/api/admin/ranking", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de reinitialiser le classement.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur de reinitialisation."); }
    finally { setResetting(false); }
  }
  useEffect(() => { load(); }, []);
  return <div>
    <div className="card">
      <div className="row-between" style={{ gap: 12 }}>
        <div><h2 style={{ marginBottom: 4 }}>Classement — TEST CONNAISSANCE BIBLIQUE</h2><p className="muted" style={{ margin: 0 }}>Tous les participants enregistrés, classés par niveau atteint puis par score.</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn secondary small" type="button" onClick={load} disabled={loading}>{loading ? "Actualisation..." : "Actualiser"}</button>
          <button className="btn danger small" type="button" onClick={resetRanking} disabled={resetting || rows.length === 0}>{resetting ? "Reinitialisation..." : "Remettre a zero"}</button>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
        Utile pour demarrer une nouvelle periode d&apos;enregistrement des reponses (ex: nouvelle session du test) sans les scores precedents.
      </p>
    </div>
    {error && <div className="error-box">{error}</div>}
    <div className="card" style={{ overflowX: "auto" }}>
      {loading ? <p className="muted">Chargement du classement...</p> : rows.length === 0 ? <p className="muted">Aucun participant n’a encore terminé le test.</p> : <table><thead><tr><th>Rang</th><th>Participant</th><th>Niveau</th><th>Score</th><th>Bonnes réponses</th><th>Première participation</th><th>Dernière performance</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><strong>#{row.rank}</strong></td><td>{row.studentName}</td><td>{row.bestLevel}</td><td>{row.bestScore} pts</td><td>{row.bestCorrect}/{row.bestTotal}</td><td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString("fr-FR") : "—"}</td><td>{row.updatedAt ? new Date(row.updatedAt).toLocaleString("fr-FR") : "—"}</td></tr>)}</tbody></table>}
    </div>
  </div>;
}
