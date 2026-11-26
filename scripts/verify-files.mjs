import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('RELEASE_MANIFEST.json',root),'utf8'));
for(const entry of manifest.files){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(entry.path,root))).digest('hex'),entry.sha256,entry.path);}
console.log(`${manifest.files.length} release files match SHA-256 manifest (manifest itself is not an authenticity signature).`);
