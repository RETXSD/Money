import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const allowedSpacing = new Set(['0', '1', '2', '3', '4', '6', '8', '12', '16']);
const allowedSpacingPixels = new Set(['0', '4', '8', '12', '16', '20', '24', '32', '48', '64']);
const spacingUtilities = /(?<![\w-])-?(?:p[trblxyse]?|m[trblxyse]?|gap(?:-[xy])?|space-[xy])-([^\s"'`.:$]+)/g;
const cssSpacingDeclaration = /\b(?:padding(?:-[\w-]+)?|margin(?:-[\w-]+)?|gap(?:-[xy])?)\s*:\s*([^;]+);/g;
const radiusUtilities = /(?<![\w-])rounded(?:-[a-z0-9]+)*/g;
const classNameValue = /\bclassName\s*(?:=|:)\s*(?:\{`([^`]*)`\}|["'`]([^"'`]*)["'`])/g;
const hexColor = /#[\da-f]{3,8}\b/gi;
const inlineStyleStart = /\bstyle\s*=\s*\{\{/g;
const emptyClassName = /\bclassName=(['"])\s*\1/g;
const forbiddenInlineStyle =
  /\b(?:margin(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|right|bottom|left)|(?:Top|Right|Bottom|Left|Inline(?:Start|End)?|Block(?:Start|End)?))?|padding(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|right|bottom|left)|(?:Top|Right|Bottom|Left|Inline(?:Start|End)?|Block(?:Start|End)?))?|color|background(?:-[\w-]+|[A-Z][\w]*)?|border(?:-color|Color)|outline(?:-color|Color)|fill|stroke)\s*:/i;
const errors = [];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );
  return nested.flat();
}

function report(file, content, index, message) {
  const line = content.slice(0, index).split('\n').length;
  errors.push(`${relative(process.cwd(), file)}:${line} ${message}`);
}

function checkSpacingUtilities(file, content) {
  for (const match of content.matchAll(spacingUtilities)) {
    const value = match[1];
    if (!allowedSpacing.has(value)) {
      report(file, content, match.index, `spacing utility uses unsupported value "${value}"`);
    }
  }
}

function checkCssSpacing(file, content) {
  for (const declaration of content.matchAll(cssSpacingDeclaration)) {
    const value = declaration[1];
    for (const match of value.matchAll(/(-?\d+(?:\.\d+)?)px\b/g)) {
      const spacing = match[1].replace(/^-/, '');
      const isCenteredContentWidth = spacing === '1200' && /100vw\s*-\s*1200px/.test(value);
      if (isCenteredContentWidth) continue;
      if (!allowedSpacingPixels.has(spacing)) {
        report(file, content, declaration.index, `CSS spacing uses unsupported ${spacing}px value`);
      }
    }
  }
}

function checkRadiusUtilities(file, content) {
  const allowedRadii = new Set(['rounded-full', 'rounded-sketch-a', 'rounded-sketch-b', 'rounded-sketch-c']);
  for (const classMatch of content.matchAll(classNameValue)) {
    const value = classMatch[1] || classMatch[2] || '';
    for (const match of value.matchAll(radiusUtilities)) {
      if (!allowedRadii.has(match[0])) {
        report(file, content, classMatch.index, `radius utility "${match[0]}" is outside the design scale`);
      }
    }
  }
}

function checkInlineStyles(file, content) {
  for (const match of content.matchAll(inlineStyleStart)) {
    const openIndex = match.index + match[0].length - 2;
    let depth = 2;
    let index = openIndex + 2;
    for (; index < content.length && depth > 0; index += 1) {
      if (content[index] === '{') depth += 1;
      else if (content[index] === '}') depth -= 1;
    }
    if (depth !== 0) continue;
    const styleBody = content.slice(openIndex + 2, index - 2);
    if (forbiddenInlineStyle.test(styleBody)) {
      report(file, content, match.index, 'inline styles cannot set spacing or color');
    }
  }
}

function checkEmptyClassNames(file, content) {
  for (const match of content.matchAll(emptyClassName)) {
    report(file, content, match.index, 'remove empty className attributes');
  }
}

for (const file of await listFiles(sourceRoot)) {
  const extension = extname(file);
  if (!['.js', '.jsx', '.css'].includes(extension)) continue;
  const content = await readFile(file, 'utf8');
  checkSpacingUtilities(file, content);
  if (extension === '.css') checkCssSpacing(file, content);
  checkRadiusUtilities(file, content);
  checkInlineStyles(file, content);
  checkEmptyClassNames(file, content);
  const normalizedPath = file.replaceAll('\\', '/');
  if (!normalizedPath.endsWith('/src/styles/theme.css')) {
    for (const match of content.matchAll(hexColor)) {
      report(file, content, match.index, 'hex colors belong in src/styles/theme.css');
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`UI token check failed:\n${errors.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('UI token check passed.\n');
}
