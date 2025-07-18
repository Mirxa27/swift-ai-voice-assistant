import { promises as fs } from 'fs';
import path from 'path';

const defaultFile = path.join(process.cwd(), 'crisis.json');
function resolve(file?: string) {
  return file ? path.resolve(process.cwd(), file) : defaultFile;
}

export async function readReports(file?: string): Promise<string[]> {
  try {
    const data = await fs.readFile(resolve(file), 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function addReport(text: string, file?: string): Promise<void> {
  const reports = await readReports(file);
  reports.push(text);
  await fs.writeFile(resolve(file), JSON.stringify(reports, null, 2));
}

export async function clearReports(file?: string): Promise<void> {
  await fs.writeFile(resolve(file), '[]');
}
