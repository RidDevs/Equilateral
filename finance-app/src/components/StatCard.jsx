

export default function StatCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "clamp(12px, 3vw, 16px) clamp(14px, 4vw, 20px)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "var(--muted)", marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "clamp(18px, 5vw, 22px)",
          fontWeight: 600,
          color: color || "var(--text)",
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "var(--muted)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
