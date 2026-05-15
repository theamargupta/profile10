import { ImageResponse } from "next/og";
import { THEME } from "@/lib/theme/colors";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: THEME.surface[0],
          color: THEME.accent[400],
          fontSize: 110,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        ag
      </div>
    ),
    { ...size },
  );
}
