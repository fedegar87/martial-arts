// Configurazione brand/istanza centralizzata.
// Per ribrandizzare l'app (altra scuola/federazione) modifica SOLO questo file:
// nome app, nome breve, descrizione, federazione titolare, email, label del lignaggio
// curricolare, colori PWA e copy della landing. Tutte le superfici (metadata,
// manifest, landing, login, export, pagine legali, nav) leggono da qui.
export const brand = {
  appName: "FESK Practice",
  shortName: "FESK",
  description: "Pratica guidata del Kung Fu tradizionale FESK",
  federationName: 'FESK - Federazione Europea Scuola Kung Fu "Fong Ttai"',
  supportEmail: "info@feskfongttai.it",
  // Etichetta del lignaggio/curriculum mostrata in libreria, hub e navigazione.
  lineageLabel: "Scuola Chang",
  // Prefisso file per l'export GDPR (<slug>-export-YYYY-MM-DD.json).
  exportSlug: "fesk-practice",
  lang: "it",
  locale: "it_IT",
  themeColor: "#080808",
  backgroundColor: "#080808",
  notificationIcon: "/icons/icon-192.png",
  calendar: {
    sourceUrl: "https://www.feskfongttai.it/la-f-e-s-k/eventi/calendario.html",
    feedUrl: "https://calendar.google.com/calendar/ical/c_21b2296138d499b918f2f950fb93be1b499adb800503e2adcf598aba5b511ee9%40group.calendar.google.com/public/basic.ics",
    timeZone: "Europe/Rome",
  },
  landing: {
    motto: "Fong Ttai",
    // Ideogrammi indicativi (abbondanza + pace): DA CONFERMARE con FESK.
    ideogram: "豐泰",
  },
} as const;
