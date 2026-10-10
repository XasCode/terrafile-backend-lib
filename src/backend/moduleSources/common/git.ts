import { Status, FetchParams } from '../../types';
import { cloneRepoToDest } from './cloneRepo';
import type { ModulesKeyType } from '../../moduleSources';
import { startsWith } from './startsWith';

type TestableTypes = {
  replacePathIfPathParam: (_source: string, _repoPath: string) => string;
  replaceUrlVersionIfVersionParam: (_source: string, _version: string) => string;
};

type GitModuleTypes = {
  fetch: (_fp: FetchParams) => Promise<Status>;
  match: (_source: string) => ModulesKeyType | ``;
  testable: TestableTypes;
  replaceUrlVersionIfVersionParam: (_source: string, _version: string) => string;
  replacePathIfPathParam: (_source: string, _repoPath: string) => string;
};

function replaceUrlVersionIfVersionParam(source: string, version?: string): string {
  return version ? [source.split(`?ref=`)[0], version].join(`?ref=`) : source;
}

function replacePathIfPathParam(source: string, repoPath?: string): string {
  const [beforeGit, afterGit] = source.split(`.git`);
  const newAfterGit = afterGit || ``;
  const [beforeQref, afterQref] = newAfterGit.split(`?ref=`);
  const newQrefPart = afterQref ? [`?ref=`, afterQref].join(``) : ``;
  const [beforePathSep, afterPathSep] = beforeQref.split(`//`);
  const newPathPart = afterPathSep ? [`//`, afterPathSep].join(``) : ``;
  const newPath = repoPath ? [`/`, repoPath].join(``) : newPathPart;
  const gitSuffix = source.includes(`.git`) ? `.git` : ``;
  return [beforeGit, gitSuffix, beforePathSep, newPath, newQrefPart].join(``);
}

function Git(matchStart?: string, sourceType?: ModulesKeyType): GitModuleTypes {
  async function fetch({ params, dest, cloner, fsHelpers }: FetchParams): Promise<Status> {
    if (params.source === undefined) {
      return { success: false, contents: null, error: `Repo URL is required` };
    }
    const newUrl = replaceUrlVersionIfVersionParam(params.source, params.version);
    const regRepoUrl = replacePathIfPathParam(newUrl, params.path);
    return cloneRepoToDest(regRepoUrl, dest, cloner, fsHelpers);
  }

  const testable = {
    replacePathIfPathParam,
    replaceUrlVersionIfVersionParam,
  };

  function match(source: string): ModulesKeyType | `` {
    return matchStart !== undefined && startsWith(source, matchStart)
      ? (sourceType ?? ``)
      : ``;
  }

  return { fetch, match, testable, replaceUrlVersionIfVersionParam, replacePathIfPathParam };
}

export default Git;
