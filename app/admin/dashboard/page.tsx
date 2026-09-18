"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsAdminPanel from "@/app/admin/QuestionsAdminPanel";
import RankingAdminPanel from "@/app/admin/RankingAdminPanel";

type Tab = "questions" | "classement";

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("questions");
  const router = useRouter();

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
