/**
 * Copy for the exit survey, all six site locales (O2, 2026-10-03).
 * Locale-keyed table, so scripts/check-locale-english.mjs reads every string.
 * NATIVE REVIEW: wording is plain and short on purpose; the "other" prompt and
 * the thank-you line are the two most register-sensitive (tu/vous/Sie/Lei).
 */
import type { Locale } from "./i18n.ts"
import type { ExitSurveyReason } from "./exit-survey.ts"

export type ExitSurveyCopy = {
  question: string
  reasons: Record<ExitSurveyReason, string>
  otherPlaceholder: string
  send: string
  dismiss: string
  thanks: string
}

export const exitSurveyCopy: Record<Locale, ExitSurveyCopy> = {
  en: {
    question: "What stopped you?",
    reasons: {
      too_expensive: "Too expensive",
      dont_trust: "Don't trust the numbers",
      not_covered: "My item/brand isn't covered",
      seller_not_buyer: "I sell, I don't buy",
      just_looking: "Just looking",
      other: "Other",
    },
    otherPlaceholder: "A few words are enough (optional)",
    send: "Send",
    dismiss: "Dismiss",
    thanks: "Thanks, noted.",
  },
  fr: {
    question: "Qu'est-ce qui vous a retenu ?",
    reasons: {
      too_expensive: "Trop cher",
      dont_trust: "Je ne fais pas confiance aux chiffres",
      not_covered: "Mon article ou ma marque n'est pas couvert",
      seller_not_buyer: "Je vends, je n'achète pas",
      just_looking: "Je regarde seulement",
      other: "Autre",
    },
    otherPlaceholder: "Quelques mots suffisent (facultatif)",
    send: "Envoyer",
    dismiss: "Fermer",
    thanks: "Merci, c'est noté.",
  },
  es: {
    question: "¿Qué te ha frenado?",
    reasons: {
      too_expensive: "Demasiado caro",
      dont_trust: "No me fío de las cifras",
      not_covered: "Mi artículo o marca no está cubierto",
      seller_not_buyer: "Vendo, no compro",
      just_looking: "Solo estoy mirando",
      other: "Otro",
    },
    otherPlaceholder: "Con pocas palabras basta (opcional)",
    send: "Enviar",
    dismiss: "Cerrar",
    thanks: "Gracias, anotado.",
  },
  de: {
    question: "Was hat Sie aufgehalten?",
    reasons: {
      too_expensive: "Zu teuer",
      dont_trust: "Ich traue den Zahlen nicht",
      not_covered: "Mein Artikel oder meine Marke fehlt",
      seller_not_buyer: "Ich verkaufe, ich kaufe nicht",
      just_looking: "Ich schaue nur",
      other: "Sonstiges",
    },
    otherPlaceholder: "Ein paar Worte genügen (optional)",
    send: "Senden",
    dismiss: "Schließen",
    thanks: "Danke, notiert.",
  },
  it: {
    question: "Cosa ti ha fermato?",
    reasons: {
      too_expensive: "Troppo caro",
      dont_trust: "Non mi fido dei numeri",
      not_covered: "Il mio articolo o brand non è coperto",
      seller_not_buyer: "Vendo, non compro",
      just_looking: "Sto solo guardando",
      other: "Altro",
    },
    otherPlaceholder: "Bastano poche parole (facoltativo)",
    send: "Invia",
    dismiss: "Chiudi",
    thanks: "Grazie, preso nota.",
  },
  pt: {
    question: "O que o impediu?",
    reasons: {
      too_expensive: "Demasiado caro",
      dont_trust: "Não confio nos números",
      not_covered: "O meu artigo ou marca não está coberto",
      seller_not_buyer: "Vendo, não compro",
      just_looking: "Estou só a ver",
      other: "Outro",
    },
    otherPlaceholder: "Poucas palavras chegam (opcional)",
    send: "Enviar",
    dismiss: "Fechar",
    thanks: "Obrigado, ficou registado.",
  },
}
