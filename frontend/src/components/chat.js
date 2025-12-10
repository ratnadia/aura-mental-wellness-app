// frontend/src/components/Chat.js
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { usePersonality } from "../contexts/PersonalityContext";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const personalityOptions = [
  {
    id: "calm-female",
    label: "Calm Female Counselor",
    systemStyle:
      "a calm, gentle female counselor who listens carefully and speaks softly",
  },
  {
    id: "supportive-male",
    label: "Supportive Male Mentor",
    systemStyle:
      "a supportive male mentor who is encouraging, practical, and honest but kind",
  },
  {
    id: "neutral-friend",
    label: "Gender-neutral Calm Friend",
    systemStyle:
      "a gender-neutral calm friend who is relaxed, friendly, and non-judgmental",
  },
  {
    id: "funny-friend",
    label: "Humorous Best Friend",
    systemStyle:
      "a humorous best friend who uses light jokes while still being empathetic",
  },
];

function Chat() {
  const { user } = useAuth();
  const { personality, updatePersonality } = usePersonality();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // landing vs chat
  const [currentMood, setCurrentMood] = useState(null);

  const moodCopy = {
    sad: "It is okay if today feels heavy. You are not falling behind just because you are resting.",
    stressed:
      "You are allowed to slow down. Even a few deep breaths count as taking care of yourself.",
    anxious:
      "You do not need all the answers right now. One tiny step at a time is enough.",
    ok: "Even on 'okay' days, your feelings still matter. You do not need a big reason to share.",
    happy:
      "Savor this lightness. You are allowed to celebrate even small wins.",
    confused:
      "You can be unsure and still moving forward. Clarity often comes after you put feelings into words.",
  };

  const detectEmotion = async (text) => {
    try {
      const res = await axios.post("http://localhost:5000/api/detect-emotion", {
        text,
      });
      return res.data.emotion || "neutral";
    } catch (err) {
      console.error("emotion error", err);
      return "neutral";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMsg = {
      from: "user",
      text: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const emotion = await detectEmotion(newUserMsg.text);

      const res = await axios.post("http://localhost:5000/api/chat", {
        message: newUserMsg.text,
        personality: personality.systemStyle,
        uid: user?.uid,
        emotion,
      });

      const botMsg = {
        from: "bot",
        text: res.data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);

      setShowMoodPicker(true);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Sorry, I had trouble responding.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (mood) => {
    if (!user?.uid) return;

    setCurrentMood(mood);
    try {
      await addDoc(collection(db, "moods", user.uid, "daily"), {
        mood,
        createdAt: serverTimestamp(),
      });
      setShowMoodPicker(false);
    } catch (err) {
      console.error("Error saving mood:", err);
      setShowMoodPicker(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const starterPrompts = [
    "I feel overwhelmed and tired.",
    "I don't know what I feel today.",
    "Today felt heavy for no clear reason.",
  ];

  // ---------------- LANDING VIEW ----------------
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFE6F7] via-[#F5E9FF] to-[#E0F4FF] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_24px_80px_rgba(148,163,184,0.55)] border border-white px-6 py-8 md:px-10 md:py-10 font-aura-sans">
            {/* Logo + title big */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4 border-b border-pink-200 pb-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-200 via-fuchsia-200 to-sky-200 text-2xl text-fuchsia-700">
                  ✧
                </span>
                <div>
                  <h1 className="brand-aura text-4xl md:text-5xl tracking-[0.18em] uppercase text-black">
                    Aura
                  </h1>
                  <p className="text-sm md:text-base text-black/70 mt-2">
                    A pastel, private diary-style companion for your mind.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-fuchsia-100 px-4 py-1.5 border border-fuchsia-200">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-black/60">
                    Mental wellness
                  </span>
                  <span className="text-[13px]">🌸</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 border border-sky-200">
                  <span className="text-[11px] text-sky-700 font-medium">
                    Anonymous & gentle
                  </span>
                </span>
              </div>
            </div>

            {/* Two-column content: why + companion + start button */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Left: Why Aura feels safe */}
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-pink-100 via-rose-100 to-sky-100 border border-pink-200 rounded-3xl p-4 md:p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/60 mb-2">
                    Today&apos;s gentle reminder
                  </p>
                  <p className="text-xs md:text-sm text-black">
                    You do not have to be "fine" to check in. This space is for
                    messy, half-finished feelings too.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-sky-50 border border-pink-200 rounded-3xl p-4 md:p-5 flex flex-col gap-3">
                  <h2 className="text-sm md:text-base font-semibold text-black">
                    Why Aura feels safe
                  </h2>
                  <ul className="text-xs md:text-sm text-black/80 space-y-1.5">
                    <li>• Anonymous guest login, no name or email.</li>
                    <li>• Mood check-ins stay tied only to your account.</li>
                    <li>• Responses stay kind, short, and non-judgmental.</li>
                    <li>• You can leave anytime; no streaks, no pressure.</li>
                    <li>
                      • Your past check-ins stay in this private space so you
                      can revisit your own words later.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: choose companion + start button */}
              <div className="flex flex-col justify-between gap-6">
                <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-sky-50 border border-pink-200 rounded-3xl p-4 md:p-5 flex flex-col gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/60">
                    Step 1 · Choose your companion
                  </p>
                  <p className="text-xs md:text-sm text-black/80">
                    Pick the voice that feels most comforting. You can change
                    this anytime later.
                  </p>
                  <select
                    value={personality.id}
                    onChange={(e) => {
                      const selected = personalityOptions.find(
                        (p) => p.id === e.target.value
                      );
                      updatePersonality(selected);
                    }}
                    className="mt-2 bg-white border border-pink-200 text-xs md:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/80 text-black"
                  >
                    {personalityOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2 container with aura gradient */}
                <div className="bg-gradient-to-br from-pink-100 via-rose-100 to-sky-100 border border-pink-200 rounded-3xl p-4 md:p-5 flex flex-col gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/60">
                    Step 2 · Start your first check-in
                  </p>
                  <button
                    type="button"
                    onClick={() => setHasStarted(true)}
                    className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-2xl px-4 py-3 text-sm md:text-base font-medium shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Start chatting with Aura</span>
                    <span className="text-base">✧</span>
                  </button>
                  <p className="text-[11px] text-black/70">
                    No signup needed. You can just say "I don&apos;t know how I
                    feel" and Aura will gently guide you.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* end landing notebook */}
        </div>
      </div>
   
  );
  }

  // ---------------- CHAT VIEW ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE6F7] via-[#F5E9FF] to-[#E0F4FF] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl">
        {/* Big notebook card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_24px_80px_rgba(148,163,184,0.55)] border border-white px-5 py-6 md:px-8 md:py-7 font-aura-sans h-[85vh] flex flex-col">
          {/* Header row (fixed inside card) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 shrink-0">
            <div className="flex items-center gap-3 border-b border-pink-200 pb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-200 via-fuchsia-200 to-sky-200 text-xl text-fuchsia-700">
                ✧
              </span>
              <div>
                <h1 className="brand-aura text-3xl tracking-[0.14em] uppercase text-black">
                  Aura
                </h1>
                <p className="text-[12px] text-black/70 mt-1">
                  A soft diary for your mind
                </p>
              </div>
            </div>

            {/* Personality selector pill */}
            <div className="flex items-center gap-3 md:gap-4 self-start md:self-auto">
              <div className="hidden md:flex flex-col text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/60 mb-1">
                  Companion style
                </p>
                <select
                  value={personality.id}
                  onChange={(e) => {
                    const selected = personalityOptions.find(
                      (p) => p.id === e.target.value
                    );
                    updatePersonality(selected);
                  }}
                  className="bg-white border border-pink-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/80 text-black"
                >
                  {personalityOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Small mood tag / sticker */}
              <div className="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-3 py-1 border border-fuchsia-200">
                <span className="text-[11px] text-fuchsia-700 font-medium">
                  Safe space
                </span>
                <span className="text-[13px]">🫶</span>
              </div>
            </div>
          </div>

          {/* Middle scrollable content */}
          <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pr-1">
            {/* Messages */}
            <div className="space-y-3 border border-pink-200 rounded-2xl p-4 bg-gradient-to-b from-pink-50 via-rose-50 to-sky-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-60 gap-3 text-center animate-fadeIn">
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-pink-200 via-fuchsia-200 to-sky-200 flex items-center justify-center text-3xl">
                    🌸
                  </div>
                  <div className="max-w-xs mx-auto">
                    <p className="text-sm text-black">
                      How is your heart today?
                    </p>
                    <p className="text-[11px] text-black/60 mt-1">
                      Type anything — a feeling, a thought, or just "hi".
                    </p>
                  </div>
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 ease-out ${
                    m.from === "user"
                      ? "ml-auto bg-fuchsia-500 text-white rounded-br-sm animate-slideInRight"
                      : "mr-auto bg-white text-black rounded-bl-sm border border-fuchsia-50 animate-slideInLeft"
                  }`}
                >
                  {m.from === "bot" && (
                    <p className="text-[10px] text-black/45 mb-1">
                      Aura · today
                    </p>
                  )}
                  <p>{m.text}</p>
                  {m.createdAt && (
                    <p
                      className={`mt-1 text-[10px] ${
                        m.from === "user"
                          ? "text-white/70 text-right"
                          : "text-black/40 text-left"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </p>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-xs text-black/70 flex items-center gap-2 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                  Aura is thinking…
                </div>
              )}
            </div>

            {/* Mood picker */}
            {showMoodPicker && (
              <div className="p-3 rounded-2xl bg-white/95 flex flex-col gap-2 border border-pink-200 shadow-[0_10px_30px_rgba(248,187,208,0.45)]">
                <p className="text-xs text-black mb-1">
                  How are you feeling right now?
                </p>
                <div className="flex justify-between text-2xl">
                  <button
                    type="button"
                    onClick={() => handleMoodSelect("sad")}
                  >
                    😔
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoodSelect("stressed")}
                  >
                    😣
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoodSelect("anxious")}
                  >
                    😟
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoodSelect("confused")}
                  >
                    😕
                  </button>
                  <button type="button" onClick={() => handleMoodSelect("ok")}>
                    🙂
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoodSelect("happy")}
                  >
                    😄
                  </button>
                </div>
              </div>
            )}

            {/* Motivational quote block */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-sky-50 border border-pink-100 animate-fadeIn">
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/60 mb-1">
                Gentle thought for you
              </p>
              <p className="text-xs text-black/80">
                {moodCopy[currentMood] ||
                  "You are allowed to take up space, to feel what you feel, and to rest when your heart feels tired."}
              </p>
              <p className="mt-2 text-[10px] text-black/45">
                Aura is a gentle companion, not a crisis service. If you ever
                feel unsafe, please reach out to someone you trust or local
                helplines.
              </p>
            </div>

            {/* Starter prompts */}
            <div className="mt-1 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="text-[11px] md:text-xs px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50/80 text-black/70 hover:bg-pink-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input bar (fixed at bottom of card) */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 mt-3 bg-white/90 border border-pink-100 rounded-2xl px-3 py-2 shadow-sm shrink-0"
          >
            <input
              className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-black/40 text-black"
              placeholder="Write to Aura like a diary entry…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-50 rounded-2xl px-4 py-2 text-sm font-medium flex items-center gap-1 text-white shadow-sm"
            >
              <span>Send</span>
              <span className="text-base">✧</span>
            </button>
          </form>
        </div>
        {/* end notebook */}
      </div>
    </div>
  );
}

export default Chat;
