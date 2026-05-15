import { ImageResponse } from "next/og";
import { THEME } from "@/lib/theme/colors";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
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
