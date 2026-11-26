import { readdir, mkdir, readFile, copyFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDirectory = join(projectRoot, 'src', 'shared', 'domain');
const targetDirectory = join(projectRoot, 'functions', 'src', 'domain');
const files = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith('.js') && !file.endsWith('.test.js'))
  .sort();

await mkdir(targetDirectory, { recursive: true });

for (const file of files) {
  const sourcePath = join(sourceDirectory, file);
  const source = await readFile(sourcePath, 'utf8');
  if (/from\s+['"](?:firebase|react)|\b(?:window|document|localStorage|navigator)\b/.test(source)) {
    throw new Error(`Shared domain file uses a browser or Firebase API: ${file}`);
  }
  await copyFile(sourcePath, join(targetDirectory, file));
}

const generatedFiles = (await readdir(targetDirectory))
  .filter((file) => file.endsWith('.js') && !file.endsWith('.test.js'))
  .sort();
for (const file of generatedFiles) {
  if (!files.includes(file)) await rm(join(targetDirectory, file));
}

process.stdout.write(`Synchronized ${files.length} shared domain files.\n`);
