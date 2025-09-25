"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Subscribing...");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ You're subscribed. We'll notify you of updates.");
        setEmail("");
      } else {
        setStatus(`⚠️ ${data.error || "Failed to subscribe."}`);
      }
    } catch (err) {
      setStatus("⚠️ Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <p className="text-sm text-gray-700">
        Subscribe to fishing updates and trip changes. We’ll notify you when
        there’s something new.
      </p>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
      >
        Subscribe
      </button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </form>
  );
}
