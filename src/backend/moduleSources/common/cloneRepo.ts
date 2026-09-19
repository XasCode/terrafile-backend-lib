import path from 'path';
import chalk from '@xascode/chalk';

import { ExecFileException } from 'child_process';
import type { ExecResult, Path, RepoLocation, SourceParts, Status, FsHelpers } from '../../types';
import gitCloner from '@jestaubach/cloner-git';

const defaultGitCloner = gitCloner.use(gitCloner.default);

function failedExecResult(message: string): ExecResult {
  return {
    error: { name: ``, message, code: -1 } as ExecFileException,
    stdout: ``,
    stderr: ``,
  };
}

function determineRef(ref: string): string[] {
  const normalizedRef = ref ?? ``;
  return normalizedRef.length === 40 ? [``, normalizedRef] : [normalizedRef, ``];
}

function insertGit(source: Path): Path {
  const parts = source.split(`?ref=`);
  return parts.length < 2 || source.includes(`.git`) ? source : [parts[0], `.git`, `?ref=`, ...parts.slice(1)].join(``);
}

function sourceParts(source: Path): SourceParts {
  const tempSource = insertGit(source);
  const [beforeGit, afterGit] = tempSource.split(`.git`);
  const newSource = `${beforeGit}${source.includes(`.git`) ? `.git` : ``}`;
  const newAfterGit = afterGit || ``;
  const [beforeQref, afterQref] = newAfterGit.split(`?ref=`);
  const [, afterPathSep] = beforeQref.split(`//`);
  const newPathPart = afterPathSep ? `//${afterPathSep}` : ``;
  return [newSource, newPathPart, afterQref];
}

function getPartsFromHttp(source: Path): RepoLocation {
  const [repo, repoDir, ref] = sourceParts(source);
  const [branchOrTag, commit] = determineRef(ref);
  return [repo, repoDir, branchOrTag, commit];
}

async function cloneRepo(
  [repo, repoDir, branchOrTag]: RepoLocation,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<ExecResult> {
  const cloneCmd = [
    `clone`,
    ...(repoDir ? [`--depth`, `1`, `--filter=blob:none`, `--sparse`] : []),
    ...(branchOrTag ? [`--branch=${branchOrTag}`] : []),
    `${repo}`,
    fullDest,
  ];
  return cloner(cloneCmd);
}

async function scopeRepo(
  [, repoDir]: RepoLocation,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<ExecResult> {
  if (repoDir) {
    const sparseCmd = [`sparse-checkout`, `set`, repoDir.slice(1)];
    return cloner(sparseCmd, fullDest);
  }
  return {};
}

async function checkoutCommit(
  [, , , commit]: RepoLocation,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
): Promise<ExecResult> {
  const commitCmd = [`checkout`, commit];
  if (commit) {
    return cloner(commitCmd, fullDest);
  }
  return {};
}

const tempDirName = `__temp__`;

function renameFullDestToTempDir([, repoDir]: RepoLocation, fullDest: Path, fsHelpers: FsHelpers): ExecResult {
  if (repoDir) {
    const tempDir = `${fullDest}${tempDirName}`;
    let retVal: ReturnType<FsHelpers[`renameDir`]>;
    try {
      retVal = fsHelpers.renameDir(fullDest, tempDir);
    } catch {
      console.log(`caught error in renameDir`);
      retVal = { success: false };
    }
    if (!retVal.success) {
      const err = `failed to rename '${fullDest}' to '${tempDir}'`;
      console.log(chalk.red(`    ! Failed - ${err}`));
      return failedExecResult(err);
    }
  }
  return {};
}

function moveFromTempRepoDirToFullDest([, repoDir]: RepoLocation, fullDest: Path, fsHelpers: FsHelpers): ExecResult {
  if (repoDir) {
    const tempDir = `${fullDest}${tempDirName}`;
    const src = fsHelpers.getAbsolutePath(`${tempDir}${path.sep}${repoDir}`).value;
    const retVal = fsHelpers.copyDirAbs(src, fullDest);
    if (!retVal.success) {
      const err = `failed to copy '${src}' to '${fullDest}'`;
      console.log(chalk.red(`    ! Failed - ${err}`));
      return failedExecResult(err);
    }
  }
  return {};
}

function removeTempDir([, repoDir]: RepoLocation, fullDest: Path, fsHelpers: FsHelpers): ExecResult {
  if (repoDir) {
    const tempDir = `${fullDest}${tempDirName}`;
    const retVal = fsHelpers.rimrafDir(tempDir);
    if (!retVal.success) {
      const err = `failed to delete '${tempDir}'`;
      console.log(chalk.red(`    ! Failed - ${err}`));
      return failedExecResult(err);
    }
  }
  return {};
}

async function cloneRepoToDest(
  repoUrl: Path,
  fullDest: Path,
  cloner: (_: string[], __?: Path) => Promise<ExecResult>,
  fsHelpers: FsHelpers,
): Promise<Status> {
  const retVal: Status = {
    success: false,
    contents: null,
    error: `Error cloning repo to destination ${repoUrl} - ${fullDest}`,
  };
  const useCloner = cloner || defaultGitCloner;
  const repoSourceParts: RepoLocation = getPartsFromHttp(repoUrl);
  const successfulCloning =
    !(await cloneRepo(repoSourceParts, fullDest, useCloner)).error &&
    !(await scopeRepo(repoSourceParts, fullDest, useCloner)).error &&
    !(await checkoutCommit(repoSourceParts, fullDest, useCloner)).error;
  if (!successfulCloning) {
    console.log(chalk.yellow(`      ! Failed - cloning '${repoUrl}' to '${fullDest}'; is network available?`));
    return retVal;
  }
  const successfulMoving =
    !renameFullDestToTempDir(repoSourceParts, fullDest, fsHelpers).error &&
    !moveFromTempRepoDirToFullDest(repoSourceParts, fullDest, fsHelpers).error &&
    !removeTempDir(repoSourceParts, fullDest, fsHelpers).error;
  if (!successfulMoving) {
    const src = `${fullDest}${path.sep}${repoSourceParts[1]}`;
    console.log(
      chalk.yellow(
        `      ! Failed - moving '${src}' to '${fullDest}'; if destination already exists, remove and try again.`,
      ),
    );
    return retVal;
  }
  retVal.success = true;
  retVal.error = null;
  retVal.contents = [{ source: `${repoUrl}` } as unknown as [string, Record<string, string>]];
  return retVal;
}

export { cloneRepoToDest, getPartsFromHttp };
