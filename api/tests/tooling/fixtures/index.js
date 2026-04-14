import * as fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const AttestationTemplateFixture = {
  getFile: async () => {
    return readFile(path.join(__dirname, 'attestation-template.pdf'));
  },
  getStream: () => {
    return fs.createReadStream(path.join(__dirname, 'attestation-template.pdf'));
  },
};
