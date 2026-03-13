import { useState, useMemo, useRef } from "react";
import { CATEGORY_COLORS } from "../constants";
import { parseCSV, btnStyle } from "../utils";

// ─── Transactions ─────────────────────────────────────────────────────────────
// Filterable, searchable transaction list with CSV import.
// Props:
//   transactions  (array)  — all transactions
//   onImport      (fn)     — called with parsed array after CSV upload
//   onReset       (fn)     — resets to sample data

export default function Transactions({ transactions, onImport, onReset }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const fileRef = useRef();

  const categories = ["All", ...new Set(transactions.map((t) => t.category))];

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchSearch = t.description
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchCat = catFilter === "All" || t.category === catFilter;
        return matchSearch && matchCat;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, catFilter]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length > 0) onImport(parsed);
      else
        alert(
          "Could not parse CSV. Check format: date, description, amount columns."
        );
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--card)",
            color: "var(--text)",
            fontSize: 13,
          }}
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--card)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => fileRef.current.click()}
          style={btnStyle("#1D9E75")}
        >
          Import CSV
        </button>
        <button onClick={onReset} style={btnStyle("#888", true)}>
          Reset to sample
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Description", "Category", "Amount"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: h === "Amount" ? "right" : "left",
                      color: "var(--muted)",
                      fontWeight: 500,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "10px 16px", color: "var(--muted)" }}>
                    {t.date}
                  </td>
                  <td style={{ padding: "10px 16px", color: "var(--text)" }}>
                    {t.description}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 20,
                        fontWeight: 500,
                        background:
                          (CATEGORY_COLORS[t.category] || "#888") + "22",
                        color: CATEGORY_COLORS[t.category] || "#888",
                      }}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      textAlign: "right",
                      fontWeight: 500,
                      color: t.type === "income" ? "#1D9E75" : "#E24B4A",
                    }}
                  >
                    {t.type === "income" ? "+" : ""}₹
                    {Math.abs(t.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div
          style={{
            padding: "10px 16px",
            fontSize: 12,
            color: "var(--muted)",
            borderTop: "1px solid var(--border)",
          }}
        >
          Showing {Math.min(filtered.length, 50)} of {filtered.length}{" "}
          transactions
        </div>
      </div>
    </div>
  );
}
