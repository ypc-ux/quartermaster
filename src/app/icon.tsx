import { ImageResponse } from "next/og";

export const size = { width: 96, height: 96 };
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
          background: "linear-gradient(135deg, #c9a227, #e8c84a)",
          borderRadius: "20%",
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          color: "#0B1426",
        }}
      >
        Q
      </div>
    ),
    { ...size }
  );
}