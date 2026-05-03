import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

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
            "Kung Fu Practice aiuta a organizzare studio, ripassi e diario tecnico. Non sostituisce le lezioni, la correzione diretta o le indicazioni della scuola.",
            "La progressione mostrata dall'app e un supporto organizzativo e non costituisce valutazione ufficiale di idoneita tecnica o ammissione a esame.",
          ],
        },
        {
          title: "Responsabilita personale",
          body: [
            "Ogni pratica fisica comporta rischi. Allenati in uno spazio adatto, con progressione ragionevole e secondo le indicazioni del tuo insegnante.",
            "Interrompi l'attivita in caso di dolore, vertigini, affaticamento anomalo o condizioni non sicure.",
            "Non praticare tecniche nuove, avanzate o con rischio di impatto senza supervisione qualificata.",
          ],
        },
        {
          title: "Salute",
          body: [
            "L'app non fornisce consigli medici, diagnosi o programmi riabilitativi. Per dubbi su condizioni fisiche, infortuni o idoneita all'allenamento, consulta un professionista sanitario.",
            "[PLACEHOLDER: se la scuola richiede certificati medici o idoneita sportiva, indicare qui la regola organizzativa e rimandare ai canali ufficiali della scuola.]",
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
            "Per utenti minorenni, la pratica deve avvenire secondo le indicazioni della scuola e con il controllo degli adulti responsabili quando necessario.",
            "[PLACEHOLDER: inserire policy della scuola su minori, autorizzazioni, supervisione e comunicazioni ai genitori/tutori.]",
          ],
        },
        {
          title: "Emergenze",
          body: [
            "In caso di incidente o malessere, interrompi subito la pratica e segui le procedure di emergenza del luogo in cui ti trovi.",
            "[PLACEHOLDER: inserire eventuali procedure della palestra/scuola per primo soccorso, contatti interni e segnalazione incidenti.]",
          ],
        },
      ]}
    />
  );
}
