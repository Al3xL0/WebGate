import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, AlertTriangle, Ban, RefreshCw, ShieldCheck } from "lucide-react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function normalizeEvents(value) {
  return Array.isArray(value) ? value : [];
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <section className={`stat-card ${tone}`}>
      <div className="stat-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </section>
  );
}

function EventTable({ title, events, emptyText }) {
  const rows = events.slice(-8).reverse();

  return (
    <section className="table-section">
      <header>
        <h2>{title}</h2>
        <span>{events.length}</span>
      </header>
      {rows.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Agent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((event, index) => (
                <tr key={`${title}-${index}`}>
                  <td>{event.time || event.timestamp || "-"}</td>
                  <td>{event.ip || event.client || event.source_ip || "-"}</td>
                  <td>{event.method || "-"}</td>
                  <td>{event.path || event.url || event.endpoint || "-"}</td>
                  <td>{event.status || event.reason || event.action || "-"}</td>
                  <td>{event.user_agent||"none"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">{emptyText}</p>
      )}
    </section>
  );
}

function App() {
  const [traffic, setTraffic] = useState([]);
  const [badTraffic, setBadTraffic] = useState([]);
  const [wafEvents, setWafEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  async function loadTraffic() {
    setLoading(true);
    setError("");
    try {
      const [trafficData, badTrafficData, wafData] = await Promise.all([
        fetchJson("/traffic"),
        fetchJson("/badTraffic"),
        fetchJson("/waf-events")
      ]);
      setTraffic(normalizeEvents(trafficData));
      setBadTraffic(normalizeEvents(badTrafficData));
      setWafEvents(normalizeEvents(wafData));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTraffic();
    const intervalId = window.setInterval(loadTraffic, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  const totalEvents = useMemo(
    () => traffic.length + badTraffic.length + wafEvents.length,
    [traffic.length, badTraffic.length, wafEvents.length]
  );

  return (
    <main>
      <header className="page-header">
        <div>
          <p className="eyebrow">WebGate Observatory</p>
          <h1>Traffic Dashboard</h1>
        </div>
        <button type="button" onClick={loadTraffic} disabled={loading}>
          <RefreshCw size={18} aria-hidden="true" />
          Refresh
        </button>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="stats-grid" aria-label="Traffic overview">
        <StatCard icon={Activity} label="Total Events" value={totalEvents} tone="neutral" />
        <StatCard icon={ShieldCheck} label="Allowed Traffic" value={traffic.length} tone="good" />
        <StatCard icon={Ban} label="Rate Limited" value={badTraffic.length} tone="warning" />
        <StatCard icon={AlertTriangle} label="WAF Events" value={wafEvents.length} tone="danger" />
      </section>

      <div className="status-line">
        <span>{loading ? "Syncing traffic" : "Live polling every 5 seconds"}</span>
        <span>{lastUpdated ? `Updated ${lastUpdated}` : "Waiting for first update"}</span>
      </div>

      <section className="tables-grid">
        <EventTable title="Recent Traffic" events={traffic} emptyText="No traffic events recorded yet." />
        <EventTable title="Rate Limit Events" events={badTraffic} emptyText="No rate-limit events recorded yet." />
        <EventTable title="WAF Events" events={wafEvents} emptyText="No WAF events recorded yet." />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
