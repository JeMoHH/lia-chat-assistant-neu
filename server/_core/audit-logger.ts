export type AuditEntry = {
  timestamp: string;
  actor?: string;
  action: string;
  details?: Record<string, any>;
};

import fs from 'fs/promises';
import path from 'path';

const LOG_DIR = path.resolve(process.cwd(), 'server', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export async function appendAudit(entry: AuditEntry) {
  await ensureLogDir();
  const line = JSON.stringify(entry) + '\n';
  await fs.appendFile(LOG_FILE, line, { encoding: 'utf8' });
}

export async function readRecent(n = 200) {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf8');
    const lines = data.trim().split('\n').filter(Boolean).slice(-n);
    return lines.map((l) => JSON.parse(l));
  } catch (e) {
    return [] as AuditEntry[];
  }
}

export default { appendAudit, readRecent };