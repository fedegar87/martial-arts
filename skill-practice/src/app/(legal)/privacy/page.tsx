import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      description="Come FESK Practice tratta i dati necessari al quaderno tecnico digitale."
      sections={[
        {
          title: "Titolare e contatti",
          body: [
            'Titolare del trattamento (candidato): FESK - Federazione Europea Scuola Kung Fu "Fong Ttai". Contatto privacy: info@feskfongttai.it. Da confermare in revisione legale: denominazione legale completa, sede, codice fiscale o partita IVA ed eventuale PEC.',
            "Responsabile della Protezione dei Dati: non nominato per il primo rollout; il referente privacy operativo e raggiungibile a info@feskfongttai.it. Da confermare in revisione legale se sia necessaria la nomina di un DPO.",
            "FESK determina finalita e mezzi del trattamento legati all'uso di FESK Practice da parte di allievi, istruttori e amministratori.",
          ],
        },
        {
          title: "Dati trattati",
          body: [
            "L'app tratta dati di account come email, nome visualizzato, scuola, ruolo, data di creazione e stato della sessione.",
            "L'app tratta dati di pratica come gradi, discipline, esami in preparazione, piano personale, log di allenamento, ripetizioni, note personali, calendario sessioni e riflessioni settimanali.",
            "L'app tratta dati tecnici necessari al funzionamento, come identificativi di sessione, log tecnici del provider, indirizzi IP, dati di sicurezza gestiti dai servizi infrastrutturali e, se l'utente attiva i promemoria, endpoint e chiavi tecniche della subscription push del browser.",
            "Le note libere possono contenere informazioni decise dall'utente. Non inserire dati sanitari, dati di terzi o dati sensibili non necessari alla pratica.",
          ],
        },
        {
          title: "Finalita",
          body: [
            "I dati servono per autenticare l'utente, generare il piano di pratica, mostrare progressi, mantenere il diario tecnico, comunicare aggiornamenti della scuola e inviare promemoria di allenamento se attivati dall'utente.",
            "Ruolo e scuola sono usati per autorizzare funzioni riservate e non sono modificabili in autonomia dall'utente.",
            "I dati tecnici servono per sicurezza, prevenzione abusi, continuita del servizio, manutenzione e risoluzione di errori.",
          ],
        },
        {
          title: "Base giuridica e minori",
          body: [
            "Base giuridica: esecuzione del servizio richiesto (quaderno tecnico, piano e diario) per i dati di account e pratica; consenso dell'utente per i promemoria push; legittimo interesse per sicurezza e prevenzione abusi. Da confermare in revisione legale la mappatura puntuale per ciascuna finalita.",
            "Il primo rollout non include minori. Gli account sono creati solo su invito della federazione e non e prevista la registrazione autonoma. Se in futuro il servizio sara offerto a minori, sara definito prima il flusso di consenso o autorizzazione genitoriale e un'informativa adatta ai minori.",
            "Se il trattamento si basa sul consenso, l'utente deve poterlo prestare in modo libero, specifico, informato e revocabile senza pregiudicare i trattamenti necessari al servizio.",
          ],
        },
        {
          title: "Fornitori, responsabili e trasferimenti",
          body: [
            "L'app usa Supabase per autenticazione e database (regione Londra, Regno Unito) e Vercel per l'hosting applicativo (regione Francoforte, UE). I promemoria push usano il servizio notifiche del browser o del sistema operativo scelto dall'utente. I video sono caricati da YouTube in modalita youtube-nocookie solo quando l'utente avvia la riproduzione.",
            "Il Regno Unito beneficia di una decisione di adeguatezza UE; l'interazione con i video puo comportare trattamenti da parte di Google/YouTube anche fuori dallo Spazio Economico Europeo. Da confermare in revisione legale: elenco aggiornato dei responsabili/sub-responsabili, DPA firmati e meccanismo di trasferimento extra SEE (decisione di adeguatezza, EU-US Data Privacy Framework o SCC).",
            "Eventuali analytics, crash reporting, strumenti marketing o profilazione non sono attivi in questa versione e dovranno essere dichiarati prima dell'attivazione.",
          ],
        },
        {
          title: "Conservazione",
          body: [
            "Da confermare in revisione legale i tempi puntuali di conservazione per account, log di pratica, note personali, riflessioni, richieste di cancellazione, log tecnici e backup.",
            "In assenza di una policy piu specifica, i dati applicativi restano associati all'account finche il servizio e attivo o finche non viene completata una richiesta di cancellazione, salvo obblighi o interessi legittimi documentati.",
          ],
        },
        {
          title: "Diritti dell'utente",
          body: [
            "Dal profilo l'utente puo scaricare un export JSON dei propri dati e inviare una richiesta di cancellazione account.",
            "Per esercitare accesso, rettifica, cancellazione, limitazione, portabilita, opposizione e revoca del consenso, o per proporre reclamo al Garante, scrivere a info@feskfongttai.it. Da confermare in revisione legale i tempi di risposta.",
            "La cancellazione account e gestita tramite richiesta per evitare eliminazioni accidentali e permettere al titolare di verificare obblighi residui o dati da conservare.",
          ],
        },
        {
          title: "Sicurezza",
          body: [
            "L'app usa autenticazione Supabase, row level security sul database e protezioni applicative per impedire a un utente di modificare ruolo, scuola assegnata, gradi o esame in preparazione.",
            "Da confermare in revisione legale la descrizione delle misure organizzative del titolare: gestione degli accessi admin, revisione utenti, incident response, backup e formazione di istruttori e amministratori.",
          ],
        },
      ]}
    />
  );
}
