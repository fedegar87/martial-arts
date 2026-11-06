import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      description={`Informativa sul trattamento dei dati personali di ${brand.appName}, ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 (GDPR) e del d.lgs. 196/2003, come modificato.`}
      sections={[
        {
          title: "Titolare e contatti",
          body: [
            `Il servizio ${brand.appName} è gestito da Federico Garzia a titolo personale, che determina finalità e mezzi del trattamento dei dati dell'app. Il riferimento al curriculum di ${brand.federationName} non attribuisce alla federazione la gestione del servizio o il ruolo di titolare.`,
            "Bozza incompleta: deve essere indicato un canale di contatto effettivo del titolare per le comunicazioni e le richieste sui dati personali, ai sensi dell'art. 13 GDPR. Al momento il gestore non ha indicato un recapito da pubblicare; l'email della federazione non viene utilizzata come contatto privacy dell'app.",
            "Da confermare in revisione legale: eventuale obbligo di designazione del Responsabile della protezione dei dati (RPD/DPO) e, se designato, relativi contatti. Non viene indicato un DPO non verificato.",
          ],
        },
        {
          title: "Dati trattati",
          body: [
            "Dati di account: indirizzo email, nome visualizzato, identificativo utente, scuola, ruolo, abilitazioni ai contenuti, data di creazione e dati di autenticazione.",
            "Dati di pratica: gradi, discipline, esami in preparazione, piano personale, registrazioni di allenamento, ripetizioni, note, calendario e riflessioni settimanali. Sono inoltre registrate le richieste di cancellazione e le operazioni amministrative relative al percorso tecnico.",
            "Dati tecnici: identificativi di sessione, indirizzi IP e informazioni di richiesta trattati dall'infrastruttura. Se si attivano i promemoria, sono registrati endpoint e chiavi tecniche della sottoscrizione push, informazioni sul browser, orario e fuso orario scelti, preferenze e dati tecnici di invio.",
            "Le note sono facoltative. Non inserire dati relativi alla salute, certificati medici, informazioni su altre persone o altre categorie particolari di dati non necessarie alla pratica. Il servizio non prevede la raccolta di documentazione sanitaria.",
          ],
        },
        {
          title: "Finalità e basi giuridiche",
          body: [
            "Account e pratica sono utilizzati per l'accesso, il piano di allenamento, il diario, i progressi e la consultazione degli aggiornamenti didattici della scuola. La base giuridica è l'esecuzione del servizio richiesto e delle misure precontrattuali richieste dall'interessato (art. 6, par. 1, lett. b, GDPR), limitatamente ai dati necessari a tali attività.",
            "Ruolo, scuola e abilitazioni servono a consentire l'accesso ai contenuti assegnati; non sono modificabili in autonomia dall'utente. Le notifiche push facoltative si basano sul consenso (art. 6, par. 1, lett. a, GDPR), revocabile dal profilo senza perdere l'accesso alle altre funzioni e senza pregiudicare la liceità del trattamento precedente alla revoca.",
            "La sicurezza degli accessi, la prevenzione degli abusi e la diagnosi degli errori perseguono il legittimo interesse alla protezione del servizio e degli utenti (art. 6, par. 1, lett. f, GDPR), nel rispetto dei loro diritti. Gli adempimenti imposti da specifiche norme si basano sull'art. 6, par. 1, lett. c, GDPR. Da confermare in revisione legale: applicabilità delle basi indicate al rapporto effettivo con il titolare e valutazione del legittimo interesse.",
          ],
        },
        {
          title: "Conferimento, provenienza dei dati e minori",
          body: [
            "Email, dati di autenticazione e assegnazioni necessarie all'account sono indispensabili per le funzioni riservate; senza di essi il servizio non può essere erogato. Note, riflessioni e promemoria sono facoltativi: ometterli non impedisce l'accesso alle altre funzioni.",
            "I dati di pratica sono forniti dall'utente o generati durante l'utilizzo. Per inviti, scuola, ruolo, gradi e abilitazioni, i dati possono provenire dalla scuola o dagli amministratori che gestiscono il percorso tecnico. Non provengono da elenchi pubblici.",
            "La fase iniziale è prevista per soli maggiorenni invitati; non è prevista la registrazione autonoma. L'eventuale apertura ai minori richiede una preventiva verifica delle condizioni di accesso, delle basi giuridiche, delle autorizzazioni necessarie e delle informazioni rivolte a minori e titolari della responsabilità genitoriale.",
          ],
        },
        {
          title: "Fornitori, responsabili e trasferimenti",
          body: [
            "Il servizio utilizza Supabase per autenticazione e database e Vercel per l'hosting; le funzioni applicative Vercel sono configurate nella regione di Francoforte. La regione delle funzioni non garantisce che ogni trattamento dei fornitori avvenga nell'Unione europea. I promemoria utilizzano il servizio push del browser o del sistema operativo scelto dall'utente.",
            "Gli amministratori autorizzati gestiscono inviti, assegnazioni e richieste di cancellazione. Il database applica regole di accesso ai dati personali; gli operatori tecnici con privilegi infrastrutturali possono accedervi per le attività necessarie alla gestione del servizio. I dati del diario non sono pubblicati in un elenco pubblico.",
            "I video sono ospitati da YouTube: il collegamento al player sul dominio youtube-nocookie.com avviene all'avvio del video. Google/YouTube può ricevere dati tecnici e trattarli secondo la propria informativa, consultabile su https://policies.google.com/privacy?hl=it. La modalità di privacy avanzata non equivale all'assenza di trattamento di dati.",
            "Da confermare in revisione legale: regione effettiva del progetto Supabase, soggetti contrattuali e ruoli privacy dei fornitori e dei servizi push, accordi ai sensi dell'art. 28 GDPR applicabili al piano utilizzato, sub-responsabili e paesi di trattamento. Per ciascun trasferimento fuori dallo Spazio economico europeo occorre individuare la decisione di adeguatezza applicabile o le garanzie dell'art. 46 GDPR e le modalità per ottenerne copia. La presenza di un modello di accordo sul sito del fornitore non prova che sia applicabile a questa istanza.",
            "Il codice dell'app non integra strumenti di pubblicità, analytics o profilazione commerciale. I trattamenti delle piattaforme video e push sono distinti e descritti nelle rispettive informative.",
          ],
        },
        {
          title: "Conservazione",
          body: [
            "I dati applicativi restano associati all'account fino alla loro cancellazione. La richiesta dal profilo viene registrata e richiede l'intervento di un amministratore: non esiste una cancellazione automatica per inattività. La disattivazione dei promemoria revoca l'utilizzo delle sottoscrizioni interessate; al logout l'app tenta di revocare quella del dispositivo. Queste operazioni non eliminano automaticamente i relativi record sul server.",
            "Da confermare in revisione legale prima dell'apertura a utenti esterni: tempi o criteri effettivi per account e inviti non utilizzati, diario, note, riflessioni, storico amministrativo, sottoscrizioni revocate, dati di invio e richieste di cancellazione; durata dei log infrastrutturali e rotazione di eventuali backup. Non è stato adottato un termine generico di 12 mesi dopo la cancellazione: non costituisce un periodo standard previsto dal GDPR.",
            "La conservazione deve essere limitata al tempo necessario alla finalità dichiarata; eventuali dati residui per obblighi di legge o controversie richiedono una giustificazione specifica e accessi limitati. Il solo mantenimento tecnico di un account non giustifica una conservazione illimitata.",
          ],
        },
        {
          title: "Diritti dell'utente",
          body: [
            "Dal profilo è possibile scaricare un export JSON dei dati e registrare una richiesta di cancellazione dell'account. L'export disponibile nell'app non limita il diritto di richiedere accesso anche agli altri dati personali trattati.",
            "Nei casi e nei limiti previsti dagli artt. 15-22 GDPR, si possono esercitare accesso, rettifica, cancellazione, limitazione, portabilità e opposizione nei confronti del titolare. Per i trattamenti fondati sul legittimo interesse, l'opposizione può essere motivata dalla propria situazione particolare. Il consenso alle notifiche può essere revocato anche dal profilo. Da completare prima dell'apertura a utenti esterni: canale effettivo per esercitare tutti i diritti; la sola richiesta di cancellazione nel profilo non li copre integralmente.",
            "Il titolare deve rispondere senza ingiustificato ritardo e al più tardi entro un mese dal ricevimento. In caso di necessità, considerate complessità e numero delle richieste, il termine può essere prorogato di ulteriori due mesi, comunicando proroga e motivi entro il primo mese. Le richieste sono di regola gratuite, salve le eccezioni previste dal GDPR.",
            "È possibile proporre reclamo direttamente al Garante per la protezione dei dati personali, seguendo le indicazioni su https://www.garanteprivacy.it/home/diritti/come-agire-per-tutelare-i-tuoi-dati-personali, oppure rivolgersi all'autorità di controllo competente ai sensi dell'art. 77 GDPR. Resta il diritto di ricorrere all'autorità giudiziaria; non è necessario inviare il reclamo al contatto dell'app.",
          ],
        },
        {
          title: "Sicurezza",
          body: [
            "Il servizio utilizza autenticazione Supabase, regole di accesso a livello di riga sul database e controlli sulle operazioni riservate agli amministratori. L'utente deve custodire le credenziali e segnalare eventuali accessi sospetti.",
            "Il piano di pratica e i progressi sono elaborazioni di supporto didattico. Non costituiscono decisioni esclusivamente automatizzate con effetti giuridici o analogamente significativi ai sensi dell'art. 22 GDPR; assegnazioni e promozioni restano affidate agli operatori autorizzati.",
            "Da confermare in revisione legale: misure organizzative effettivamente adottate dal titolare per accessi privilegiati, gestione incidenti, eventuali backup e istruzioni alle persone autorizzate. Le protezioni tecniche presenti non sostituiscono tali adempimenti.",
          ],
        },
      ]}
    />
  );
}
