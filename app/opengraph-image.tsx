import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Dwellika — A living museum for artists and collectors"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAF4E6",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: "1px solid rgba(26,22,18,0.12)",
            borderRadius: "28px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #C9A96E 0%, #B8956A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#FAF4E6",
                opacity: 0.9,
              }}
            />
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: "800",
              color: "#1A1612",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Dwellika
          </div>
        </div>
        <div
          style={{
            fontSize: "30px",
            color: "#7A6A5A",
            letterSpacing: "0.02em",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          A living museum for artists and collectors
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "44px",
          }}
        >
          {["Discover", "Buy", "Connect"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(201,169,110,0.5)",
                color: "#9A7A5A",
                fontSize: "18px",
                background: "rgba(201,169,110,0.08)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
