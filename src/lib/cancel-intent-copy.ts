/**
 * Copy for the "Thinking of cancelling?" question on /account, six locales.
 * Locale-keyed table, so scripts/check-locale-english.mjs reads every string.
 * No sales claims and no counts. NATIVE REVIEW: tone is plain and non-pushy;
 * the title and the "never blocked" line are the register-sensitive ones.
 */
import type { Locale } from "./i18n.ts"

/** The chips map onto the backend's closed exit-survey reason enum. */
export const CANCEL_INTENT_REASONS = [
  "too_expensive",
  "not_covered",
  "dont_trust",
  "just_looking",
  "other",
] as const
export type CancelIntentReason = (typeof CANCEL_INTENT_REASONS)[number]

export type CancelIntentCopy = {
  link: string
  question: string
  reasons: Record<CancelIntentReason, string>
  textLabel: string
  textPlaceholder: string
  note: string
  cont: string
  contBusy: string
  back: string
}

export const cancelIntentCopy: Record<Locale, CancelIntentCopy> = {
  en: {
    link: "Thinking of cancelling?",
    question: "What would make Resale IQ worth keeping?",
    reasons: {
      too_expensive: "A lower price",
      not_covered: "More brands and items covered",
      dont_trust: "Numbers I can trust more",
      just_looking: "I don't use it enough",
      other: "Something else",
    },
    textLabel: "Tell us in your own words (optional, but it helps a lot)",
    textPlaceholder: "What's missing, or what went wrong?",
    note: "Optional. You can cancel either way.",
    cont: "Continue to cancel",
    contBusy: "Opening…",
    back: "Keep my plan",
  },
  fr: {
    link: "Vous pensez à résilier ?",
    question: "Qu'est-ce qui rendrait Resale IQ utile à garder ?",
    reasons: {
      too_expensive: "Un prix plus bas",
      not_covered: "Plus de marques et d'articles couverts",
      dont_trust: "Des chiffres plus fiables",
      just_looking: "Je ne l'utilise pas assez",
      other: "Autre chose",
    },
    textLabel: "Dites-le avec vos mots (facultatif, mais ça nous aide beaucoup)",
    textPlaceholder: "Que manque-t-il, ou qu'est-ce qui n'a pas marché ?",
    note: "Facultatif. Vous pouvez résilier dans tous les cas.",
    cont: "Continuer vers la résiliation",
    contBusy: "Ouverture…",
    back: "Garder mon abonnement",
  },
  es: {
    link: "¿Estás pensando en cancelar?",
    question: "¿Qué haría que Resale IQ valiera la pena para ti?",
    reasons: {
      too_expensive: "Un precio más bajo",
      not_covered: "Más marcas y artículos cubiertos",
      dont_trust: "Cifras más fiables",
      just_looking: "No lo uso lo suficiente",
      other: "Otra cosa",
    },
    textLabel: "Cuéntanoslo con tus palabras (opcional, pero nos ayuda mucho)",
    textPlaceholder: "¿Qué falta o qué ha ido mal?",
    note: "Opcional. Puedes cancelar de todos modos.",
    cont: "Continuar para cancelar",
    contBusy: "Abriendo…",
    back: "Mantener mi plan",
  },
  de: {
    link: "Du überlegst zu kündigen?",
    question: "Was würde Resale IQ für dich behaltenswert machen?",
    reasons: {
      too_expensive: "Ein niedrigerer Preis",
      not_covered: "Mehr Marken und Artikel abgedeckt",
      dont_trust: "Zahlen, denen ich mehr vertrauen kann",
      just_looking: "Ich nutze es zu wenig",
      other: "Etwas anderes",
    },
    textLabel: "Sag es in eigenen Worten (optional, hilft uns aber sehr)",
    textPlaceholder: "Was fehlt oder was lief schief?",
    note: "Optional. Du kannst in jedem Fall kündigen.",
    cont: "Weiter zur Kündigung",
    contBusy: "Wird geöffnet…",
    back: "Abo behalten",
  },
  it: {
    link: "Stai pensando di disdire?",
    question: "Cosa renderebbe Resale IQ utile da tenere?",
    reasons: {
      too_expensive: "Un prezzo più basso",
      not_covered: "Più marchi e articoli coperti",
      dont_trust: "Numeri più affidabili",
      just_looking: "Non lo uso abbastanza",
      other: "Altro",
    },
    textLabel: "Raccontacelo con parole tue (facoltativo, ma ci aiuta molto)",
    textPlaceholder: "Cosa manca o cosa è andato storto?",
    note: "Facoltativo. Puoi disdire in ogni caso.",
    cont: "Continua per disdire",
    contBusy: "Apertura…",
    back: "Tieni il mio piano",
  },
  pt: {
    link: "A pensar em cancelar?",
    question: "O que faria o Resale IQ valer a pena para si?",
    reasons: {
      too_expensive: "Um preço mais baixo",
      not_covered: "Mais marcas e artigos cobertos",
      dont_trust: "Números mais fiáveis",
      just_looking: "Não o uso o suficiente",
      other: "Outra coisa",
    },
    textLabel: "Conte-nos por palavras suas (opcional, mas ajuda muito)",
    textPlaceholder: "O que falta ou o que correu mal?",
    note: "Opcional. Pode cancelar de qualquer forma.",
    cont: "Continuar para cancelar",
    contBusy: "A abrir…",
    back: "Manter o meu plano",
  },
}
