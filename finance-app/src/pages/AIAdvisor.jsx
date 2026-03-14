import { useState } from "react";
import Chat from "./Chat";
import VoiceAssistant from "./VoiceAssistant";

// ─── AI Advisor ───────────────────────────────────────────────────────────────
// Wrapper for AI features: Chat and Voice Assistant sub-pages.

const SUB_TABS = [
  { key: "chat", label: "Chat" },
  { key: "voice", label: "Voice Assistant" },
];

export default function AIAdvisor() {
  const [subTab, setSubTab] = useState("chat");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Sub-navigation */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {SUB_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            style={{
              padding: "6px 16px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              background: subTab === key ? "#1D9E75" : "transparent",
              color: subTab === key ? "#fff" : "var(--muted)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === "chat" && <Chat />}
      {subTab === "voice" && <VoiceAssistant />}
    </div>
  );
}
