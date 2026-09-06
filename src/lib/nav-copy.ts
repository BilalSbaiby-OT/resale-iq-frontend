/**
 * App-shell chrome copy (sidebar, topbar, trial banner, owner gate) in all six
 * locales.
 *
 * Why this file exists: the founder reported twice that "you choose french in
 * main page and other features etc from side pannel or anyshit dont work".
 * Measured live 2026-09-03 before writing a line of this file:
 * src/components/layout/sidebar.tsx carried 24 nav labels, 5 section headings,
 * the plan box and the upgrade button as hardcoded English string literals and
 * did not import `@/lib/i18n` at all. The sidebar renders on EVERY
 * authenticated page, so a French customer who signed up through a fully
 * translated funnel hit English chrome on every screen after it.
 *
 * Separate module rather than more keys in i18n.ts, matching the precedent
 * methodology-copy.ts already set: i18n.ts is the 86 KB marketing/funnel
 * dictionary, this is app chrome, and the two have different owners and
 * different review bars.
 *
 * Conventions held here, checked per locale rather than assumed:
 *   - Product surface names that are proper nouns in the UI stay recognisable
 *     ("Resale IQ", "Vinted", "Portfolio"/"Portfolio", "Traffic"/"Traffic")
 *     but every ordinary noun phrase is genuinely translated -- a half-English
 *     sidebar reads as broken, not as untranslated.
 *   - "watched departures" is a TERM OF ART (AGENTS.md rule 6). Nothing in
 *     this file may render as a word meaning "sold"; none of these strings
 *     touch departure data, and none may be reworded to.
 *   - pt is pt-PT ("Definições", "em direto", "encomendas"), matching
 *     methodology-copy.ts's existing pt register.
 *   - `daysLeft` is a function, not a string, because plural agreement differs
 *     per language and a "1 jours" in the trial banner is exactly the kind of
 *     detail that makes a paying visitor distrust the numbers next to it.
 */
import type { Locale } from "./i18n"

export type NavCopy = {
  sections: {
    overview: string
    intelligence: string
    workspace: string
    resources: string
    account: string
    owner: string
  }
  items: {
    check: string
    finds: string
    dashboard: string
    deals: string
    orderPlanner: string
    calculator: string
    market: string
    trends: string
    brands: string
    search: string
    compare: string
    watchlist: string
    portfolio: string
    verdict: string
    manual: string
    blog: string
    tools: string
    data: string
    support: string
    settings: string
    authenticity: string
    adminCustomers: string
    adminOps: string
    adminTraffic: string
  }
  sidebar: {
    tagline: string
    currentPlan: string
    upgrade: string
    language: string
  }
  topbar: {
    searchPlaceholder: string
    liveData: string
    account: string
    signOut: string
    openMenu: string
  }
  shell: {
    daysLeft: (n: number) => string
    upgradeNow: string
    ownerRequired: string
    ownerBody: string
    backToDashboard: string
    loading: string
  }
}

export const navCopy: Record<Locale, NavCopy> = {
  en: {
    sections: {
      overview: "Overview",
      intelligence: "Intelligence",
      workspace: "Workspace",
      resources: "Resources",
      account: "Account",
      owner: "Owner",
    },
    items: {
      check: "Check",
      finds: "Finds",
      dashboard: "Dashboard",
      deals: "Deal Scanner",
      orderPlanner: "Order Planner",
      calculator: "Calculator",
      market: "Market Signals",
      trends: "Market Trends",
      brands: "Brand Rankings",
      search: "Live Search",
      compare: "Price Compare",
      watchlist: "Watchlist",
      portfolio: "Portfolio",
      verdict: "Quick Verdict",
      manual: "Reselling Manual",
      blog: "Guides & Tips",
      tools: "Free Tools",
      data: "Market Data",
      support: "Support",
      settings: "Settings",
      authenticity: "Listing check",
      adminCustomers: "Customers",
      adminOps: "Operations",
      adminTraffic: "Traffic",
    },
    sidebar: {
      tagline: "Market intelligence",
      currentPlan: "Current plan",
      upgrade: "Upgrade",
      language: "Language",
    },
    topbar: {
      searchPlaceholder: "Search brands or models",
      liveData: "Live data",
      account: "Account",
      signOut: "Sign out",
      openMenu: "Open menu",
    },
    shell: {
      daysLeft: (n) => `${n} day${n !== 1 ? "s" : ""} left.`,
      upgradeNow: "Upgrade now",
      ownerRequired: "Owner access required",
      ownerBody: "This area is limited to the site owner. Paying Pro does not include it.",
      backToDashboard: "Back to dashboard",
      loading: "Loading",
    },
  },

  fr: {
    sections: {
      overview: "Vue d'ensemble",
      intelligence: "Intelligence marché",
      workspace: "Espace de travail",
      resources: "Ressources",
      account: "Compte",
      owner: "Propriétaire",
    },
    items: {
      check: "Vérifier",
      finds: "Offres",
      dashboard: "Tableau de bord",
      deals: "Scanner d'affaires",
      orderPlanner: "Planificateur de commandes",
      calculator: "Calculateur",
      market: "Signaux du marché",
      trends: "Tendances du marché",
      brands: "Classement des marques",
      search: "Recherche en direct",
      compare: "Comparateur de prix",
      watchlist: "Liste de suivi",
      portfolio: "Portefeuille",
      verdict: "Verdict rapide",
      manual: "Manuel de revente",
      blog: "Guides et conseils",
      tools: "Outils gratuits",
      data: "Données du marché",
      support: "Assistance",
      settings: "Paramètres",
      authenticity: "Vérification d'annonce",
      adminCustomers: "Clients",
      adminOps: "Opérations",
      adminTraffic: "Trafic",
    },
    sidebar: {
      tagline: "Intelligence de marché",
      currentPlan: "Formule actuelle",
      upgrade: "Mettre à niveau",
      language: "Langue",
    },
    topbar: {
      searchPlaceholder: "Rechercher une marque ou un modèle",
      liveData: "Données en direct",
      account: "Compte",
      signOut: "Se déconnecter",
      openMenu: "Ouvrir le menu",
    },
    shell: {
      daysLeft: (n) => (n === 1 ? "1 jour restant." : `${n} jours restants.`),
      upgradeNow: "Mettre à niveau",
      ownerRequired: "Accès propriétaire requis",
      ownerBody:
        "Cette zone est réservée au propriétaire du site. L'offre Pro payante ne l'inclut pas.",
      backToDashboard: "Retour au tableau de bord",
      loading: "Chargement",
    },
  },

  es: {
    sections: {
      overview: "Resumen",
      intelligence: "Inteligencia de mercado",
      workspace: "Espacio de trabajo",
      resources: "Recursos",
      account: "Cuenta",
      owner: "Propietario",
    },
    items: {
      check: "Consultar",
      finds: "Ofertas",
      dashboard: "Panel",
      deals: "Escáner de oportunidades",
      orderPlanner: "Planificador de pedidos",
      calculator: "Calculadora",
      market: "Señales del mercado",
      trends: "Tendencias del mercado",
      brands: "Ranking de marcas",
      search: "Búsqueda en vivo",
      compare: "Comparador de precios",
      watchlist: "Lista de seguimiento",
      portfolio: "Cartera",
      verdict: "Veredicto rápido",
      manual: "Manual de reventa",
      blog: "Guías y consejos",
      tools: "Herramientas gratuitas",
      data: "Datos del mercado",
      support: "Soporte",
      settings: "Ajustes",
      authenticity: "Comprobación de anuncio",
      adminCustomers: "Clientes",
      adminOps: "Operaciones",
      adminTraffic: "Tráfico",
    },
    sidebar: {
      tagline: "Inteligencia de mercado",
      currentPlan: "Plan actual",
      upgrade: "Mejorar plan",
      language: "Idioma",
    },
    topbar: {
      searchPlaceholder: "Buscar marcas o modelos",
      liveData: "Datos en vivo",
      account: "Cuenta",
      signOut: "Cerrar sesión",
      openMenu: "Abrir menú",
    },
    shell: {
      daysLeft: (n) => (n === 1 ? "Queda 1 día." : `Quedan ${n} días.`),
      upgradeNow: "Mejorar plan",
      ownerRequired: "Acceso de propietario requerido",
      ownerBody:
        "Esta área está limitada al propietario del sitio. El plan Pro de pago no la incluye.",
      backToDashboard: "Volver al panel",
      loading: "Cargando",
    },
  },

  de: {
    sections: {
      overview: "Übersicht",
      intelligence: "Marktanalyse",
      workspace: "Arbeitsbereich",
      resources: "Ressourcen",
      account: "Konto",
      owner: "Inhaber",
    },
    items: {
      check: "Prüfen",
      finds: "Funde",
      dashboard: "Dashboard",
      deals: "Deal-Scanner",
      orderPlanner: "Bestellplaner",
      calculator: "Rechner",
      market: "Marktsignale",
      trends: "Markttrends",
      brands: "Marken-Ranking",
      search: "Live-Suche",
      compare: "Preisvergleich",
      watchlist: "Merkliste",
      portfolio: "Portfolio",
      verdict: "Schnellurteil",
      manual: "Wiederverkaufs-Handbuch",
      blog: "Ratgeber & Tipps",
      tools: "Kostenlose Tools",
      data: "Marktdaten",
      support: "Support",
      settings: "Einstellungen",
      authenticity: "Angebotsprüfung",
      adminCustomers: "Kunden",
      adminOps: "Betrieb",
      adminTraffic: "Traffic",
    },
    sidebar: {
      tagline: "Marktintelligenz",
      currentPlan: "Aktueller Tarif",
      upgrade: "Upgrade",
      language: "Sprache",
    },
    topbar: {
      searchPlaceholder: "Marken oder Modelle suchen",
      liveData: "Live-Daten",
      account: "Konto",
      signOut: "Abmelden",
      openMenu: "Menü öffnen",
    },
    shell: {
      daysLeft: (n) => (n === 1 ? "Noch 1 Tag." : `Noch ${n} Tage.`),
      upgradeNow: "Jetzt upgraden",
      ownerRequired: "Inhaberzugang erforderlich",
      ownerBody:
        "Dieser Bereich ist dem Website-Inhaber vorbehalten. Der kostenpflichtige Pro-Tarif enthält ihn nicht.",
      backToDashboard: "Zurück zum Dashboard",
      loading: "Wird geladen",
    },
  },

  it: {
    sections: {
      overview: "Panoramica",
      intelligence: "Intelligence di mercato",
      workspace: "Area di lavoro",
      resources: "Risorse",
      account: "Account",
      owner: "Proprietario",
    },
    items: {
      check: "Verifica",
      finds: "Offerte",
      dashboard: "Dashboard",
      deals: "Scanner affari",
      orderPlanner: "Pianificatore ordini",
      calculator: "Calcolatrice",
      market: "Segnali di mercato",
      trends: "Tendenze di mercato",
      brands: "Classifica marchi",
      search: "Ricerca dal vivo",
      compare: "Confronto prezzi",
      watchlist: "Lista di controllo",
      portfolio: "Portafoglio",
      verdict: "Verdetto rapido",
      manual: "Manuale di rivendita",
      blog: "Guide e consigli",
      tools: "Strumenti gratuiti",
      data: "Dati di mercato",
      support: "Assistenza",
      settings: "Impostazioni",
      authenticity: "Verifica annuncio",
      adminCustomers: "Clienti",
      adminOps: "Operazioni",
      adminTraffic: "Traffico",
    },
    sidebar: {
      tagline: "Intelligence di mercato",
      currentPlan: "Piano attuale",
      upgrade: "Aggiorna piano",
      language: "Lingua",
    },
    topbar: {
      searchPlaceholder: "Cerca marchi o modelli",
      liveData: "Dati in tempo reale",
      account: "Account",
      signOut: "Esci",
      openMenu: "Apri menu",
    },
    shell: {
      daysLeft: (n) => (n === 1 ? "1 giorno rimanente." : `${n} giorni rimanenti.`),
      upgradeNow: "Aggiorna ora",
      ownerRequired: "Accesso proprietario richiesto",
      ownerBody:
        "Quest'area è riservata al proprietario del sito. Il piano Pro a pagamento non la include.",
      backToDashboard: "Torna alla dashboard",
      loading: "Caricamento",
    },
  },

  pt: {
    sections: {
      overview: "Visão geral",
      intelligence: "Inteligência de mercado",
      workspace: "Área de trabalho",
      resources: "Recursos",
      account: "Conta",
      owner: "Proprietário",
    },
    items: {
      check: "Verificar",
      finds: "Ofertas",
      dashboard: "Painel",
      deals: "Scanner de oportunidades",
      orderPlanner: "Planeador de encomendas",
      calculator: "Calculadora",
      market: "Sinais de mercado",
      trends: "Tendências de mercado",
      brands: "Ranking de marcas",
      search: "Pesquisa em direto",
      compare: "Comparador de preços",
      watchlist: "Lista de acompanhamento",
      portfolio: "Carteira",
      verdict: "Veredicto rápido",
      manual: "Manual de revenda",
      blog: "Guias e dicas",
      tools: "Ferramentas gratuitas",
      data: "Dados de mercado",
      support: "Apoio",
      settings: "Definições",
      authenticity: "Verificação de anúncio",
      adminCustomers: "Clientes",
      adminOps: "Operações",
      adminTraffic: "Tráfego",
    },
    sidebar: {
      tagline: "Inteligência de mercado",
      currentPlan: "Plano atual",
      upgrade: "Melhorar plano",
      language: "Idioma",
    },
    topbar: {
      searchPlaceholder: "Pesquisar marcas ou modelos",
      liveData: "Dados em direto",
      account: "Conta",
      signOut: "Terminar sessão",
      openMenu: "Abrir menu",
    },
    shell: {
      daysLeft: (n) => (n === 1 ? "Falta 1 dia." : `Faltam ${n} dias.`),
      upgradeNow: "Melhorar plano",
      ownerRequired: "Acesso de proprietário necessário",
      ownerBody:
        "Esta área está limitada ao proprietário do site. O plano Pro pago não a inclui.",
      backToDashboard: "Voltar ao painel",
      loading: "A carregar",
    },
  },
}
