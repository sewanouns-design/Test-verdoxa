"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsAdminPanel from "@/app/admin/QuestionsAdminPanel";
import RankingAdminPanel from "@/app/admin/RankingAdminPanel";

type Tab = "questions" | "classement";

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("questions");
  const router = useRouter();
  const [stats, setStats] = useState<{players:number; questions:number; topScore:number} | null>(null);
  useEffect(() => { fetch("/api/admin/ranking").then(r => r.json()).then(j => { const rows = j.scores || []; setStats({ players: rows.length, questions: 0, topScore: rows[0]?.best_score || 0 }); }).catch(() => {}); }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Administration Verdoxa</h1>
        <button type="button" className="btn secondary small" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      {stats && <div className="stat-grid" style={{ marginBottom: 16 }}><div className="stat-box"><span className="stat-number">{stats.players}</span><span className="stat-label">Participants classés</span></div><div className="stat-box"><span className="stat-number">{stats.topScore}</span><span className="stat-label">Meilleur score</span></div></div>}

      <div className="tab-bar" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={"tab-btn" + (tab === "questions" ? " active" : "")}
          onClick={() => setTab("questions")}
        >
          Questions & réglages
        </button>
        <button
          type="button"
          className={"tab-btn" + (tab === "classement" ? " active" : "")}
          onClick={() => setTab("classement")}
        >
          Classement
        </button>
      </div>

      {tab === "questions" && <QuestionsAdminPanel />}
      {tab === "classement" && <RankingAdminPanel />}
    </div>
  );
}
