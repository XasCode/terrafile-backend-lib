import chalk from '@xascode/chalk';

import { Entry, Status, FetchParams } from '../types';

import local from './local';
import gitHttps from './gitHttps';
import gitSSH from './gitSSH';
import terraformRegistry from './terraformRegistry';

const modules = {
  local,
  gitHttps,
  gitSSH,
  terraformRegistry,
};

type ModulesKeyType = keyof typeof modules;

function getType(source: string | undefined): ModulesKeyType | undefined {
  if (source === undefined) {
    return undefined;
  }
  const match = Object.entries(modules).find(
    ([, module]) => module.match(source) !== ``,
  );
  return match?.[0] as ModulesKeyType | undefined;
}

async function fetch({ params, dest, fetcher, cloner, fsHelpers }: FetchParams): Promise<Status> {
  const moduleType = getType(params.source);
  if (moduleType === undefined) {
    return {
      success: false,
      contents: null,
      error: `Module source is missing or invalid`,
    };
  }
  console.log(chalk.blue(`    - Info - type: ${moduleType}`));
  return modules[moduleType].fetch({ params, dest, fetcher, cloner, fsHelpers });
}

function validate(params: Entry): boolean {
  const sourceType = getType(params.source);
  return sourceType === undefined || modules[sourceType].validate(params);
}

export { getType, fetch, modules, validate };
export type { ModulesKeyType };
