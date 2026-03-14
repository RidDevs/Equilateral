import { useState, useMemo } from "react";
import { useReminders } from "../hooks";
import { fmt, btnStyle } from "../utils";

export default function BillReminders() {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleReminder, markAsPaid, markAsUnpaid } = useReminders();
  const [form, setForm] = useState({
    name: "",
    dueDate: "",
    amount: "",
    category: "Bills",
    frequency: "one-time",
  });

  const handleAddReminder = () => {
    if (form.name && form.dueDate && form.amount) {
      addReminder(form);
      setForm({ name: "", dueDate: "", amount: "", category: "Bills", frequency: "one-time" });
    }
  };

  const upcomingReminders = useMemo(() => {
    const now = new Date();
    return reminders
      .filter((r) => r.isActive && !r.isPaid)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .map((r) => {
        const dueDate = new Date(r.dueDate);
        const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntil < 0;
        const isUrgent = daysUntil <= 3 && daysUntil >= 0;
        return {
          ...r,
          daysUntil,
          isOverdue,
          isUrgent,
          status:
            daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
            daysUntil === 0 ? "Due today" :
            daysUntil === 1 ? "Due tomorrow" :
            `${daysUntil} days left`,
        };
      });
  }, [reminders]);

  const paidReminders = useMemo(() => {
    return reminders
      .filter((r) => r.isPaid)
      .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));
  }, [reminders]);

  const stats = useMemo(() => {
    const total = upcomingReminders.reduce((sum, r) => sum + r.amount, 0);
    const overdue = upcomingReminders.filter((r) => r.isOverdue).length;
    const urgent = upcomingReminders.filter((r) => r.isUrgent).length;
    return { total, overdue, urgent };
  }, [upcomingReminders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 3vw, 20px)" }}>
      {/* ── Summary stats ── */}
      <div style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)", flexWrap: "wrap" }}>
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
            Total upcoming
          </div>
          <div
            style={{
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: 600,
              color: "#1D9E75",
            }}
          >
            {fmt(stats.total)}
          </div>
        </div>
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
            Urgent (≤3 days)
          </div>
          <div
            style={{
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: 600,
              color: "#BA7517",
            }}
          >
            {stats.urgent}
          </div>
        </div>
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
            Overdue
          </div>
          <div
            style={{
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: 600,
              color: "#E24B4A",
            }}
          >
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* ── Add reminder form ── */}
      <div
        className="card-section"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "clamp(14px, 4vw, 20px)",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
            color: "var(--text)",
          }}
        >
          Add New Reminder
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
            marginBottom: 0,
          }}
        >
          <input
            placeholder="Bill name (e.g. Insurance)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              gridColumn: "1 / -1",
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <input
            type="number"
            placeholder="Amount ₹"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          >
            <option value="one-time">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={handleAddReminder}
            disabled={!form.name || !form.dueDate || !form.amount}
            style={btnStyle("#1D9E75")}
          >
            Add reminder
          </button>
        </div>
      </div>

      {/* ── Reminders list ── */}
      <div
        className="card-section"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "clamp(14px, 4vw, 20px)",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
            color: "var(--text)",
          }}
        >
          Upcoming Bills
        </div>

        {upcomingReminders.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>
            No reminders set. Add one above to get started!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  padding: 14,
                  background: "var(--hover)",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${
                    reminder.isOverdue
                      ? "#E24B4A"
                      : reminder.isUrgent
                      ? "#BA7517"
                      : "#1D9E75"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "var(--text)",
                      }}
                    >
                      {reminder.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      Due: {new Date(reminder.dueDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 20,
                      fontWeight: 500,
                      background: reminder.isOverdue
                        ? "#E24B4A22"
                        : reminder.isUrgent
                        ? "#BA751722"
                        : "#1D9E7522",
                      color: reminder.isOverdue
                        ? "#E24B4A"
                        : reminder.isUrgent
                        ? "#BA7517"
                        : "#1D9E75",
                    }}
                  >
                    {reminder.status}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 8,
                  }}
                >
                  {fmt(reminder.amount)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 8,
                    textTransform: "capitalize",
                  }}
                >
                  {reminder.frequency} · {reminder.category}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => markAsPaid(reminder.id)}
                    style={btnStyle("#1D9E75")}
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    style={btnStyle(reminder.isActive ? "#378ADD" : "#888", true)}
                  >
                    {reminder.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    style={btnStyle("#E24B4A", true)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Inactive reminders ── */}
      {reminders.filter((r) => !r.isActive).length > 0 && (
        <div
          className="card-section"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "clamp(14px, 4vw, 20px)",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--muted)",
            }}
          >
            Inactive Reminders
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reminders
              .filter((r) => !r.isActive)
              .map((reminder) => (
                <div
                  key={reminder.id}
                  style={{
                    padding: 12,
                    background: "var(--hover)",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    opacity: 0.6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        {reminder.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {fmt(reminder.amount)} · {new Date(reminder.dueDate).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      style={btnStyle("#1D9E75", true)}
                    >
                      Reactivate
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Paid reminders ── */}
      {paidReminders.length > 0 && (
        <div
          className="card-section"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "clamp(14px, 4vw, 20px)",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#1D9E75",
            }}
          >
            ✓ Paid Bills
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {paidReminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  padding: 12,
                  background: "var(--hover)",
                  borderRadius: 8,
                  border: "1px solid #1D9E7533",
                  borderLeft: "3px solid #1D9E75",
                  opacity: 0.8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: "var(--text)" }}>
                      {reminder.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {fmt(reminder.amount)} · Paid on {new Date(reminder.paidDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => markAsUnpaid(reminder.id)}
                      style={btnStyle("#888", true)}
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      style={btnStyle("#E24B4A", true)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
