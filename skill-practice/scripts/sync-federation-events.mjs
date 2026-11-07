import { syncFederationEvents } from "../src/lib/federation-event-sync.ts";

try {
  const result = await syncFederationEvents({ force: true });
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Sincronizzazione non riuscita.");
  process.exitCode = 1;
}
