import { fetchPoolState } from '../lib/hyperstake/state';
const s = await fetchPoolState();
console.log('requireActiveSet =', s.requireActiveSet, '| nav', s.nav);
