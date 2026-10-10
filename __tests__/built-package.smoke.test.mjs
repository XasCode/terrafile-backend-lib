import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';

import fsHelpers from '@jestaubach/fs-helpers';
import { install as installEsm } from '@jestaubach/terrafile-backend-lib';

const require = createRequire(import.meta.url);
const { install: installUmd } = require('@jestaubach/terrafile-backend-lib');
const fs = fsHelpers.use(fsHelpers.default);

test('ESM package preserves its Node path binding', async () => {
  const esmBundle = await readFile(new URL('../dist/terrafile-backend-lib.js', import.meta.url), 'utf8');

  assert.match(esmBundle, /from ["']node:path["']/);
  assert.doesNotMatch(esmBundle, /\(void 0\)\([^)]*\.terrafile\.save/);
});

async function expectInstallSavesExistingTarget(install) {
  const root = await mkdtemp(path.join(process.cwd(), '.terrafile-built-package-'));
  const relativeRoot = path.relative(process.cwd(), root);
  const target = path.join(relativeRoot, 'modules');
  const saveLocation = path.join(root, '.terrafile.save');
  const terrafile = path.join(root, 'terrafile.json');

  try {
    await mkdir(path.join(root, 'modules'));
    await writeFile(path.join(root, 'modules', 'existing.txt'), 'existing');
    await writeFile(terrafile, '{}');

    await install({
      directory: target,
      file: terrafile,
      fsHelpers: fs,
      fetcher: async () => ({ success: true, value: "" }),
      cloner: async () => ({ success: true }),
    });

    assert.equal(await readFile(path.join(saveLocation, 'existing.txt'), 'utf8'), 'existing');
    assert.equal(fs.checkIfDirExists(target).value, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('ESM package saves an existing target directory', async () => {
  await expectInstallSavesExistingTarget(installEsm);
});

test('UMD package saves an existing target directory', async () => {
  await expectInstallSavesExistingTarget(installUmd);
});