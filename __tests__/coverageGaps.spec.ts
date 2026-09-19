import { describe, expect, it, vi } from 'vitest';

vi.mock('@jestaubach/cloner-git', () => ({
  default: {
    use: vi.fn(() => async () => ({ error: new Error(`mock clone failure`) })),
  },
}));
vi.mock('@jestaubach/fetcher-axios', () => ({
  default: {
    use: vi.fn(() => async () => ({ success: false, error: `mock fetch failure` })),
  },
}));

import { readFileContents } from '../src/backend/processFile';
import { install } from '../src/backend';
import { getType } from '../src/backend/moduleSources';
import { cloneRepoToDest } from '../src/backend/moduleSources/common/cloneRepo';
import local from '../src/backend/moduleSources/local';
import terraformRegistry from '../src/backend/moduleSources/terraformRegistry';
import fsHelpers from '@jestaubach/fs-helpers';
import { ExecResult, FsHelpers } from '../src/backend';
import * as spy from '../src/spy';

const mockedFsHelpers = fsHelpers.use(fsHelpers.mock);
const repoUrl = `https://github.com/example/repository.git//module?ref=main`;

function useFsHelpers(overrides: Partial<FsHelpers> = {}): FsHelpers {
  return {
    ...mockedFsHelpers,
    getAbsolutePath: (value: string) => ({ success: true, value }),
    renameDir: () => ({ success: true }),
    copyDirAbs: () => ({ success: true }),
    rimrafDir: () => ({ success: true }),
    ...overrides,
  } as FsHelpers;
}

const successfulCloner = async (): Promise<ExecResult> => ({});

describe(`coverage gaps`, () => {
  it(`reports a failed clone`, async () => {
    const cloner = async (): Promise<ExecResult> => ({ error: new Error(`clone failed`) });

    const result = await cloneRepoToDest(repoUrl, `destination`, cloner, useFsHelpers());

    expect(result.success).toBe(false);
  });

  it(`uses the mocked default cloner when none is provided`, async () => {
    const result = await cloneRepoToDest(
      repoUrl,
      `destination`,
      undefined as unknown as (_: string[], __?: string) => Promise<ExecResult>,
      useFsHelpers(),
    );

    expect(result.success).toBe(false);
  });

  it(`reports a failed rename`, async () => {
    const fs = useFsHelpers({ renameDir: () => ({ success: false }) });

    const result = await cloneRepoToDest(repoUrl, `destination`, successfulCloner, fs);

    expect(result.success).toBe(false);
  });

  it(`handles a rename exception`, async () => {
    const fs = useFsHelpers({
      renameDir: () => {
        throw new Error(`rename failed`);
      },
    });

    await expect(cloneRepoToDest(repoUrl, `destination`, successfulCloner, fs)).rejects.toThrow(`success`);
  });

  it(`reports a failed copy`, async () => {
    const fs = useFsHelpers({ copyDirAbs: () => ({ success: false }) });

    const result = await cloneRepoToDest(repoUrl, `destination`, successfulCloner, fs);

    expect(result.success).toBe(false);
  });

  it(`reports a failed temporary directory removal`, async () => {
    const fs = useFsHelpers({ rimrafDir: () => ({ success: false }) });

    const result = await cloneRepoToDest(repoUrl, `destination`, successfulCloner, fs);

    expect(result.success).toBe(false);
  });

  it(`reports a successful clone without a repository subdirectory`, async () => {
    const result = await cloneRepoToDest(
      `https://github.com/example/repository.git?ref=main`,
      `destination`,
      successfulCloner,
      useFsHelpers(),
    );

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
  });

  it(`rejects an empty Terraform Registry source`, async () => {
    const result = await terraformRegistry.fetch({
      params: { source: `` },
      dest: `destination`,
      fetcher: successfulCloner,
      cloner: successfulCloner,
      fsHelpers: useFsHelpers(),
    });

    expect(result.error).toBe(`Repo URL empty string`);
  });

  it(`rejects a registry response without a repository header`, async () => {
    const fetcher = async (): Promise<{ success: boolean; value?: string }> => ({ success: true });

    const result = await terraformRegistry.fetch({
      params: { source: `namespace/name/system` },
      dest: `destination`,
      fetcher,
      cloner: successfulCloner,
      fsHelpers: useFsHelpers(),
    });

    expect(result.success).toBe(false);
  });

  it(`returns a registry fetcher error`, async () => {
    const fetcher = async (): Promise<{ success: boolean; error: string }> => ({
      success: false,
      error: `fetch failed`,
    });

    const result = await terraformRegistry.fetch({
      params: { source: `namespace/name/system` },
      dest: `destination`,
      fetcher,
      cloner: successfulCloner,
      fsHelpers: useFsHelpers(),
    });

    expect(result.error).toBe(`Repo URL not found in Terraform registry. destination`);
  });

  it(`uses the mocked default registry fetcher when none is provided`, async () => {
    const result = await terraformRegistry.fetch({
      params: { source: `namespace/name/system` },
      dest: `destination`,
      cloner: successfulCloner,
      fsHelpers: useFsHelpers(),
    });

    expect(result.error).toBe(`Repo URL not found in Terraform registry. destination`);
  });

  it(`rejects a registry response without the git prefix`, async () => {
    const fetcher = async (): Promise<{ success: boolean; value: string }> => ({
      success: true,
      value: `https://github.com/example/repository.git`,
    });

    const result = await terraformRegistry.fetch({
      params: { source: `namespace/name/system` },
      dest: `destination`,
      fetcher,
      cloner: successfulCloner,
      fsHelpers: useFsHelpers(),
    });

    expect(result.success).toBe(false);
  });

  it(`handles an unrecognized module type`, () => {
    expect(getType(undefined as unknown as string)).toBeUndefined();
  });

  it(`does not match a non-local source`, () => {
    expect(local.match(`https://github.com/example/repository.git`)).toBe(``);
  });

  it(`reports a missing local directory`, async () => {
    const fs = useFsHelpers({ checkIfDirExists: () => ({ success: true, value: false }) });
    const result = await local.fetch({
      params: { source: `./missing` },
      dest: `destination`,
      fetcher: successfulCloner,
      cloner: successfulCloner,
      fsHelpers: fs,
    });

    expect(result.success).toBe(false);
  });

  it(`handles an install failure without a saved directory`, async () => {
    vi.clearAllMocks();
    await install({
      file: `terrafile.sample.json`,
      directory: `coverage-missing-save`,
      fsHelpers: useFsHelpers(),
    }, () => ({ success: false, saved: null }));

    expect(console.error).toHaveBeenCalled();
  });

  it(`restores after an install failure with a saved directory`, async () => {
    await install({
      file: `terrafile.sample.json`,
      directory: `coverage-saved-directory`,
      fsHelpers: useFsHelpers(),
    }, () => ({ success: false, saved: `saved-directory` }));

    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it(`does not restore when processing fails without a saved directory`, async () => {
    vi.clearAllMocks();
    await install({
      file: `missing-terrafile.json`,
      directory: `coverage-processing-failure`,
      fsHelpers: useFsHelpers(),
    }, () => ({ success: true, saved: null }));

    expect(console.log).toHaveBeenCalled();
  });

  it(`logs invalid module entries`, async () => {
    await readFileContents({
      file: `__tests__/testFiles/invalid2.json`,
      fsHelpers: fsHelpers.use(fsHelpers.default),
    });

    expect(console.log).toHaveBeenCalled();
  });

  it(`throws when the mocked process exits`, () => {
    spy.setup();
    expect(() => process.exit(1)).toThrow(`exit`);
  });
});