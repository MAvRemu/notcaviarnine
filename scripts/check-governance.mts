import { getGovernanceLog } from '../lib/governance/watch';
const log = await getGovernanceLog(40);
console.log(log.length, 'entries');
for (const e of log.slice(0, 15)) console.log(e.timestamp.slice(0, 10), e.actions.map((a) => `[${a.severity}] ${a.target}: ${a.text}`).join(' | '));
