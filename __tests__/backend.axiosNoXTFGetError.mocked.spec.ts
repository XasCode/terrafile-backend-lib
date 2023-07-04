import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { readFileContents } from '../src/backend/processFile';

import fsh from '@jestaubach/fs-helpers';
const { rimrafDir, getAbsolutePath } = fsh.use(fsh.default);
const mockedFsHelpers = fsh.use(fsh.mock);

import { CliOptions, ExecResult } from '../src/backend';

import fetcher from '@jestaubach/fetcher-axios';
import cloner from '@jestaubach/cloner-git';

const testDirs = [`vendor_tfregistry_NoXTFGetError`];

const cleanUpTestDirs = () => {
  return testDirs.forEach((testDir) => {
    return rimrafDir(getAbsolutePath(testDir).value);
  });
};

// expected result when error encountered
async function expectFileIssue(options: CliOptions): Promise<void> {
  const retVals = await readFileContents(options);
  expect(retVals.success).toBe(false);
  expect(retVals.contents).toBe(null);
}

describe(`read file contents should read specified json file and validate its contents`, () => {
  beforeEach(() => {
    cleanUpTestDirs();
    //vi.resetAllMocks();
  });

  afterEach(() => {
    cleanUpTestDirs();
  });

  it(`should err on terraform registry 500`, async () => {
    const configFile = `__tests__/testFiles/tfRegistryNoXTFGetError.json`;
    await expectFileIssue({
      directory: `vendor_tfregistry_NoXTFGetError/modules`,
      file: configFile,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mock(mockedFsHelpers) as (_: string[], __?: string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
    });
  });
});
