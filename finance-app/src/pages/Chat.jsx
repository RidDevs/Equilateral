import { useState, useEffect, useRef } from "react";
import { SUGGESTIONS } from "../constants";
import { buildSystemPrompt, btnStyle } from "../utils";


const GEMINI_API_KEY = "AIzaSyB4x0oXOsd9zhrjl8rE1xw13VMQI98XehY";

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

      const systemPrompt = buildSystemPrompt(transactions, budgets);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },

            contents: updatedMessages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),

            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },

          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "API error");
      }

      const data = await res.json();

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

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