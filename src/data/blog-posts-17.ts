// Batch 17 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings promises, no tax/legal advice as professional advice.
// Authentication checks are informational; not a guarantee of authenticity.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_17: BlogPost[] = [
  {
    slug: "how-to-authenticate-designer-items-vinted",
    title: "How to Authenticate Designer Items on Vinted (2026 Guide)",
    seoTitle: "How to Spot Fake Designer Items on Vinted — Resale IQ",
    description:
      "Stone Island, Balenciaga, Gucci, Supreme, Jordan and Off-White are the six most counterfeited brands on EU Vinted. Here are the physical checks that catch fakes before you buy.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 9,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Of the 28 brands Resale IQ tracks across EU Vinted markets, six carry significant counterfeit risk: Stone Island, Balenciaga, Gucci, Supreme, Jordan, and Off-White. A Stone Island hoodie averaging €56 departure price and a Balenciaga sneaker averaging €140 are exactly the margin targets counterfeiters optimise for. This guide covers the physical checks that experienced resellers use at source — in a charity shop, at a car boot sale, or reviewing a Vinted listing's photos — before committing to a purchase.",
    definedTerm: {
      name: "Authentication",
      description:
        "Authentication is the process of verifying that an item is genuine (made by the brand it claims to be). On Vinted, authentication risk concentrates in high-margin brands where the exit price justifies producing a convincing fake. Authentication failure — buying a fake and reselling it as genuine — exposes the reseller to disputes, chargebacks, and account suspension under Vinted's counterfeit policy.",
    },
    sections: [
      {
        h: "Why authentication matters on Vinted",
        p: [
          "Vinted's counterfeit policy prohibits listing replica or fake branded items. Knowingly selling a fake as genuine exposes the seller to item removal, wallet freeze, and permanent account suspension. Buyers who receive a counterfeit can open a dispute and force a full refund — and the item is not returned in all cases.",
          "The financial exposure is asymmetric. A reseller who buys a fake Stone Island hoodie for €25 at a car boot and sells it for €45 on Vinted will receive a dispute, lose €45 from their wallet, and may not recover the €25 cost either. The expected value of selling a fake is negative even if most buyers do not notice.",
          "Authentication is not optional for the six high-risk brands below. For Fred Perry, Patagonia, New Balance, and most other tracked brands, fakes are rare and the downside is limited. For Stone Island, Balenciaga, Gucci, Supreme, Jordan, and Off-White, skip the item if you cannot confirm authenticity at source.",
        ],
      },
      {
        h: "Stone Island: the badge, patch, and compass rose",
        p: [
          "Stone Island is the single most counterfeited brand in EU charity shops. The wholesale price for fake Stone Island hoodies has dropped to under €15, and volume is high. The main checks:",
          "**The badge (detachable compass rose patch):** The genuine badge is a thick, solid construction. The compass rose is embossed cleanly with precise edges; the background panel is a consistent dark navy or black (varies by season). Fakes often show: blurry or soft embossing, misaligned compass points, thin flimsy construction that flexes easily. The badge should feel rigid, not like a cheap woven patch. On older pieces (pre-2020) the badge may be non-detachable — absence of a loop is not proof of fake, but a present badge must pass inspection.",
          "**The patch sewn into the sleeve:** The sleeve patch with 'Stone Island' text should be cleanly stitched with even tension. No puckering, no visible loose threads at corners. The font is sans-serif, consistent weight. Fakes often show inconsistent letter spacing or a slightly different typeface.",
          "**Interior labelling:** The neck label should show 'Stone Island' with the season code (e.g. '721564620' format). The composition label and wash care label are machine-stitched, not iron-on. Peel gently at the corner — genuine labels do not lift.",
          "**The garment itself:** Stone Island uses heavy-gauge cotton for hoodies (typically 370–420g/m²). Fakes are almost always noticeably lighter and thinner. Hold the garment — a real Stone Island Hoodie has weight.",
          "If the badge passes, the sleeve patch passes, and the garment weight feels right: buy. If any one element is off, walk away. There is no partial authentication on Stone Island.",
        ],
        cta: pricingMidCta("ctr_auth_20260915"),
      },
      {
        h: "Balenciaga: sneakers, T-shirts, and bags",
        p: [
          "Balenciaga Track and Triple S sneakers are among the most faked items in EU resale. Avg exit €140 (EU5, week to 15 September 2026) makes them worth the investment in a convincing fake. Checks:",
          "**Track sneaker:** Sole unit attachment — the multi-layer sole on a genuine Track does not flex independently at the midsole. Press the side: genuine soles feel structurally rigid. Fakes have visible seam separation or slight give. The heel tab should read 'Balenciaga' in bold block lettering, consistently bold — fakes often show thin or uneven letterforms. The tongue label 'Balenciaga Paris' is embossed, not printed, on genuine pairs.",
          "**Triple S:** The sole unit on a genuine Triple S is thick and consistent in colour match between layers (white/grey/black are distinct sections, not bleeding). Lace holes have metal reinforcing on genuine pairs. The heel counter is rigid — squeeze it; genuine pair holds shape, fake compresses.",
          "**T-shirts and Hoodies:** Screen print registration matters. The text on genuine Balenciaga T-shirts is precisely placed — even spacing, consistent ink fill, no bleeding at edges. Check the print under bright light. Fakes often show ink pooling or slightly blurred edges. The label stitching is tight, not raised or puckered.",
          "**Bags:** Metal hardware on genuine Balenciaga does not flake or tarnish quickly. Scratch gently with a fingernail — genuine hardware has real weight and a smooth metallic finish. The 'Balenciaga Paris' embossing on metal fittings is deep and precise on genuine pieces.",
        ],
      },
      {
        h: "Gucci: bags, caps, and belts",
        p: [
          "Gucci counterfeits in EU charity shops are most common in bags, caps, and belts. Avg bag exit price €306 (EU5, week to 15 September 2026) makes authentication essential.",
          "**GG pattern alignment:** On genuine Gucci bags, the interlocked GG logo pattern aligns at all seams — seam to seam, the pattern continues without interruption or offset. On fakes, the pattern breaks at seams, is offset, or shows colour inconsistency across panels. Check every seam on the bag exterior.",
          "**Hardware:** Genuine Gucci hardware is heavy gold or silver — not plated over plastic. Press the zipper pull with your thumb and forefinger; genuine hardware has real weight and resistance. Fakes are lightweight and hollow-sounding.",
          "**Stitching:** Genuine Gucci bags have small, consistent stitch length. Count the stitches per centimetre — typically 10–12 on genuine pieces. Fakes usually run 6–8, with visible inconsistency. Examine the stitching where handles meet the body — the highest stress point, and the most frequently cut on fakes.",
          "**Caps:** The Gucci bee or GG embroidery on genuine caps is tight, with no visible base canvas through the embroidery. Fakes often show canvas between stitches, or puckering of the cap crown around the embroidery.",
          "**The serial number:** Genuine Gucci bags have a serial number stamped into the leather interior. The number should be sharp and deep, not printed or surface-stamped.",
        ],
      },
      {
        h: "Supreme: box logo, tags, and brimless seams",
        p: [
          "Supreme box logo hoodies and T-shirts are heavily faked at EU5 market prices averaging €74/hoodie. The red box logo is the main check:",
          "**Box logo proportions:** The red rectangle's proportions on a genuine box logo are precisely defined — wider than tall by approximately 3:1. Fakes are often square, too tall, or too narrow. Print the official proportions on a card and compare at source.",
          "**'Supreme' letterforms:** The typeface is Futura Heavy Oblique. Letters have a slight italic lean. The 'e' crossbar sits at mid-height; the 'r' has a pronounced arm. Fakes often use a similar but incorrect typeface — the 'e' crossbar is too high or too low, or the italic angle is wrong.",
          "**Tags:** Genuine Supreme tags (neck and side) are thick, woven, and dimensionally raised. The text is embroidered, not printed. A printed Supreme tag is a fake.",
          "**Seam construction:** Genuine Supreme hoodies have a clean brim seam at the cuff — folded and top-stitched, no raw edge. Check the cuff interior. Fakes frequently have looser or single-stitched cuffs.",
          "**Paper label (US domestic pieces):** US-produced Supreme includes a paper 'Supreme New York' label stitched inside. EU-market pieces may not have this, but presence of a fake-looking printed label is a red flag.",
        ],
      },
      {
        h: "Jordan: OG colourways and box verification",
        p: [
          "Jordan 1 OG colourways (Bred, Chicago, Royal, Shadow) are among the most faked sneakers in EU resale. Avg exit €156 (EU5, week to 15 September 2026) on Jordan Sneakers. Checks:",
          "**Stitching on the swoosh:** The Nike swoosh on genuine Jordan 1s is stitched with even tension throughout. Pull gently at the tip — it should not give. Fakes often have inconsistent stitch tension, loose ends at the tip, or incorrect placement (the swoosh sits too high or too low relative to the toe box).",
          "**Collar stitching:** The collar of a genuine Jordan 1 is padded and stitched through to the lining in a double row. Check the inside of the collar — the stitching is visible and consistent. Fakes often have a single row or inconsistent spacing.",
          "**Sole colour:** On OG colourways, sole colours match the published spec precisely. 'Bred' has a black sole with a red heel tab; 'Chicago' has a white sole with a red heel tab. Colour mismatches — even slight — indicate a fake or a non-OG colourway misrepresented as OG.",
          "**Lace tips (aglets):** Genuine Jordan 1s have metal aglets that are tight and do not rotate around the lace. Fakes often have plastic aglets or loose metal tips.",
          "**Box labels:** Genuine pairs have a factory label on the box end with style code, size, and colourway. The label uses a consistent font and shows a genuine Nike/Jordan style code (format: XXXXXX-XXX). Verify the code against Nike's published product codes — fakes sometimes use invalid codes.",
        ],
      },
      {
        h: "Off-White: Virgil Abloh details and zip tie tags",
        p: [
          "Off-White sneakers (Avg €110, EU5 Sep 2026) and hoodies (Avg €39) are faked using cheap imitations of the brand's signature visual language. The checks are specific to the design vocabulary:",
          "**Zip tie tag:** All genuine Off-White sneakers and many apparel pieces include a zip tie tag with the Off-White logo. The tag is thick, black or white, with cleanly debossed text. Fakes use thin zip ties with printed text that rubs off. Pull the tag gently — genuine tags are rigid.",
          "**Quotation mark usage on apparel:** Off-White's signature uses quotation marks around descriptive words (e.g. \"HOODIE\", \"BELT\"). On genuine pieces, the placement and font weight are precise — Arial font, regular weight, consistent size. Fakes frequently use a slightly different weight or kerning.",
          "**The diagonal stripe pattern:** The repeating diagonal stripe on Off-White apparel uses a consistent stroke width and angle (approximately 45°). On genuine pieces, the stripe is screen-printed with clean, solid edges. Fakes often show stripe bleeding, inconsistent widths, or a different angle.",
          "**Industrial belt:** Genuine Off-White industrial belts are a specific width (approximately 5cm) with woven text that is tight and raised. The buckle is heavy-duty and does not rattle or flex. Fakes have woven text that is flat or peels, and a lightweight buckle.",
        ],
        cta: pricingBodyCta("ctr_auth_body_20260915"),
      },
      {
        h: "When to walk away and what to do with uncertain items",
        p: [
          "The rule is simple: if you cannot complete every check cleanly, do not buy. The downside — a dispute, a frozen wallet, an account flag — is not worth the margin on any single item.",
          "For items where one check is inconclusive: photograph every detail before purchase. On Vinted listings, message the seller and ask for specific photos (badge back, label close-up, sole close-up). A genuine seller will respond quickly; a seller offloading fakes often refuses or goes quiet.",
          "Professional authentication services (Vinted Protect, CheckCheck, Legit Check, Sneaker Con) charge €5–20 per item for photo-based authentication. On items above €80, this cost is worth it — it protects the margin and reduces dispute risk. Attach the authentication certificate to your Vinted listing as a photo.",
          "The brands where you can skip detailed authentication: Fred Perry (fakes are rare at EU5 charity shop prices, and easily caught by badge weight), New Balance (volume of fakes is low relative to departure volume), Patagonia (fake Patagonia in EU is uncommon — check the label construction but comprehensive authentication is rarely needed).",
          "The six brands covered above require authentication every time, at source, before purchase. There are no exceptions based on seller reputation or price.",
        ],
      },
    ],
    faq: [
      {
        q: "How do I know if a Stone Island hoodie is fake?",
        a: "Check three things: (1) the badge — it should be thick and rigid with precise compass rose embossing; fakes are thin and soft. (2) the sleeve patch — clean, consistent 'Stone Island' stitching with no puckering. (3) the garment weight — genuine Stone Island hoodies are heavy (370–420g/m²); fakes are noticeably thinner. If any of these fail, do not buy. Stone Island is the most counterfeited brand in EU charity shops.",
      },
      {
        q: "How can I tell if Balenciaga sneakers are real?",
        a: "On Balenciaga Track sneakers: check that the multi-layer sole does not flex independently at the midsole. On the Triple S: sole layer colours should be distinct with no bleeding. On both: the 'Balenciaga' heel tab lettering should be bold and even, and the tongue label should be embossed, not printed. Avg genuine departure price on EU Vinted is €140 — fakes are common because the margin justifies them.",
      },
      {
        q: "Are there fake Supreme items on Vinted?",
        a: "Yes. The main check on box logo pieces: the red rectangle proportions (approximately 3:1 width to height) and the letterform of 'Supreme' (Futura Heavy Oblique, slight italic lean). Printed neck tags are always fake — genuine Supreme tags are thick, woven, and raised. Check the cuff seam interior for double-stitching.",
      },
      {
        q: "How do I authenticate a Gucci bag on Vinted?",
        a: "Check three things: (1) GG pattern alignment at every seam — on genuine bags the pattern continues without offset or break at seams. (2) Hardware weight — genuine Gucci hardware is heavy metal, not lightweight plastic. (3) Stitch density — genuine Gucci bags show 10–12 stitches per centimetre; fakes are usually 6–8 with inconsistency. A fake fails at least one of these every time.",
      },
      {
        q: "How do I spot fake Jordan 1s?",
        a: "On OG colourways (Bred, Chicago, Royal): check the swoosh stitching tension (should not give when pulled at the tip), collar double-stitching visible from inside, and sole colour match to the published OG spec. Verify the box label style code against Nike's published codes — fakes often use invalid codes. Avg Jordan Sneaker departure price on EU Vinted is €156; OG colourways can reach €250+, which makes fakes economically viable.",
      },
      {
        q: "What happens if I accidentally sell a fake on Vinted?",
        a: "Vinted's counterfeit policy allows buyers to open a dispute within 5 days of receiving an item. If the item is confirmed counterfeit, Vinted will refund the buyer from the seller's wallet. The item may not be returned. Repeated counterfeit listings lead to account suspension. Accidental sales of items you believed were genuine can still result in disputes — this is why authentication before purchase is not optional for high-risk brands.",
      },
      {
        q: "Which brands are most faked on Vinted?",
        a: "In EU Vinted markets as of 2026: Stone Island, Balenciaga, Gucci, Supreme, Jordan, and Off-White have the highest counterfeit prevalence relative to departure volume. All six have high avg exit prices (€56–€306) that make convincing fakes economically viable. Fred Perry, Patagonia, and New Balance are less frequently faked in EU markets at charity shop price points.",
      },
    ],
  },
]
