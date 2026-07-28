import { ImageResponse } from "next/og";

/** Home-screen / pinned-tab icon (iOS expects ~180px). */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 40,
          color: "#ffffff",
          fontSize: 108,
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
