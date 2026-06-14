import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Termini",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termini"
      description="Condizioni essenziali per usare il quaderno tecnico digitale."
      sections={[
        {
          title: "Fornitore e ambito",
          body: [
            `Il servizio e fornito da ${brand.federationName}. Contatto: ${brand.supportEmail}. Da confermare in revisione legale: denominazione legale completa, sede e territorio di offerta.`,
            `${brand.appName} e uno strumento di supporto allo studio tecnico, al diario personale e all'organizzazione dell'allenamento.`,
            "L'app non sostituisce le indicazioni dell'insegnante, della scuola o di un professionista sanitario.",
          ],
        },
        {
          title: "Account",
          body: [
            "L'account e personale. Le credenziali non devono essere condivise con altre persone.",
            "La scuola assegna ruolo, livello e accesso ai contenuti in base al percorso dell'utente.",
            "L'utente deve comunicare alla scuola eventuali accessi non autorizzati o uso improprio dell'account.",
            "Gli account sono creati solo su invito della federazione: non e prevista la registrazione autonoma per il primo rollout.",
          ],
        },
        {
          title: "Contenuti",
          body: [
            "Schede, video, note didattiche e programmi sono messi a disposizione per uso personale e formativo.",
            "La riproduzione, distribuzione o pubblicazione esterna dei contenuti puo richiedere autorizzazione di FESK o della scuola.",
            `I contenuti del curriculum (lignaggio ${brand.lineageLabel}) sono di FESK o degli aventi diritto; i video sono ospitati su YouTube. Da confermare in revisione legale: licenze d'uso, limiti di riproduzione dei video e condizioni di rimozione o aggiornamento del materiale didattico.`,
          ],
        },
        {
          title: "Dati inseriti dall'utente",
          body: [
            "L'utente e responsabile delle note personali e delle informazioni che decide di inserire nel diario pratica.",
            "Non inserire informazioni non necessarie, dati di terzi o dati sanitari sensibili.",
          ],
        },
        {
          title: "Corrispettivi, recesso e conformita",
          body: [
            "Per il primo rollout l'app e fornita da FESK come strumento di supporto, senza corrispettivo a carico dell'utente.",
            "Da confermare in revisione legale: se e quando il servizio sara incluso nella quota scuola, venduto in abbonamento o fornito B2B; in caso di vendita a consumatori, informazioni precontrattuali, prezzo, durata, rinnovo, recesso, garanzia legale di conformita dei servizi digitali e canali di assistenza.",
            "Condizioni di accesso e sospensione seguono il rapporto dell'utente con la federazione e la scuola.",
          ],
        },
        {
          title: "Disponibilita e modifiche",
          body: [
            "Il servizio puo essere aggiornato, sospeso o modificato per manutenzione, sicurezza o correzioni funzionali.",
            "Le funzioni offline della PWA sono limitate e non garantiscono disponibilita completa dei dati senza connessione.",
            `Non sono garantiti SLA formali per il primo rollout; i problemi vanno segnalati a ${brand.supportEmail}. Da confermare in revisione legale: tempi di preavviso per modifiche sostanziali e procedura di dismissione del servizio.`,
          ],
        },
        {
          title: "Uso corretto",
          body: [
            "Non usare l'app per caricare contenuti illeciti, offensivi, dati di terzi non autorizzati o informazioni non pertinenti alla pratica.",
            "Non tentare di aggirare autorizzazioni, ruoli, limiti tecnici o meccanismi di sicurezza.",
            "In caso di uso improprio FESK puo sospendere o revocare l'accesso e segnalarlo alla scuola di riferimento.",
          ],
        },
      ]}
    />
  );
}
