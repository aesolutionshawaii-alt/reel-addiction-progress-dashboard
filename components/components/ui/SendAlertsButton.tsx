"use client";

import { useState } from "react";

export default function SendAlertsButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendAlert = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/send-alerts", {
        method: "POST",
      });

      if (res.ok) {
        setMessage("✅ Alert sent!");
      } else {
        setMessage("❌ Failed to send alert.");
      }
    } catch (err) {
      setMessage("⚠️ Error sending alert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={sendAlert}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Alert"}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
"use client";
import { useState } from "react";

export default function SendAlertsButton() {
  const [status, setStatus] = useState("");

  async function handleSend() {
    setStatus("Sending alerts...");

    const res = await fetch("/api/send-alerts", {
      method: "POST",
    });

    if (res.ok) {
      setStatus("✅ Alerts sent!");
    } else {
      setStatus("❌ Failed to send alerts");
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={handleSend}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Send Alerts
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
