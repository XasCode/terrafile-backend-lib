import { startsWith } from './common/startsWith';
import { Path, RetString, Status, Config, FetchParams } from '../types';
import { cloneRepoToDest } from './common/cloneRepo';
import type { ModulesKeyType } from './';
import axiosFetcher from '@jestaubach/fetcher-axios';
import Validate from './common/validate';

const defaultAxiosFetcher = axiosFetcher.use(axiosFetcher.default);

const registryURL = `https://registry.terraform.io/v1/modules`;

function match(source: Path): ModulesKeyType | `` {
  return !startsWith(source, `/`) &&
    !startsWith(source, `./`) &&
    !startsWith(source, `../`) &&
    !startsWith(source, `git@`) &&
    !startsWith(source, `https://`)
    ? `terraformRegistry`
    : ``;
}

function stripGitPrefixFromRepoUrl(terraformRegistryGitUrl: Path): RetString {
  if (terraformRegistryGitUrl.includes(`git::`)) {
    return { success: true, value: terraformRegistryGitUrl.split(`git::`)[1] };
  }
  return { success: false, error: `Expected location '${terraformRegistryGitUrl}' to begin with 'git::'` };
}

function getRepoUrl(terraformRegistryGitUrl: Path): RetString {
  if (terraformRegistryGitUrl !== undefined) {
    return stripGitPrefixFromRepoUrl(terraformRegistryGitUrl);
  }
  return {
    success: false,
    error: `Attempt to get loc of repo from tF registry returned undefined, may be missing 'x-terraform-get' header.`,
  };
}

async function getRegRepoUrl(downloadPointerUrl: Path, fetcher: (_: Config) => Promise<RetString>): Promise<RetString> {
  const useFetcher = fetcher || defaultAxiosFetcher;
  const fetcherResult = await useFetcher({ url: downloadPointerUrl });
  if (fetcherResult.success) {
    return getRepoUrl(fetcherResult.value);
  }
  return fetcherResult;
}

function getRegDownloadPointerUrl(source: Path, version: string): Path {
  // https://www.terraform.io/docs/internals/module-registry-protocol.html
  const [namespace, name, system] = source.split(`/`);
  return `${registryURL}/${namespace}/${name}/${system}/${version}/download`;
}

async function copyFromTerraformRegistry({ params, dest, fetcher, cloner, fsHelpers }: FetchParams): Promise<Status> {
  if (params.source.length === 0) {
    return Promise.resolve({
      success: false,
      contents: null,
      error: `Repo URL empty string`,
    });
  }
  const downloadPointerUrl = getRegDownloadPointerUrl(params.source, params.version || ``);
  const regRepoUrl = await getRegRepoUrl(downloadPointerUrl, fetcher);
  if (regRepoUrl.success) {
    return cloneRepoToDest(regRepoUrl.value, dest, cloner, fsHelpers);
  }
  return {
    success: false,
    contents: null,
    error: `Repo URL not found in Terraform registry. ${dest}`,
  };
}

const acceptable = [`comment`, `source`, `version`];

const validate = Validate(acceptable);

export default { match, fetch: copyFromTerraformRegistry, validate };
