import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const projectRoot = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const sourceDirectory = join(projectRoot, 'src', 'shared', 'domain');
const copyDirectory = join(projectRoot, 'functions', 'src', 'domain');

describe('shared function domain copies', () => {
  it('matches every canonical file byte for byte', async () => {
    const sourceFiles = (await readdir(sourceDirectory))
      .filter((file) => file.endsWith('.js') && !file.endsWith('.test.js'))
      .sort();
    const copiedFiles = (await readdir(copyDirectory))
      .filter((file) => file.endsWith('.js') && !file.endsWith('.test.js'))
      .sort();

    expect(copiedFiles).toEqual(sourceFiles);
    for (const file of sourceFiles) {
      await expect(readFile(join(copyDirectory, file), 'utf8')).resolves.toBe(
        await readFile(join(sourceDirectory, file), 'utf8'),
      );
    }
  });
});
