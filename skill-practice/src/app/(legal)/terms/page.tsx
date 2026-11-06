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
            `Il servizio ${brand.appName} è gestito da Federico Garzia a titolo personale, senza incarico formale di ${brand.federationName}, ed è rivolto, nella fase attuale, a utenti maggiorenni invitati in Italia. Il nome dell'app e i riferimenti al curriculum non identificano la federazione come fornitore del servizio. Da completare prima della pubblicazione definitiva: canale di contatto effettivo del gestore.`,
            `${brand.appName} è uno strumento di supporto allo studio tecnico, al diario personale e all'organizzazione dell'allenamento.`,
            "L'app non sostituisce le indicazioni dell'insegnante, della scuola o di un professionista sanitario.",
          ],
        },
        {
          title: "Account",
          body: [
            "L'account è personale e riservato ai maggiorenni. Le credenziali non devono essere condivise con altre persone.",
            "Gli amministratori autorizzati assegnano ruolo, livello e accesso ai contenuti in base al percorso dell'utente.",
            "Eventuali accessi non autorizzati o utilizzi impropri dell'account devono essere segnalati al gestore. Il canale per tali segnalazioni deve essere indicato prima dell'apertura a utenti esterni.",
            "Gli account sono creati solo su invito: non è prevista la registrazione autonoma.",
          ],
        },
        {
          title: "Contenuti",
          body: [
            "Schede, video, note didattiche e programmi sono messi a disposizione per uso personale e formativo.",
            "L'accesso non trasferisce diritti di proprietà intellettuale sui materiali. Per riproduzione, distribuzione o pubblicazione esterna occorre l'autorizzazione dei rispettivi aventi diritto, salvi gli utilizzi consentiti dalla legge.",
            `I riferimenti al curriculum del lignaggio ${brand.lineageLabel} e ai video ospitati su YouTube non attribuiscono al gestore la titolarità di tali contenuti. Da confermare in revisione legale: autorizzazioni effettive all'uso di marchi e materiali didattici da parte del gestore e condizioni applicabili ai video.`,
          ],
        },
        {
          title: "Dati inseriti dall'utente",
          body: [
            "L'utente cura la pertinenza e la correttezza delle informazioni che decide di inserire nel diario. Il trattamento dei dati personali è descritto nell'informativa privacy; la lettura dei termini non costituisce consenso generale a trattamenti facoltativi.",
            "Non inserire informazioni non necessarie, dati di altre persone, certificati medici o dati relativi alla salute.",
          ],
        },
        {
          title: "Gratuità e cessazione dell'utilizzo",
          body: [
            "Il servizio è gratuito: non prevede pagamenti, abbonamenti o rinnovi a pagamento. Eventuali quote per lezioni, tesseramento o altre attività della scuola riguardano rapporti separati.",
            "L'utente può interrompere l'utilizzo in qualsiasi momento e richiedere la cancellazione dell'account dal profilo. La richiesta viene gestita manualmente da un amministratore secondo l'informativa privacy; prima della cancellazione è possibile scaricare i propri dati.",
            "L'eventuale introduzione di servizi a pagamento richiederà condizioni e informazioni specifiche prima di qualsiasi adesione. Restano salvi i diritti inderogabili riconosciuti dalla legge italiana ed europea e, ove applicabile, dal Codice del consumo, anche in materia di servizi digitali.",
          ],
        },
        {
          title: "Disponibilità e modifiche",
          body: [
            "Il servizio può richiedere interruzioni per manutenzione, sicurezza o correzioni. La disponibilità dei video dipende anche dalla piattaforma esterna che li ospita; non è garantita la presenza permanente di ogni video.",
            "Le funzioni offline della PWA sono limitate: l'accesso ai dati personali aggiornati e ai video richiede una connessione. L'app non costituisce un servizio di emergenza.",
            "Da definire prima della pubblicazione definitiva: contatto di assistenza, modalità di comunicazione e preavviso per modifiche sostanziali o cessazione del servizio, consentendo all'utente di recuperare i dati quando possibile. Non è previsto un livello contrattuale di disponibilità, fatti salvi gli obblighi inderogabili di legge.",
          ],
        },
        {
          title: "Uso corretto",
          body: [
            "Non usare l'app per caricare contenuti illeciti, offensivi, dati di terzi non autorizzati o informazioni non pertinenti alla pratica.",
            "Non tentare di aggirare autorizzazioni, ruoli, limiti tecnici o meccanismi di sicurezza.",
            "Il gestore può limitare o sospendere l'accesso per ragioni di sicurezza o violazioni delle condizioni, con misure proporzionate. Da definire prima della pubblicazione definitiva: modalità di comunicazione dei motivi e canale per chiedere il riesame, salvo interventi urgenti o divieti di legge. La sospensione non estingue i diritti sui dati personali.",
          ],
        },
        {
          title: "Responsabilità e legge applicabile",
          body: [
            "I suggerimenti dell'app hanno funzione organizzativa e non certificano l'idoneità fisica, il livello tecnico o l'ammissione a un esame. La pratica deve rispettare le avvertenze riportate nel disclaimer e le indicazioni dell'insegnante.",
            "Nessuna disposizione esclude o limita responsabilità per dolo, colpa grave o altri casi in cui la legge non consente esclusioni o limitazioni, né pregiudica i diritti inderogabili dell'utente.",
            "Si applica la legge italiana, ferme le disposizioni inderogabili applicabili a tutela del consumatore. Quando l'utente agisce come consumatore resta competente il foro previsto dalla legge, senza imposizione di un foro esclusivo diverso.",
          ],
        },
      ]}
    />
  );
}
