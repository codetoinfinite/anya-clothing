"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Application error</h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          A critical error occurred. Please reload.
          {error.digest && <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.75rem" }}>Ref: {error.digest}</span>}
        </p>
        <button onClick={reset} style={{ padding: "0.75rem 1.5rem", border: "1px solid #1a1a1a", background: "#1a1a1a", color: "#fff", cursor: "pointer" }}>
          Reload
        </button>
      </body>
    </html>
  );
}
