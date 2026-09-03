"use client"
import { useState } from "react"
import Link from "next/link"
import { canonicalPath } from "@/lib/locale-routes"
import type { Locale } from "@/lib/i18n"

/**
 * Answers the only question that decides a purchase: "will this make me more
 * than it costs?"
 *
 * TONE RULE — this must be encouraging, never alarming. The tempting version
 * computes "you are wasting €X a month on dead stock", which is a guess about
 * the reader's competence, reads as an accusation, and makes people close the
 * tab. This version answers it as a break-even instead: how few bad buys the
 * tool has to prevent before it has paid for itself. Same arithmetic, but it
 * frames the reader as someone about to get better rather than someone
 * currently failing — and it lands in items, the unit they actually think in,
 * rather than a percentage they have to translate.
 *
 * HONESTY RULE — no invented statistics. We do NOT claim a hit rate, a typical
 * saving, or "users report X". The prediction ledger has scored zero outcomes
 * so far, so any such figure would be fabricated. Everything here is the
 * reader's own numbers put through arithmetic they can check in their head.
 */
/**
 * Six locales, co-located rather than added to i18n.ts, matching how
 * trial-copy.ts and methodology-copy.ts already carry per-domain copy.
 *
 * This block rendered in English on every non-English homepage — measured
 * 2026-09-03 by loading https://resaleiq.dev/ with locale es-ES: the headline,
 * both slider labels, the break-even result and the whole disclaimer came back
 * in English inside an otherwise Spanish pricing section. It sits directly
 * above the price, which is the worst place on the site to look half-finished.
 *
 * "Starter" stays untranslated everywhere — it is the plan's name, not a word.
 */
type CalcCopy = {
  heading: string
  sub: string
  itemsLabel: string
  priceLabel: string
  costsSameAs: string
  badItem: string
  badItems: string
  perMonth: string
  /** Tokens {spend} {starter} {pct} are replaced with bold values at render
   *  time, so each language keeps its own word order AND the numbers stay
   *  emphasised — a plain interpolated string loses the <strong> that makes
   *  this line scannable. */
  spend: string
  disclaimer: string
  methodology: string
}

const CALC_COPY: Record<Locale, CalcCopy> = {
  en: {
    heading: "How many bad buys would it have to catch?",
    sub: "Move the sliders to your own numbers.",
    itemsLabel: "Items you buy a month",
    priceLabel: "What you pay per item, on average",
    costsSameAs: "At that average, Starter costs the same as",
    badItem: "bad item",
    badItems: "bad items",
    perMonth: "a month. That's it.",
    spend: "You put roughly €{spend} into stock each month. Starter is €{starter} of that — about {pct}%.",
    disclaimer:
      "Deliberately conservative: it counts only the money you spent on an item you avoid, ignoring the shipping, the listing time and the shelf space it would have taken. This is arithmetic on your own figures — we do not claim a hit rate, because we have not measured one yet and would rather say so than invent it. See ",
    methodology: "methodology",
  },
  es: {
    heading: "¿Cuántas malas compras tendría que evitar?",
    sub: "Mueve los controles a tus propios números.",
    itemsLabel: "Artículos que compras al mes",
    priceLabel: "Lo que pagas por artículo, de media",
    costsSameAs: "A esa media, Starter cuesta lo mismo que",
    badItem: "mala compra",
    badItems: "malas compras",
    perMonth: "al mes. Eso es todo.",
    spend: "Inviertes unos €{spend} en stock cada mes. Starter son €{starter} de eso — alrededor del {pct}%.",
    disclaimer:
      "Deliberadamente conservador: solo cuenta el dinero que gastaste en un artículo que evitas, sin contar el envío, el tiempo de publicación ni el espacio de almacén que habría ocupado. Esto es aritmética con tus propias cifras: no afirmamos una tasa de acierto, porque aún no la hemos medido y preferimos decirlo a inventarla. Consulta la ",
    methodology: "metodología",
  },
  fr: {
    heading: "Combien de mauvais achats devrait-il éviter ?",
    sub: "Déplacez les curseurs sur vos propres chiffres.",
    itemsLabel: "Articles que vous achetez par mois",
    priceLabel: "Ce que vous payez par article, en moyenne",
    costsSameAs: "À cette moyenne, Starter coûte autant que",
    badItem: "mauvais achat",
    badItems: "mauvais achats",
    perMonth: "par mois. C'est tout.",
    spend: "Vous investissez environ €{spend} en stock chaque mois. Starter en représente €{starter} — environ {pct}%.",
    disclaimer:
      "Volontairement prudent : cela ne compte que l'argent dépensé pour un article que vous évitez, sans le port, le temps de mise en ligne ni la place qu'il aurait occupée. C'est de l'arithmétique sur vos propres chiffres — nous n'annonçons aucun taux de réussite, car nous ne l'avons pas encore mesuré et préférons le dire plutôt que de l'inventer. Voir la ",
    methodology: "méthodologie",
  },
  de: {
    heading: "Wie viele Fehlkäufe müsste es verhindern?",
    sub: "Stellen Sie die Regler auf Ihre eigenen Zahlen.",
    itemsLabel: "Artikel, die Sie pro Monat kaufen",
    priceLabel: "Was Sie im Schnitt pro Artikel zahlen",
    costsSameAs: "Bei diesem Schnitt kostet Starter so viel wie",
    badItem: "Fehlkauf",
    badItems: "Fehlkäufe",
    perMonth: "im Monat. Mehr nicht.",
    spend: "Sie stecken rund €{spend} pro Monat in Ware. Starter sind €{starter} davon — etwa {pct}%.",
    disclaimer:
      "Bewusst konservativ: Gezählt wird nur das Geld für einen Artikel, den Sie nicht kaufen — ohne Versand, Einstellzeit und Lagerplatz, die er gekostet hätte. Das ist Rechnen mit Ihren eigenen Zahlen — wir behaupten keine Trefferquote, weil wir sie noch nicht gemessen haben und das lieber sagen, als sie zu erfinden. Siehe ",
    methodology: "Methodik",
  },
  it: {
    heading: "Quanti cattivi acquisti dovrebbe evitare?",
    sub: "Sposta i cursori sui tuoi numeri.",
    itemsLabel: "Articoli che compri al mese",
    priceLabel: "Quanto paghi per articolo, in media",
    costsSameAs: "Con quella media, Starter costa quanto",
    badItem: "cattivo acquisto",
    badItems: "cattivi acquisti",
    perMonth: "al mese. Tutto qui.",
    spend: "Investi circa €{spend} in merce ogni mese. Starter è €{starter} di quella cifra — circa il {pct}%.",
    disclaimer:
      "Volutamente conservativo: conta solo i soldi spesi per un articolo che eviti, senza la spedizione, il tempo di pubblicazione e lo spazio che avrebbe occupato. È aritmetica sui tuoi numeri — non dichiariamo un tasso di successo, perché non lo abbiamo ancora misurato e preferiamo dirlo piuttosto che inventarlo. Vedi la ",
    methodology: "metodologia",
  },
  pt: {
    heading: "Quantas más compras teria de evitar?",
    sub: "Mova os controlos para os seus próprios números.",
    itemsLabel: "Artigos que compra por mês",
    priceLabel: "O que paga por artigo, em média",
    costsSameAs: "Com essa média, o Starter custa o mesmo que",
    badItem: "má compra",
    badItems: "más compras",
    perMonth: "por mês. É só isso.",
    spend: "Investe cerca de €{spend} em stock por mês. O Starter é €{starter} disso — cerca de {pct}%.",
    disclaimer:
      "Deliberadamente conservador: conta apenas o dinheiro gasto num artigo que evita, sem incluir o envio, o tempo de publicação e o espaço que teria ocupado. Isto é aritmética sobre os seus próprios números — não afirmamos uma taxa de acerto, porque ainda não a medimos e preferimos dizê-lo a inventá-la. Ver a ",
    methodology: "metodologia",
  },
}

export function PaybackCalculator({
  locale = "en",
  starterPrice = 19,
}: {
  locale?: Locale
  /** The Starter price, passed in so this block can never quote a number the
   *  pricing cards next to it have stopped charging. */
  starterPrice?: number
}) {
  const [itemsPerMonth, setItems] = useState(20)
  const [avgBuyPrice, setAvgBuy] = useState(15)
  const c = CALC_COPY[locale] ?? CALC_COPY.en

  const STARTER = starterPrice
  // Break-even expressed in items, which is the unit a reseller actually
  // thinks in. Rounded UP so the claim is never flattering: at €15 an item,
  // 19/15 = 1.27 becomes "2 items", not "1".
  const breakEvenItems = Math.max(1, Math.ceil(STARTER / Math.max(avgBuyPrice, 1)))
  const spendPerMonth = itemsPerMonth * avgBuyPrice
  const costAsPctOfSpend = spendPerMonth > 0 ? (STARTER / spendPerMonth) * 100 : 0

  return (
    <div style={{
      maxWidth: 720, margin: "0 auto 44px", background: "#12151d",
      border: "1px solid #1c2333", borderRadius: 16, padding: "26px 24px",
    }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>
        {c.heading}
      </div>
      <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.6, marginBottom: 20 }}>
        {c.sub}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 22 }}>
        <Slider
          label={c.itemsLabel} value={itemsPerMonth} min={5} max={200} step={5}
          onChange={setItems} display={`${itemsPerMonth}`}
        />
        <Slider
          label={c.priceLabel} value={avgBuyPrice} min={5} max={120} step={1}
          onChange={setAvgBuy} display={`€${avgBuyPrice}`}
        />
      </div>

      {/* ONE number, stated in the unit the reader thinks in — items, not
          percentages. The earlier version led with "you have covered 79% of
          it", which is ambiguous (79% of what?) and made the reader do the
          translation themselves. Break-even in bad buys needs no explaining. */}
      <div style={{
        background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12,
        padding: "22px 20px", textAlign: "center",
      }}>
        <div style={{ fontSize: 13, color: "#8b99b8", marginBottom: 6 }}>
          {c.costsSameAs}
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#22c55e", lineHeight: 1.1, letterSpacing: "-1px" }}>
          {breakEvenItems} {breakEvenItems === 1 ? c.badItem : c.badItems}
        </div>
        <div style={{ fontSize: 13, color: "#8b99b8", marginTop: 6 }}>
          {c.perMonth}
        </div>

        <div style={{
          marginTop: 18, paddingTop: 16, borderTop: "1px solid #1c2333",
          fontSize: 13.5, color: "#a9b6d0", lineHeight: 1.7,
        }}>
          {renderSpend(c.spend, {
            spend: spendPerMonth.toLocaleString(locale),
            starter: String(STARTER),
            pct: costAsPctOfSpend.toFixed(1),
          })}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#5b6b8c", lineHeight: 1.6, marginTop: 14 }}>
        {c.disclaimer}
        <Link href={canonicalPath(locale, "/methodology")} style={{ color: "#22c55e", textDecoration: "none" }}>{c.methodology}</Link>.
      </p>
    </div>
  )
}

/**
 * Splits a "… {token} …" template and wraps each substituted value in <strong>.
 * Keeps the bold numerals the English version had without forcing every
 * language into English word order.
 */
function renderSpend(template: string, values: Record<string, string>) {
  return template.split(/(\{spend\}|\{starter\}|\{pct\})/g).map((part, i) => {
    const key = part.startsWith("{") ? part.slice(1, -1) : null
    if (!key) return <span key={i}>{part}</span>
    return (
      <strong key={i} style={{ color: key === "pct" ? "#22c55e" : "#eef1f7" }}>
        {values[key]}
      </strong>
    )
  })
}

function Slider({
  label, value, min, max, step, onChange, display,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (n: number) => void; display: string
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <label htmlFor={label} style={{ fontSize: 12.5, color: "#8b99b8" }}>{label}</label>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7" }}>{display}</span>
      </div>
      <input
        id={label} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
        className="riq-range"
      />
    </div>
  )
}
