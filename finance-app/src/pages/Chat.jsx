import { useState, useEffect, useRef } from "react";
import { SUGGESTIONS } from "../constants";
import { useFinance } from "../context/FinanceContext";
import { buildSystemPrompt, btnStyle } from "../utils";

// ─── Chat ───────────────────────────────────────────────────────────────────
// Experimental AI advisory interface using a minimal rule-based prompt generator.

export default function Chat() {
  const { transactions, budgets, goals = [] } = useFinance();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I've analyzed your spending data. Ask me anything about your finances — I'll give you specific, actionable advice based on your actual numbers.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef();

  /* ─── Auto scroll ─── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ───────── Send Message ───────── */

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

    try {

      const systemPrompt = buildSystemPrompt(
        transactions || [],
        budgets || {},
        goals || []
      );

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          messages: updatedMessages,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Could not connect to AI service. Is the backend running?");
      }

      if (!res.ok) {
        throw new Error(data.error || "API error");
      }

      const reply = data.reply || "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message}`,
        },
      ]);

    } finally {
      setLoading(false);
    }
  };

  /* ───────── UI ───────── */

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
      }}
    >
      {/* Chat window */}

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
                    m.role === "user"
                      ? "#1D9E75"
                      : "var(--hover)",

                  color:
                    m.role === "user"
                      ? "#fff"
                      : "var(--text)",

                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {m.content}
              </div>

            </div>
          ))}

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

        {/* Suggestion buttons */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 10,
          }}
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
            >
              {s}
            </button>
          ))}

        </div>

        {/* Input */}

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

        </div>

      </div>
    </div>
  );
}