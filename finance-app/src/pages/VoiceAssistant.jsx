import { useState, useRef, useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { buildSystemPrompt, btnStyle, parseTransactionsFromReply } from "../utils";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// ─── VoiceAssistant ───────────────────────────────────────────────────────────
// Voice-enabled AI assistant with mic, camera, and send controls.
// Independent conversation from the Chat page.

export default function VoiceAssistant() {
  const { transactions, budgets, goals = [], addTransactions } = useFinance();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const recognitionRef = useRef(null);
  const committedRef = useRef("");
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      if (finalText) {
        committedRef.current += finalText;
      }
      setInput((committedRef.current + interimText).trim());
    };
    recognition.onerror = (e) => {
      if (e.error !== "aborted" && e.error !== "no-speech") {
        setRecognitionError(e.error);
      }
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
    };
  }, []);

  const sendMessage = async (text) => {
    const userMsg = (text || input || "").trim();
    if (!userMsg || loading) return;

    setInput("");
    committedRef.current = "";
    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
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
        body: JSON.stringify({ systemPrompt, messages: updated }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "API error");

      const rawReply = data.reply || "Sorry, I couldn't respond.";

      // Check if the AI included transaction data
      const { transactions: newTxns, cleanReply } = parseTransactionsFromReply(rawReply);
      if (newTxns.length > 0) {
        addTransactions(newTxns);
      }

      const displayContent = newTxns.length > 0
        ? `${cleanReply}\n\n✅ Added ${newTxns.length} transaction(s) to your records.`
        : cleanReply;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: displayContent },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!SpeechRecognition) {
      setRecognitionError("Speech recognition not supported in this browser.");
      return;
    }
    setRecognitionError(null);
    const rec = recognitionRef.current;
    if (listening) {
      rec?.stop();
    } else {
      committedRef.current = input;
      try {
        rec?.start();
        setListening(true);
      } catch (err) {
        setRecognitionError(err.message || "Could not start microphone");
      }
    }
  };

  const toggleCamera = () => {
    // Placeholder – camera logic can be added later
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 420,
      }}
    >
      {/* Voice activity indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          marginBottom: 12,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: listening ? "#1D9E75" : "var(--muted)",
            animation: listening ? "voicePulse 1s ease-in-out infinite" : "none",
          }}
        />
        <span style={{ fontSize: 13, color: recognitionError ? "#E24B4A" : "var(--muted)" }}>
          {listening ? "Listening…" : recognitionError || "Voice ready"}
        </span>
        {recognitionError && (
          <span
            onClick={() => setRecognitionError(null)}
            style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto", cursor: "pointer" }}
            title="Dismiss"
          >
            ✕
          </span>
        )}
        <style>{`
          @keyframes voicePulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
        `}</style>
      </div>

      {/* Center: conversation messages */}
      <div
        style={{
          flex: 1,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          minHeight: 280,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 13,
                padding: 32,
              }}
            >
              Start a conversation using voice or text.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
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
                  background: m.role === "user" ? "#1D9E75" : "var(--hover)",
                  color: m.role === "user" ? "#fff" : "var(--text)",
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

        {/* Bottom: input controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              onClick={toggleMic}
              title="Microphone"
              style={{
                ...btnStyle(listening ? "#E24B4A" : "var(--hover)", true),
                width: 44,
                height: 44,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🎤
            </button>
            <button
              onClick={toggleCamera}
              title="Camera"
              style={{
                ...btnStyle("var(--hover)", true),
                width: 44,
                height: 44,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              📷
            </button>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                ...btnStyle("#1D9E75"),
                minWidth: 100,
                height: 44,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
