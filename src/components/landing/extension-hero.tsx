/**
 * Homepage hero visual: the extension panel on a Vinted listing.
 *
 * Example panel for Adidas Samba — a model the live checker actually prices.
 * Numbers are rounded from a production verdict (buy-below €33, n 42, WATCH),
 * not a live feed and not a model we cannot look up.
 */
const CHROME_STORE =
  process.env.NEXT_PUBLIC_CHROME_STORE_URL ||
  "https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm"

export function chromeStoreUrl() {
  return CHROME_STORE
}

export function ExtensionHero() {
  return (
    <div style={{ width: "100%", maxWidth: 460, marginInline: "auto" }}>
      <div
        style={{
          position: "relative",
          background: "#12151d",
          border: "1px solid #1c2333",
          borderRadius: 14,
          minHeight: 300,
          overflow: "hidden",
        }}
      >
        {/* Listing chrome — enough to read as a Vinted item page, not a data table. */}
        <div style={{ padding: "16px 16px 90px 16px" }}>
          <div style={{ fontSize: 11, color: "#5b6b8c", letterSpacing: "0.4px" }}>
            vinted.es · listing
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#eef1f7", marginTop: 10, lineHeight: 1.25 }}>
            Adidas Samba
          </div>
          <div style={{ fontSize: 13, color: "#8b99b8", marginTop: 6 }}>Size 42 · Very good</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#eef1f7", marginTop: 14, letterSpacing: "-1px" }}>
            40,00 €
          </div>
        </div>

        {/* Same card the extension injects — bottom-left, never covering Buy. */}
        <div style={{ position: "absolute", left: 14, bottom: 14, width: 232 }}>
          <div
            style={{
              background: "#12151d",
              border: "1px solid #1c2333",
              borderLeft: "3px solid #22c55e",
              borderRadius: 12,
              padding: "13px 15px",
              boxShadow: "0 8px 28px rgba(0,0,0,.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#8b99b8", marginBottom: 9 }}>
              <span
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  color: "#06090c",
                  background: "linear-gradient(135deg,#22c55e,#0ea5e9)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                R
              </span>
              Resale IQ
              {/* --color-watch (globals.css). Was hardcoded #eab308 — a third,
                  drifted amber that duplicated the WATCH token instead of
                  using it. See design/tokens.json known_splits and
                  docs/product/DESIGN-REVIEW.md §2. */}
              <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: 10.5, letterSpacing: ".4px", color: "var(--color-watch)" }}>
                WATCH
              </span>
            </div>
            <div style={{ fontSize: 10.5, color: "#5b6b8c", marginBottom: 6 }}>matched: Adidas Samba</div>
            <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, color: "#eef1f7" }}>€33</div>
            <div style={{ fontSize: 11.5, color: "#7f8da9", marginTop: 3, lineHeight: 1.45 }}>
              most you can pay for your margin
            </div>
            <div style={{ fontSize: 12, color: "var(--color-watch)", fontWeight: 600, marginTop: 8 }}>
              listed at €40 — above buy-below
            </div>
            <div style={{ fontSize: 12, color: "#a9b6d0", marginTop: 8 }}>
              avg exit <b style={{ color: "#eef1f7" }}>€50</b> · n 42
            </div>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: "#5b6b8c", marginTop: 10, lineHeight: 1.5 }}>
        Example of the Chrome panel on an Adidas Samba listing — not a live
        quote. Check the model on this page to see today&apos;s number.
      </p>
    </div>
  )
}
