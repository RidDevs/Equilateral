import { useState, useEffect, useRef } from "react";
import { SUGGESTIONS } from "../constants";
import { buildSystemPrompt, btnStyle } from "../utils";

// ─── Chat ─────────────────────────────────────────────────────────────────────
// AI chat page. Sends user messages to the Anthropic API with a finance
// system prompt built from the current transaction/budget state.
// Props:
//   transactions  (array)   — all transactions (used to build system prompt)
//   budgets       (object)  — { category: limitAmount }

export default function Chat({ transactions, budgets }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I've analyzed your spending data. Ask me anything about your finances — I'll give you specific, actionable advice based on your actual numbers.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("claude_api_key") || ""
  );
  const [showKey, setShowKey] = useState(
    !localStorage.getItem("claude_api_key")
  );
  const bottomRef = useRef();

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveKey = () => {
    localStorage.setItem("claude_api_key", apiKey);
    setShowKey(false);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const updatedMessages = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages(updatedMessages);
    setLoading(true);

    const key = apiKey || import.meta.env?.VITE_CLAUDE_API_KEY;
    if (!key) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Please enter your Claude API key above to enable AI responses.",
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const systemPrompt = buildSystemPrompt(transactions, budgets);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "API error");
      }

      const data = await res.json();
      const reply =
        data.content?.[0]?.text || "Sorry, I couldn't generate a response.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message}. Check your API key.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      {/* ── API Key input ── */}
      {showKey && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              color: "var(--text)",
            }}
          >
            Claude API key
          </div>
          <div
            style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}
          >
            Get your key at{" "}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#378ADD" }}
            >
              console.anthropic.com
            </a>
            . Stored locally, never sent anywhere except Anthropic.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveKey()}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 13,
              }}
            />
            <button onClick={saveKey} style={btnStyle("#1D9E75")}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* ── Chat window ── */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 16,
          flex: 1,
          minHeight: 360,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 12,
            maxHeight: 380,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius:
                    m.role === "user"
                      ? "12px 12px 4px 12px"
                      : "12px 12px 12px 4px",
                  background:
                    m.role === "user" ? "#1D9E75" : "var(--hover)",
                  color: m.role === "user" ? "#fff" : "var(--text)",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px 12px 12px 4px",
                  background: "var(--hover)",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--hover)";
                e.target.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "var(--muted)";
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your spending..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "9px 14px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={btnStyle("#1D9E75")}
          >
            Send
          </button>
          {!showKey && (
            <button
              onClick={() => setShowKey(true)}
              style={btnStyle("#888", true)}
              title="Change API key"
            >
              Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
