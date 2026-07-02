"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a1628",
          color: "#f0e6cc",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            حدث خطأ في تحميل الموقع
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.6, marginBottom: "1.5rem" }}>
            جرّب تحديث الصفحة. إذا استمرت المشكلة شغّل{" "}
            <code style={{ background: "#132238", padding: "2px 6px", borderRadius: 4 }}>
              npm run clean
            </code>{" "}
            ثم{" "}
            <code style={{ background: "#132238", padding: "2px 6px", borderRadius: 4 }}>
              npm run dev
            </code>
            .
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#00aeef",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            إعادة المحاولة
          </button>
          {process.env.NODE_ENV === "development" && error.message ? (
            <pre
              style={{
                marginTop: "1.5rem",
                textAlign: "start",
                fontSize: "0.75rem",
                overflow: "auto",
                background: "#132238",
                padding: "1rem",
                borderRadius: 8,
              }}
            >
              {error.message}
            </pre>
          ) : null}
        </div>
      </body>
    </html>
  );
}
