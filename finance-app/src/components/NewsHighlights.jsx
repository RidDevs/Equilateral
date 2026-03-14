import { useState, useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { buildHighlightsSummary, getRuleBasedInsights } from "../utils";

const TYPE_STYLES = {
  warning: { bg: "#E24B4A22", border: "#E24B4A", icon: "⚠" },
  tip: { bg: "#1D9E7522", border: "#1D9E75", icon: "💡" },
  info: { bg: "#378ADD22", border: "#378ADD", icon: "ℹ" },
};

export default function NewsHighlights() {
  const { transactions, budgets, goals = [] } = useFinance();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const summary = buildHighlightsSummary(transactions || [], budgets || {}, goals);
    const ruleBased = getRuleBasedInsights(transactions || [], budgets || {});

    if (!transactions?.length && !Object.keys(budgets || {}).length) {
      setInsights([{
        type: "info",
        title: "No data yet",
        body: "Add transactions and budgets to see AI-powered insights.",
        category: "budgeting",
      }]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFallback(false);

    const apiUrl = import.meta.env.VITE_API_URL || "";
    fetch(`${apiUrl}/api/highlights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spendingData: summary }),
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data.insights || [];
        if (Array.isArray(list) && list.length > 0) {
          setInsights(list);
        } else {
          setInsights(ruleBased);
          setFallback(true);
        }
      })
      .catch(() => {
        setInsights(ruleBased);
        setFallback(true);
      })
      .finally(() => setLoading(false));
  }, [transactions, budgets, goals]);

  if (loading && insights.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#1D9E75",
            animation: "pulse 1s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          Generating AI insights...
        </span>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {insights.map((insight, i) => {
        const style = TYPE_STYLES[insight.type] || TYPE_STYLES.info;
        return (
          <div
            key={i}
            style={{
              padding: 14,
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderLeft: `4px solid ${style.border}`,
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: style.border,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              {style.icon} {insight.category}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 6,
              }}
            >
              {insight.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                lineHeight: 1.5,
              }}
            >
              {insight.body}
            </div>
          </div>
        );
      })}
      {fallback && insights.length > 0 && (
        <div
          style={{
            gridColumn: "1 / -1",
            fontSize: 11,
            color: "var(--muted)",
            marginTop: -4,
          }}
        >

        </div>
      )}
    </div>
  );
}
