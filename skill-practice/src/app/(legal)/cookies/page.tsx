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
            "[PLACEHOLDER: dopo deploy, elencare i nomi reali dei cookie tecnici usati da Supabase/Next, durata, finalita e dominio.]",
          ],
        },
        {
          title: "Cookie non tecnici",
          body: [
            "Al momento non sono previsti cookie di profilazione, advertising o analytics non tecnici. Se saranno introdotti, l'app dovra raccogliere un consenso libero, specifico e revocabile prima dell'attivazione.",
            "[PLACEHOLDER: se vengono attivati analytics, crash reporting o marketing, aggiungere categoria, fornitori, finalita, durata e pulsante/area per modificare o revocare il consenso.]",
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
          title: "Video YouTube",
          body: [
            "I video sono caricati solo dopo l'azione dell'utente sul player e usano il dominio youtube-nocookie.com quando disponibile.",
            "L'interazione con il player puo comunque comportare comunicazioni tecniche verso servizi Google/YouTube.",
            "[PLACEHOLDER: verificare e dichiarare termini applicabili, eventuali trasferimenti extra SEE e impostazioni privacy dei video incorporati.]",
          ],
        },
        {
          title: "Gestione e revoca",
          body: [
            "L'utente puo cancellare cookie e dati del sito dalle impostazioni del browser. La cancellazione dei cookie di sessione richiede un nuovo accesso.",
            "[PLACEHOLDER: se saranno presenti consensi non tecnici, inserire un comando sempre raggiungibile per cambiare preferenze, revocare consenso e ripristinare le impostazioni di default.]",
          ],
        },
        {
          title: "Tabella operativa da completare",
          body: [
            "[PLACEHOLDER: Cookie/sessione auth - nome reale - dominio - durata - finalita - tecnico si/no.]",
            "[PLACEHOLDER: Cache PWA - chiave cache reale - durata - finalita - modalita cancellazione.]",
            "[PLACEHOLDER: YouTube embed - dati comunicati - evento di attivazione - base giuridica/consenso se richiesto.]",
          ],
        },
      ]}
    />
  );
}
