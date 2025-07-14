import { promises as fs } from 'fs';
import path from 'path';

const defaultFile = path.join(process.cwd(), 'prompts.json');

function resolveFile(custom?: string) {
  return custom ? path.resolve(process.cwd(), custom) : defaultFile;
}

export async function readPrompts(file?: string): Promise<any> {
  try {
    const data = await fs.readFile(resolveFile(file), 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function writePrompts(data: any, file?: string): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(resolveFile(file), json);
}
