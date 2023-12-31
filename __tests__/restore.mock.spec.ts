import fsHelpers from '@jestaubach/fs-helpers';
const useFsHelpers = fsHelpers.use(fsHelpers.mock);
const { getAbsolutePath, createDir, touchFile, rimrafDir, checkIfFileExists, checkIfDirExists } = useFsHelpers;
import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { restoreDirectory } from '../src/backend/restore';
import { getSaveLocation, createTargetDirectory } from '../src/backend/venDir';

const testDirs = [`restore`, `restore2`];

const cleanUpTestDirs = () => {
  testDirs.forEach((testDir) => {
    rimrafDir(getAbsolutePath(testDir).value);
    getSaveLocation(testDir);
  });
};

describe(`unit test restoreDirectory`, () => {
  beforeEach(() => {
    cleanUpTestDirs();
  });

  afterEach(() => {
    cleanUpTestDirs();
  });

  it(`should restore saved directory`, () => {
    const installDir = `restore/modules`;
    // create a directory at install location
    createDir(getAbsolutePath(installDir).value);
    // touch file in the install location
    touchFile(getAbsolutePath(`${installDir}/main.tf`).value);
    // create install location
    createTargetDirectory({ directory: installDir, fsHelpers: useFsHelpers });
    // expect directory at install location
    const saveLocation = getSaveLocation(installDir);
    expect(checkIfDirExists(saveLocation).value).toBe(true);
    // expect file at save location
    expect(checkIfFileExists(`${getAbsolutePath(saveLocation).value}/main.tf`).value).toBe(true);
    // expect file not to be at install location
    expect(checkIfFileExists(`${getAbsolutePath(installDir).value}/main.tf`).value).toBe(false);
    // restore install location
    restoreDirectory(installDir, { fsHelpers: useFsHelpers });
    // expect file at isntall directory
    expect(checkIfFileExists(`${getAbsolutePath(installDir).value}/main.tf`).value).toBe(true);
    // expect save location to be not found
    expect(checkIfDirExists(saveLocation).value).toBe(false);
  });

  it(`should err if attempting to restore non-saved file`, () => {
    const installDir = `restore2/modules`;
    // create install location
    createTargetDirectory({ directory: installDir, fsHelpers: useFsHelpers });
    // restore install location
    const { success } = restoreDirectory(installDir, { fsHelpers: useFsHelpers });
    // expect file at isntall directory
    expect(success).toBe(false);
  });
});
