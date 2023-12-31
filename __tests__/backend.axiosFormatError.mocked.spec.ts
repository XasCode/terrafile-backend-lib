import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { readFileContents } from '../src/backend/processFile';

import fsh from '@jestaubach/fs-helpers';
const { rimrafDir, getAbsolutePath } = fsh.use(fsh.default);
const mockedFsHelpers = fsh.use(fsh.mock);

import { CliOptions, ExecResult } from '../src/backend';

import fetcher from '@jestaubach/fetcher-axios';
import cloner from '@jestaubach/cloner-git';

const testDirs = [`vendor_tfregistry_FormatError`];

const cleanUpTestDirs = () => {
  testDirs.forEach((testDir) => {
    rimrafDir(getAbsolutePath(testDir).value);
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

  it(`should err on terraform registry with bad formatted url i.e. no git::`, async () => {
    const configFile = `__tests__/testFiles/tfRegistryFormatError.json`;
    await expectFileIssue({
      directory: `vendor_tfregistry_FormatError/modules`,
      file: configFile,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mock(mockedFsHelpers) as (_: string[], __?: string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
    });
  });
});
