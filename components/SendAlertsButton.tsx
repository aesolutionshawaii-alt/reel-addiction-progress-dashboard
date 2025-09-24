"use client"

import { useState } from "react"

export default function SendAlertsButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleClick() {
    setStatus("sending")
    try {
      const res = await fetch("/api/send-alerts", { method: "POST" })
      if (res.ok) {
        setStatus("sent")
      } else {
        setStatus("error")
      }
    } catch (err) {
      console.error(err)
      setStatus("error")
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === "sending"}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send Alert"}
      </button>

      {status === "sent" && (
        <p className="mt-2 text-sm text-green-600">✅ Alert sent!</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">❌ Failed to send alert.</p>
      )}
    </div>
  )
}
