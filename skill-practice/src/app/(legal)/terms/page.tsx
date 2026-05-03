import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

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
            "[PLACEHOLDER: inserire soggetto che fornisce il servizio, contatti, eventuale referente della scuola e territorio di offerta.]",
            "Kung Fu Practice e uno strumento di supporto allo studio tecnico, al diario personale e all'organizzazione dell'allenamento.",
            "L'app non sostituisce le indicazioni dell'insegnante, della scuola o di un professionista sanitario.",
          ],
        },
        {
          title: "Account",
          body: [
            "L'account e personale. Le credenziali non devono essere condivise con altre persone.",
            "La scuola puo assegnare ruolo, livello e accesso ai contenuti in base al percorso dell'utente.",
            "L'utente deve comunicare alla scuola eventuali accessi non autorizzati o uso improprio dell'account.",
            "[PLACEHOLDER: indicare se l'account e creato su invito della scuola, su registrazione autonoma o tramite contratto/abbonamento.]",
          ],
        },
        {
          title: "Contenuti",
          body: [
            "Schede, video, note didattiche e programmi sono messi a disposizione per uso personale e formativo.",
            "La riproduzione, distribuzione o pubblicazione esterna dei contenuti puo richiedere autorizzazione del titolare o della scuola.",
            "[PLACEHOLDER: indicare titolarita dei contenuti, licenze, limiti di uso dei video e condizioni di rimozione o aggiornamento del materiale didattico.]",
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
            "[PLACEHOLDER: indicare se il servizio e gratuito, incluso nella quota scuola, venduto in abbonamento o fornito B2B alla scuola.]",
            "[PLACEHOLDER: se venduto a consumatori, inserire informazioni precontrattuali, prezzo, durata, rinnovo, recesso, garanzia legale di conformita dei servizi digitali e canali di assistenza.]",
            "[PLACEHOLDER: se fornito solo come strumento interno della scuola, descrivere condizioni di accesso e sospensione in base al rapporto con la scuola.]",
          ],
        },
        {
          title: "Disponibilita e modifiche",
          body: [
            "Il servizio puo essere aggiornato, sospeso o modificato per manutenzione, sicurezza o correzioni funzionali.",
            "Le funzioni offline della PWA sono limitate e non garantiscono disponibilita completa dei dati senza connessione.",
            "[PLACEHOLDER: definire SLA se esistono, canale per segnalare problemi, tempi di preavviso per modifiche sostanziali e procedura di dismissione del servizio.]",
          ],
        },
        {
          title: "Uso corretto",
          body: [
            "Non usare l'app per caricare contenuti illeciti, offensivi, dati di terzi non autorizzati o informazioni non pertinenti alla pratica.",
            "Non tentare di aggirare autorizzazioni, ruoli, limiti tecnici o meccanismi di sicurezza.",
            "[PLACEHOLDER: indicare conseguenze operative in caso di uso improprio: sospensione, revoca accesso, segnalazione alla scuola.]",
          ],
        },
      ]}
    />
  );
}
