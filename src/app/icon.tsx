import { ImageResponse } from "next/og";

/**
 * Browser tab icon — same mark as the landing Logo (coral→gold gradient + Q).
 * Served from the App Router file convention at /icon.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(140deg, #ff8a70 0%, #ff6a4d 55%, #f0a83c 100%)",
          borderRadius: 8,
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 800,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", sans-serif',
          letterSpacing: "-0.04em",
        }}
      >
        Q
      </div>
    ),
    { ...size },
  );
}
