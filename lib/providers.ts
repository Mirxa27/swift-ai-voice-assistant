import { promises as fs } from 'fs';
import path from 'path';

const defaultFile = path.join(process.cwd(), 'providers.json');

function resolve(file?: string) {
  return file ? path.resolve(process.cwd(), file) : defaultFile;
}

export async function readProviders(file?: string): Promise<any> {
  try {
    const data = await fs.readFile(resolve(file), 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function writeProviders(data: any, file?: string): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(resolve(file), json);
}
