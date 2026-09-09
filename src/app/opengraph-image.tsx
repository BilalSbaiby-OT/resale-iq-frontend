import { ImageResponse } from "next/og"
import { listingsTrackedLabel } from "@/lib/stats"

// Site-wide social card. Until now every share of resaleiq.dev on X, LinkedIn,
// WhatsApp or Slack rendered as a bare blue link with no image — the single
// cheapest visibility loss on the site, since it costs nothing per share and
// compounds with every link anyone posts.
//
// Generated rather than a static PNG so it stays in step with the brand colours
// and the headline claim, and so there is no binary asset to keep in sync.
export const alt = "Resale IQ — know what to buy on Vinted, at what price, in which sizes"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const tracked = await listingsTrackedLabel()
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0B0D10",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: "linear-gradient(135deg,#34C759,#0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#06090c",
            }}
          >
            R
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#eef1f7" }}>Resale IQ</div>
        </div>

        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "#eef1f7",
            lineHeight: 1.08,
            letterSpacing: "-2px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Stop guessing what sells.</span>
          <span style={{ color: "#34C759" }}>Know before you buy.</span>
        </div>

        {/* ONE text child, deliberately. Satori throws "Expected <div> to have
            explicit display: flex ... if it has more than one child node" the
            moment an interpolation splits this into an expression plus a text
            node, and it fails the whole build, not just the image. Keep the
            sentence a single template literal. */}
        <div style={{ fontSize: 27, color: "#8b99b8", marginTop: 30, lineHeight: 1.4 }}>
          {`${tracked} Vinted listings across 5 EU markets — buy-below price, sales momentum and the sizes that actually move.`}
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 44,
            fontSize: 21,
            color: "#5b6b8c",
          }}
        >
          <span style={{ color: "#34C759", fontWeight: 700 }}>BUY</span>
          <span>·</span>
          <span style={{ color: "#fbbf24", fontWeight: 700 }}>WATCH</span>
          <span>·</span>
          <span style={{ color: "#f87171", fontWeight: 700 }}>SKIP</span>
          <span style={{ marginLeft: 12 }}>on any item, from real watched-departure data</span>
        </div>
      </div>
    ),
    size
  )
}
