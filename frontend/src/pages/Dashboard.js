// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchPlan = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/moods/plan`,
          { params: { uid: user.uid } }
        );
        setPlan(res.data);
      } catch (err) {
        console.error("plan error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  if (!user?.uid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-black/70">
          Please log in to see your dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-black/70">Loading your gentle routine…</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-black/70">
          No plan yet. Try chatting and logging moods first.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE6F7] via-[#F5E9FF] to-[#E0F4FF] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_24px_80px_rgba(148,163,184,0.55)] border border-white px-6 py-8 md:px-10 md:py-10 font-aura-sans">
        <h1 className="text-2xl font-semibold mb-4">Your gentle routine</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {plan.routine?.map((item, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-pink-50 via-rose-50 to-sky-50 border border-pink-200 rounded-2xl p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/60 mb-1">
                {item.time}
              </p>
              <p className="text-sm text-black/80">{item.text}</p>
            </div>
          ))}
        </div>

        <h2 className="text-sm font-semibold mb-2">Soft reminders</h2>
        <ul className="text-sm text-black/80 space-y-1.5">
          {plan.reminders?.map((r, idx) => (
            <li key={idx}>• {r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
