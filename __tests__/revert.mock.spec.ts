import { getPartsFromHttp } from '../src/backend/moduleSources/common/cloneRepo';
import Git from '../src/backend/moduleSources/common/git';
import { Path, ExecResult } from '../src/backend';
import { beforeAll, afterAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { install } from '../src/backend';

import fetcher from '@jestaubach/fetcher-axios';
import cloner from '@jestaubach/cloner-git';

import fsh from '@jestaubach/fs-helpers';
const mockedFsHelpers = fsh.use(fsh.mock, [`terrafile.sample.json`, `./__tests__/modules/test-module/main.tf`]);
const { readFile } = fsh.use(fsh.default);
const { getAbsolutePath, rimrafDir, checkIfFileExists } = mockedFsHelpers;

const { replacePathIfPathParam, replaceUrlVersionIfVersionParam } = Git();

describe(`test backend's ability to revert on error`, async () => {
  beforeAll(async () => {
    await rimrafDir(`revert`);
  });

  afterAll(async () => {
    await rimrafDir(`revert`);
  });

  it(`1st install successfull, then 2nd install to same loc should fail processing file and revert dir`, async () => {
    const configFile = `terrafile.sample.json`;
    const destination = `revert/revert1`;

    // 1st install
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mock(mockedFsHelpers) as (_: string[], __?: string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
    });

    // verify expected directories exist
    const testJson = JSON.parse(readFile(getAbsolutePath(configFile).value).value);
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}/main.tf`).value).value).toEqual(true);
    }

    // 2nd install, w/ error
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mockError() as (_: string[], __?: string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
    });

    // verify expected directories exist; re-use testJson
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}/main.tf`).value).value).toEqual(true);
    }
  });

  it(`should fail creating dir`, async () => {
    const configFile = `terrafile.sample.json`;
    const destination = `revert/revert2`;

    // install, err on createDir
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mockError() as (_: string[], __?: string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
      createDir: (_: Path) => {
        return null;
      },
    });

    // verify expected directories exist; re-use testJson
    const testJson = JSON.parse(readFile(getAbsolutePath(configFile).value).value);
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      const params = testJson[modName];
      const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
      const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
      const [, repoDir] = getPartsFromHttp(regRepoUrl);
      const usePath = repoDir ? repoDir.slice(1) : ``;
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}${usePath}/main.tf`).value).value).toEqual(false);
    }
  });

  it(`1st install successfull, then 2nd install to same location should fail creating dir and revert`, async () => {
    const configFile = `terrafile.sample.json`;
    const destination = `revert/revert3`;

    // 1st install
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mock(mockedFsHelpers) as (_: string[], __?: string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
    });

    // verify expected directories exist
    const testJson = JSON.parse(readFile(getAbsolutePath(configFile).value).value);
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}/main.tf`).value).value).toEqual(true);
    }

    // 2nd install, w/ error
    await install({
      file: configFile,
      directory: destination,
      fetcher: fetcher.use(fetcher.mock),
      cloner: cloner.use(cloner.mockError() as (_: string[], __?: string) => Promise<ExecResult>),
      fsHelpers: mockedFsHelpers,
      createDir: (_: Path) => {
        return null;
      },
    });

    // verify expected directories exist; re-use testJson
    expect(Object.keys(testJson).length).toBe(7);
    for (const modName of Object.keys(testJson)) {
      expect(checkIfFileExists(getAbsolutePath(`${destination}/${modName}/main.tf`).value).value).toEqual(true);
    }
  });
});
