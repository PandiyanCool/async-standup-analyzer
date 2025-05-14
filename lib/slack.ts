import { StandupData } from "./types";

export function formatStandupForSlack(data: StandupData): string {
  return `
*🔹 What I did yesterday:*
${data.yesterday.map(item => `• ${item}`).join('\n')}

*🔹 What I'm doing today:*
${data.today.map(item => `• ${item}`).join('\n')}

*🔹 Blockers:*
${data.blockers.length > 0 
  ? data.blockers.map(item => `• ${item}`).join('\n')
  : '• No blockers'}
  `.trim();
}