import { resolve } from 'path';
import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { createTargetDirectory } from '../src/backend/venDir';

import fsHelpers from '@jestaubach/fs-helpers';
const useFsHelpers = fsHelpers.use(fsHelpers.mock);
const { getAbsolutePath, createDir, touchFile, rimrafDirs, checkIfDirExists } = useFsHelpers;

import { CliOptions } from '../src/backend';

const testDirs = [`ok_vendor_a`, `ok_vendor_b`, `ok_vendor_c`, `err_vendor`];

/* createTargetDirectory({"directory": <path>, ...})
 * Args: Expects an object with the <path> to the "directory" that is needed
 * Returns: {success: bool, created: <abs path>|null, saved: <abs path>|null }
 *   {success: true,  created: null, saved:<path>/../.terrafile.save} if the directory already esists
 *   {success: true,  created: <absolute path to the dir closest to the root created>, saved: null} if created
 *   {success: false, created: <abs path of created>, saved: <abs path of saved>} if error
 *      + if error, created? delete created, saved: delete <path>, restore saved to <path>
 */
describe(`createTargetDirectory should create a directory for vendor modules`, () => {
  beforeEach(() => {
    rimrafDirs(testDirs);
    //vi.resetAllMocks();
  });

  afterEach(() => {
    rimrafDirs(testDirs);
  });

  // expected output when bad input provided to createTargetDirectory
  function expectDirIssue(options: CliOptions): void {
    const retVals = createTargetDirectory(options);
    expect(retVals.success).toBe(false);
    expect(retVals.created).toBe(null);
    expect(retVals.saved).toBe(null);
  }

  it(`should create the target directory when provided a relative path`, () => {
    const installDir = `ok_vendor_a/modules`;
    const retVals = createTargetDirectory({
      directory: installDir,
      fsHelpers: useFsHelpers,
    });
    expect(checkIfDirExists(getAbsolutePath(installDir).value).value).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(getAbsolutePath(`ok_vendor_a`).value);
    expect(retVals.saved).toBe(null);
  });

  it(`should create the target directory when provided an absolute path`, () => {
    const installDir = getAbsolutePath(`ok_vendor_b/modules`).value;
    const retVals = createTargetDirectory({
      directory: installDir,
      fsHelpers: useFsHelpers,
    });
    expect(checkIfDirExists(installDir).value).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(resolve(installDir, `..`));
    expect(retVals.saved).toBe(null);
  });

  it(`should create the target directory and save <path> when directory already exists`, () => {
    const installDir = `ok_vendor_c/modules`;
    const absInstallDir = getAbsolutePath(installDir).value;
    createDir(absInstallDir);
    const retVals = createTargetDirectory({
      directory: installDir,
      fsHelpers: useFsHelpers,
    });
    expect(checkIfDirExists(absInstallDir).value).toBe(true);
    expect(checkIfDirExists(resolve(absInstallDir, `..`, `.terrafile.save`)).value).toBe(true);
    expect(retVals.success).toBe(true);
    expect(retVals.created).toBe(absInstallDir);
    expect(retVals.saved).toBe(resolve(absInstallDir, `..`, `.terrafile.save`));
  });

  it(`should not create the target directory when path is to a file`, () => {
    const installDir = `err_vendor/modules`;
    createDir(getAbsolutePath(`${installDir}/..`).value);
    touchFile(getAbsolutePath(installDir).value);
    expectDirIssue({
      directory: installDir,
      fsHelpers: useFsHelpers,
    });
  });

  // try various bad inputs
  it.each([undefined, {}, { directory: `` }])(
    `should not create the target directory when provided a bad path %s`,
    (badDirOption) => {
      expectDirIssue({ ...badDirOption, fsHelpers: useFsHelpers });
    },
  );
});
