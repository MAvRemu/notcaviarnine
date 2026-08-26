/** Run the indexer once (used for the initial backfill). Needs DATABASE_URL. */
import { runIndexer } from '../lib/indexer/run';
for (let i = 0; i < 40; i++) {
  const r = await runIndexer();
  console.log(JSON.stringify(r));
  if (!r.ok || r.caughtUp) break;
}
