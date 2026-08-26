import { fetchPoolState } from '../lib/hyperstake/state';
const s = await fetchPoolState();
console.log({ requireActiveSet: s.requireActiveSet, allowlistCount: s.allowlistCount, held: s.lsuPoolHeldCount, drifted: s.heldNotAllowlisted, lastUpdated: s.allowlistLastUpdatedAt, nav: s.nav });
