import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { encode } from 'plantuml-encoder';

type HighlightFunc = (str: string, lang: string, attrs: string) => string;

const hashCode = (s: string) =>
  s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

async function download(encoded: string, dest: string): Promise<void> {
  const url = `http://www.plantuml.com/plantuml/svg/${encoded}`;
  const writer = fs.createWriteStream(
    path.resolve(__dirname, '..', 'public', dest),
  );
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  response.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function umlTitle(src: string): string {
  const match = src.match(/@startuml (.*)/);
  return match && match[1] ? match[1].trim() : 'Diagram';
}

export const wrapHighlight =
  (fallback: HighlightFunc): HighlightFunc =>
  (str, lang, attrs) => {
    // Intercept handling for 'plantuml' code blocks
    // We don't want to show the code, but the rendered result
    if (lang.trim() === 'plantuml') {
      const encoded = encode(str);
      const title = umlTitle(str);
      const urlTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fname = `uml/${urlTitle}_${hashCode(encoded)}.svg`;
      download(encoded, fname);
      return `<p><img src="/${fname}" title="${title}" alt="${title}" style="margin: auto"></img></p>`;
    }
    return fallback(str, lang, attrs);
  };
