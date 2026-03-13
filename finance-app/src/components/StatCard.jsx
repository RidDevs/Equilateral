

export default function StatCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 20px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: color || "var(--text)",
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
