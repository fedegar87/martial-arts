import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      description="Come Kung Fu Practice tratta i dati necessari al quaderno tecnico digitale."
      sections={[
        {
          title: "Titolare e contatti",
          body: [
            "[PLACEHOLDER: inserire denominazione legale del titolare del trattamento, sede, codice fiscale o partita IVA se applicabile, email privacy e PEC.]",
            "[PLACEHOLDER: indicare se esiste un Responsabile della Protezione dei Dati e il relativo contatto. Se non nominato, indicare il referente privacy operativo.]",
            "Il titolare determina finalita e mezzi del trattamento legati all'uso di Kung Fu Practice da parte di allievi, istruttori e amministratori.",
          ],
        },
        {
          title: "Dati trattati",
          body: [
            "L'app tratta dati di account come email, nome visualizzato, scuola, ruolo, data di creazione e stato della sessione.",
            "L'app tratta dati di pratica come gradi, discipline, esami in preparazione, piano personale, log di allenamento, ripetizioni, note personali, calendario sessioni e riflessioni settimanali.",
            "L'app tratta dati tecnici necessari al funzionamento, come identificativi di sessione, log tecnici del provider, indirizzi IP e dati di sicurezza gestiti dai servizi infrastrutturali.",
            "Le note libere possono contenere informazioni decise dall'utente. Non inserire dati sanitari, dati di terzi o dati sensibili non necessari alla pratica.",
          ],
        },
        {
          title: "Finalita",
          body: [
            "I dati servono per autenticare l'utente, generare il piano di pratica, mostrare progressi, mantenere il diario tecnico e comunicare aggiornamenti della scuola.",
            "Ruolo e scuola sono usati per autorizzare funzioni riservate e non sono modificabili in autonomia dall'utente.",
            "I dati tecnici servono per sicurezza, prevenzione abusi, continuita del servizio, manutenzione e risoluzione di errori.",
          ],
        },
        {
          title: "Base giuridica e minori",
          body: [
            "[PLACEHOLDER: scegliere e documentare la base giuridica per ciascuna finalita: contratto/servizio richiesto, legittimo interesse, consenso, obbligo legale o altra base applicabile.]",
            "[PLACEHOLDER: se il servizio e offerto a minori, descrivere flusso di consenso o autorizzazione genitoriale per utenti sotto i 14 anni in Italia, e informativa con linguaggio adatto ai minori.]",
            "Se il trattamento si basa sul consenso, l'utente deve poterlo prestare in modo libero, specifico, informato e revocabile senza pregiudicare i trattamenti necessari al servizio.",
          ],
        },
        {
          title: "Fornitori, responsabili e trasferimenti",
          body: [
            "L'app usa Supabase per autenticazione e database. I video possono essere caricati da YouTube in modalita youtube-nocookie solo quando l'utente avvia la riproduzione.",
            "[PLACEHOLDER: inserire elenco aggiornato dei responsabili/sub-responsabili, regione di hosting, DPA firmati, misure di sicurezza e meccanismo di trasferimento extra SEE se applicabile.]",
            "[PLACEHOLDER: indicare se Supabase, YouTube/Google, Vercel o altri fornitori trattano dati fuori dallo Spazio Economico Europeo e con quali garanzie: decisione di adeguatezza, EU-US Data Privacy Framework, SCC o altra base.]",
            "Eventuali analytics, crash reporting, strumenti marketing o profilazione non sono attivi in questa versione e dovranno essere dichiarati prima dell'attivazione.",
          ],
        },
        {
          title: "Conservazione",
          body: [
            "[PLACEHOLDER: definire tempi di conservazione per account, log di pratica, note personali, riflessioni, richieste di cancellazione, log tecnici e backup.]",
            "In assenza di una policy piu specifica, i dati applicativi restano associati all'account finche il servizio e attivo o finche non viene completata una richiesta di cancellazione, salvo obblighi o interessi legittimi documentati.",
          ],
        },
        {
          title: "Diritti dell'utente",
          body: [
            "Dal profilo l'utente puo scaricare un export JSON dei propri dati e inviare una richiesta di cancellazione account.",
            "[PLACEHOLDER: inserire canale e tempi di risposta per richieste di accesso, rettifica, cancellazione, limitazione, portabilita, opposizione, revoca del consenso e reclamo al Garante.]",
            "La cancellazione account e gestita tramite richiesta per evitare eliminazioni accidentali e permettere al titolare di verificare obblighi residui o dati da conservare.",
          ],
        },
        {
          title: "Sicurezza",
          body: [
            "L'app usa autenticazione Supabase, row level security sul database e protezioni applicative per impedire a un utente di modificare ruolo o scuola assegnata.",
            "[PLACEHOLDER: descrivere misure organizzative del titolare: gestione accessi admin, revisione utenti, incident response, backup, formazione istruttori/amministratori.]",
          ],
        },
      ]}
    />
  );
}
