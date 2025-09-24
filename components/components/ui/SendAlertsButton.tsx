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
