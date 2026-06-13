import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie"
      description="Informazioni su cookie tecnici, cache PWA e contenuti video."
      sections={[
        {
          title: "Cookie e strumenti tecnici",
          body: [
            "L'app usa cookie tecnici necessari per autenticazione, sessione e sicurezza. Questi cookie sono necessari al funzionamento del servizio e non richiedono consenso preventivo.",
            "I cookie tecnici sono impostati da Supabase Auth e da Next.js sul dominio dell'app. Da confermare in revisione legale: nomi reali, durata e finalita puntuali dopo il deploy definitivo.",
          ],
        },
        {
          title: "Cookie non tecnici",
          body: [
            "Al momento non sono previsti cookie di profilazione, advertising o analytics non tecnici. Se saranno introdotti, l'app dovra raccogliere un consenso libero, specifico e revocabile prima dell'attivazione.",
            "Da confermare in revisione legale: se verranno attivati analytics, crash reporting o marketing, andranno aggiunti categoria, fornitori, finalita, durata e un comando per modificare o revocare il consenso.",
          ],
        },
        {
          title: "PWA e cache",
          body: [
            "La PWA puo salvare risorse statiche e una pagina offline nel browser per migliorare caricamento e continuita del servizio.",
            "Le pagine private autenticate non vengono salvate intenzionalmente nella cache del service worker.",
            "Al logout l'app prova a cancellare cache, localStorage e sessionStorage dal dispositivo dell'utente.",
          ],
        },
        {
          title: "Notifiche push",
          body: [
            "I promemoria di allenamento sono disattivati di default e richiedono un'azione esplicita dell'utente.",
            "Se attivati, il browser salva una subscription tecnica e il server conserva endpoint e chiavi pubbliche necessarie per inviare il promemoria.",
            "L'utente puo disattivare i promemoria dal profilo o revocare il permesso dalle impostazioni del browser o del sistema operativo.",
          ],
        },
        {
          title: "Video YouTube",
          body: [
            "I video sono caricati solo dopo l'azione dell'utente sul player e usano il dominio youtube-nocookie.com quando disponibile.",
            "L'interazione con il player puo comunque comportare comunicazioni tecniche verso servizi Google/YouTube, anche fuori dallo Spazio Economico Europeo.",
            "Da confermare in revisione legale: termini applicabili, eventuali trasferimenti extra SEE e impostazioni privacy dei video incorporati.",
          ],
        },
        {
          title: "Gestione e revoca",
          body: [
            "L'utente puo cancellare cookie e dati del sito dalle impostazioni del browser. La cancellazione dei cookie di sessione richiede un nuovo accesso.",
            "Non sono presenti consensi non tecnici da gestire in questa versione. Se verranno introdotti, sara aggiunto un comando sempre raggiungibile per cambiare preferenze e revocare il consenso.",
          ],
        },
        {
          title: "Riepilogo tecnico",
          body: [
            "Cookie di sessione/autenticazione: impostati da Supabase Auth, tecnici, necessari all'accesso; durata e nomi puntuali da confermare in revisione legale dopo il deploy.",
            "Cache PWA: gestita dal service worker (cache statica e pagina offline), cancellabile dal browser o al logout.",
            "Push subscription: endpoint e chiavi tecniche, presenti solo se l'utente attiva i promemoria, revocabili dal profilo o dal browser.",
            "YouTube embed: comunicazioni tecniche verso Google/YouTube attivate solo all'avvio del video.",
          ],
        },
      ]}
    />
  );
}
