import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function SendMessagePage() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!text.trim()) {
      setStatus("Please enter a message.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          color,
        }),
      });

      const data = await res.json();

      if (data.status === "ok") {
        setStatus("Message sent successfully.");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error calling /api/send-message:", err);
      setStatus("Error connecting to Raspberry Pi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 bg-secondary/10 border border-secondary/30 rounded-lg p-4 space-y-4">

      <h2 className="text-lg font-bold text-secondary mb-2">Send Message</h2>

      <form onSubmit={handleSend} className="space-y-4">

        {/* Message input */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-secondary">
            Message for LCD
          </label>
          <textarea
            className="w-full rounded-md border border-secondary/40 bg-background px-3 py-2 text-sm text-secondary"
            rows={3}
            maxLength={32}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your message..."
          />
        </div>

        {/* Color picker */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-secondary">
            LED Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 rounded border border-secondary/40 bg-background cursor-pointer"
            />
            <span className="text-xs font-mono text-secondary">
              {color.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-link text-secondary text-sm font-semibold hover:bg-link/70 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      {/* Status message */}
      {status && (
        <p className="text-xs mt-2 text-secondary">
          {status}
        </p>
      )}
    </div>
  );
}

export default SendMessagePage;
