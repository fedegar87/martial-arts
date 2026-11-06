import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer pratica"
      description="Avvertenze per usare l'app come supporto all'allenamento."
      sections={[
        {
          title: "Supporto didattico",
          body: [
            `${brand.appName} aiuta a organizzare studio, ripassi e diario tecnico. Non sostituisce le lezioni, la correzione diretta o le indicazioni della scuola.`,
            "La progressione mostrata dall'app è un supporto organizzativo e non costituisce una valutazione ufficiale di idoneità tecnica o ammissione a esame. Il nome e i contenuti dell'app non attestano un incarico ufficiale della federazione al gestore.",
          ],
        },
        {
          title: "Pratica consapevole",
          body: [
            "Ogni pratica fisica comporta rischi. Allenati in uno spazio adatto, con progressione ragionevole e secondo le indicazioni del tuo insegnante.",
            "Interrompi l'attività in caso di dolore, vertigini, affaticamento anomalo o condizioni non sicure.",
            "Non praticare tecniche nuove, avanzate o con rischio di impatto senza supervisione qualificata.",
          ],
        },
        {
          title: "Salute",
          body: [
            "L'app non fornisce valutazioni mediche, diagnosi o programmi riabilitativi. Per dubbi su condizioni fisiche, infortuni o idoneità all'allenamento, rivolgiti a un professionista sanitario prima di iniziare o riprendere l'attività.",
            "Gli eventuali obblighi di certificazione medica dipendono dal tipo di attività e dalle norme applicabili: verifica con la scuola e con il medico i requisiti pertinenti. L'accesso all'app non certifica l'idoneità sportiva e non sostituisce i controlli richiesti. Non caricare certificati o informazioni sanitarie nel diario.",
          ],
        },
        {
          title: "Partner e armi",
          body: [
            "Tecniche con partner, combattimento, cadute, leve, proiezioni e armi devono essere praticate solo con supervisione adeguata e protezioni quando necessarie.",
            "La pratica con armi o attrezzi richiede ambiente controllato, distanza di sicurezza e rispetto delle regole della scuola.",
          ],
        },
        {
          title: "Minori",
          body: [
            "L'accesso al servizio è attualmente riservato ai maggiorenni invitati. Non creare né condividere un account per consentirne l'uso a un minorenne.",
          ],
        },
        {
          title: "Emergenze",
          body: [
            "In caso di incidente o malessere, interrompi subito la pratica e segui le procedure di emergenza del luogo in cui ti trovi.",
            "Per il primo soccorso e la segnalazione degli incidenti fai riferimento al personale e alle procedure della palestra o della scuola. L'app e i suoi contatti di assistenza non sono un canale di soccorso e non garantiscono risposte in tempo reale.",
          ],
        },
        {
          title: "Tutela dei diritti",
          body: [
            "Queste avvertenze non costituiscono una rinuncia al risarcimento né un esonero da responsabilità del gestore, degli istruttori o della scuola. Restano ferme le responsabilità previste dalla legge, comprese quelle per dolo, colpa grave e violazione di obblighi inderogabili.",
          ],
        },
      ]}
    />
  );
}
