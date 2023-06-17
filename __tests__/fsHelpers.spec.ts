import path from 'path';
import fs from 'fs-extra';
import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import fsh from '@jestaubach/fs-helpers';
const fsHelpers = fsh.use(fsh.default);

describe(`checkIfDirExists checks for the existence of a directory`, () => {
  it(`should return true if directory exists`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`.`)).value).toBe(true);
  });

  it(`should return false if directory doesn't exist`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`./SoMeThInG/uNuSuAl`)).value).toBe(false);
  });
});

describe(`getAbsolutePath returns an absolute path from relative or abs path`, () => {
  it(`should return path relative to current direct if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(`sOmEtHiNg/UnUsUaL`).value).toBe(path.resolve(`./sOmEtHiNg/UnUsUaL`));
  });

  it(`should return path if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(path.resolve(`.`, `sOmEtHiNg/UnUsUaL`)).value).toBe(
      path.resolve(`./sOmEtHiNg/UnUsUaL`),
    );
  });
});

describe(`createDir should create a directory at the provided location`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
    vi.resetAllMocks();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
  });

  it(`should create a directory if provided an absolute path`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`bar`).value).value;
    expect(fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(`bar`).value).value).toBe(true);
    expect(createdDirsStartingLocation).toBe(path.resolve(`.`, `bar`));
  });

  it(`should raise error if provided a path to a file`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`LICENSE`).value).value;
    expect(createdDirsStartingLocation).toBe(undefined);
    expect(global.spyErr).toHaveBeenLastCalledWith(`Error creating dir: ${fsHelpers.getAbsolutePath(`LICENSE`).value}`);
    expect(global.spyLog).not.toHaveBeenCalled();
  });
});

describe(`rimrafDir should delete a dir and its contents`, () => {
  beforeEach(async () => {
    await fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value);
    vi.resetAllMocks();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value);
  });

  it(`should delete a directory that exists`, () => {
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`vendor/modules`).value);
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value).value;
    expect(deletedDir).toBe(fsHelpers.getAbsolutePath(`vendor`).value);
    expect(global.spyErr).not.toHaveBeenCalled();
    expect(fsHelpers.checkIfDirExists(`vendor`).value).toBe(false);
  });

  it(`should error when attempting to delete a directory that doesn't exist`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`sOmEtHiNg`).value).value;
    expect(deletedDir).toBe(undefined);
    expect(global.spyErr).not.toHaveBeenLastCalledWith(`Error deleting dir: ${`sOmEtHiNg`}`);
    expect(fsHelpers.checkIfDirExists(`sOmEtHiNg`).value).toBe(false);
  });

  it(`should error when attempting to delete a directory that is not a dir`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`LICENSE`).value).value;
    expect(deletedDir).toBe(undefined);
    expect(global.spyErr).toHaveBeenLastCalledWith(`Error deleting dir: ${fsHelpers.getAbsolutePath(`LICENSE`).value}`);
    expect(
      fs.existsSync(fsHelpers.getAbsolutePath(`LICENSE`).value) &&
        !fs.lstatSync(fsHelpers.getAbsolutePath(`LICENSE`).value).isDirectory(),
    ).toBe(true);
  });
});

describe(`abortDirCreation should delete dirs that were created`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
    vi.resetAllMocks();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
  });

  it(`should clean up any dirs created`, () => {
    const dirToDelete = fsHelpers.createDir(fsHelpers.getAbsolutePath(`bar`).value).value;
    fsHelpers.abortDirCreation(dirToDelete);
    expect(global.spyErr).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        fsHelpers.getAbsolutePath(`bar`).value,
      )}`,
    );
  });

  it(`should do nothing if no dirs to cleanup`, () => {
    fsHelpers.abortDirCreation(null);
    expect(global.spyErr).toHaveBeenLastCalledWith(`Cleaning up due to abort, no directory to clean up.`);
  });
});

describe(`rename`, () => {
  it(`should err on invalid dirs`, () => {
    fsHelpers.renameDir(`./doesNotExist`, `./doesNotExistEither`);
    expect(global.spyErr).toHaveBeenLastCalledWith(`ENOENT`);
  });
});
