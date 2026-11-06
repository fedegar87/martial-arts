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
            "Il servizio utilizza cookie propri strettamente necessari per l'autenticazione e la sicurezza dell'account. Per questi strumenti non occorre il consenso preventivo, ai sensi dell'art. 122 del d.lgs. 196/2003; resta dovuta l'informativa sul loro utilizzo.",
            "Supabase Auth salva sul dominio dell'app il cookie con nome sb- seguito dal riferimento del progetto e da -auth-token; quando necessario lo suddivide in più cookie con suffissi numerici, ad esempio .0 e .1. Il cookie conserva i dati della sessione per riconoscere l'utente nelle richieste successive. L'SDK installato imposta una durata massima di 400 giorni, rinnovata alla riscrittura: questa durata non coincide con la validità del singolo token né garantisce che la sessione resti utilizzabile per tutto il periodo. Il logout elimina la sessione dal browser.",
            "Nei flussi di autenticazione che lo richiedono può essere usato anche il cookie con suffisso -auth-token-code-verifier, per la verifica PKCE del collegamento di accesso: viene rimosso quando la verifica è completata; l'impostazione massima dell'SDK, se il flusso non viene completato, è di 400 giorni.",
            "Il cookie auth_password_update, impostato dall'app nei flussi di invito o recupero password, limita la navigazione alla procedura di impostazione password. È tecnico, HttpOnly, con durata massima di 15 minuti ed è eliminato al completamento della procedura.",
          ],
        },
        {
          title: "Cookie non tecnici",
          body: [
            "Il codice dell'app non integra strumenti propri di pubblicità, profilazione commerciale o analytics. I video YouTube sono servizi esterni e richiedono una valutazione distinta, descritta sotto; non vengono classificati indistintamente come cookie tecnici dell'app.",
            "Eventuali strumenti non strettamente necessari devono restare disattivati fino a un consenso libero, specifico, informato e revocabile, con possibilità di rifiuto equivalente all'accettazione. La semplice consultazione di questa pagina o la prosecuzione della navigazione non costituiscono consenso.",
          ],
        },
        {
          title: "PWA e cache",
          body: [
            "La PWA salva nel dispositivo risorse statiche dell'app e la pagina offline mediante la cache denominata fesk-practice-v6. Il service worker elimina le precedenti versioni della cache quando ne viene attivata una nuova. I dati possono restare nel dispositivo fino a tale aggiornamento o alla cancellazione effettuata dall'utente o dal browser.",
            "Il service worker non archivia le pagine private autenticate per la consultazione offline. Le risorse statiche non costituiscono una copia del diario personale.",
            "Al logout l'app tenta di eliminare cache, localStorage e sessionStorage del proprio dominio. La pulizia locale può essere impedita dalle impostazioni del dispositivo; è sempre possibile cancellare i dati del sito dal browser. Queste operazioni non eliminano l'account né i dati conservati sul server.",
          ],
        },
        {
          title: "Notifiche push",
          body: [
            "I promemoria sono facoltativi e disattivati per impostazione iniziale. L'attivazione richiede una scelta nell'app e il permesso del browser o del sistema operativo.",
            "Se attivati, il browser crea una sottoscrizione push; il server conserva endpoint, chiavi tecniche, informazioni sul browser e preferenze necessarie all'invio. Il servizio push dipende dal browser e dal sistema operativo utilizzati. Questi dati non sono cookie di profilazione dell'app.",
            "È possibile disattivare i promemoria dal profilo e revocare il permesso dalle impostazioni del browser o del sistema operativo. La disattivazione nell'app revoca l'uso delle sottoscrizioni interessate, ma i record non vengono eliminati automaticamente dal database. La cancellazione dei dati sul server segue l'informativa privacy.",
          ],
        },
        {
          title: "Video YouTube",
          body: [
            "Il player incorporato di YouTube viene caricato sul dominio youtube-nocookie.com soltanto dopo l'azione sul pulsante di riproduzione; prima di tale azione il componente non carica il player esterno né anteprime da YouTube.",
            "L'avvio del video comporta richieste verso Google/YouTube, che può ricevere indirizzo IP, dati del browser e informazioni sull'interazione. La modalità di privacy avanzata limita alcuni utilizzi di personalizzazione, ma non garantisce assenza di cookie, memorizzazione locale o trasferimenti fuori dallo Spazio economico europeo.",
            "Le informazioni del fornitore sono disponibili su https://policies.google.com/privacy?hl=it e https://support.google.com/youtube/answer/171780?hl=it; i termini di utilizzo sono su https://www.youtube.com/t/terms.",
            "Da verificare prima dell'apertura a utenti esterni: strumenti effettivamente attivati dal player, finalità, durata, destinatari e trasferimenti. Il pulsante attuale avvia la riproduzione senza una richiesta distinta di consenso agli eventuali strumenti non necessari: il solo clic non va presentato come prova di tale consenso. Se richiesto, il blocco preventivo e la raccolta del consenso devono essere adeguati prima dell'utilizzo del player da parte di utenti esterni.",
          ],
        },
        {
          title: "Gestione e revoca",
          body: [
            "Le impostazioni del browser consentono di visualizzare, bloccare o cancellare cookie e dati del sito. Il blocco dei cookie di autenticazione può impedire l'accesso alle funzioni riservate; la loro cancellazione richiede un nuovo accesso.",
            "Per interrompere le comunicazioni del player esterno, chiudere la pagina del video. Ciò non annulla i trattamenti già effettuati da Google/YouTube e non equivale alla cancellazione dei dati eventualmente memorizzati: per questi ultimi usare le impostazioni del browser e gli strumenti del fornitore.",
            "L'informativa privacy dell'app descrive titolare, contatti e diritti degli interessati. Da confermare prima della pubblicazione definitiva: inventario riscontrato in produzione, inclusi eventuali strumenti impostati dall'infrastruttura, e modalità di gestione dei consensi non tecnici ove necessari.",
          ],
        },
        {
          title: "Riepilogo tecnico",
          body: [
            "Autenticazione: cookie propri gestiti con Supabase Auth, tecnici, con durata massima dell'SDK di 400 giorni; cookie auth_password_update, tecnico, fino a 15 minuti.",
            "Cache PWA: risorse statiche e pagina offline conservate sul dispositivo fino ad aggiornamento o eliminazione; pulizia al logout eseguita quando consentita dal browser.",
            "Notifiche: sottoscrizione push facoltativa, disattivabile dal profilo o tramite il permesso del browser; la revoca non cancella automaticamente i record sul server.",
            "Video: player YouTube esterno caricato all'avvio, con trattamenti e strumenti del fornitore da verificare separatamente prima dell'apertura a utenti esterni.",
          ],
        },
      ]}
    />
  );
}
