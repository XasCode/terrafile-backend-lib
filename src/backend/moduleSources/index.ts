import chalk from '@xascode/chalk';

import { Entry, Path, Status, FetchParams } from '../types';

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

function getType(source: Path): ModulesKeyType {
  return source === undefined
    ? undefined
    : (Object.values(modules)
        .map((module) => {
          return module.match(source);
        })
        .join(``) as ModulesKeyType);
}

async function fetch({ params, dest, fetcher, cloner, fsHelpers }: FetchParams): Promise<Status> {
  const moduleType: ModulesKeyType = getType(params.source);
  console.log(chalk.blue(`    - Info - type: ${moduleType}`));
  return modules[moduleType].fetch({ params, dest, fetcher, cloner, fsHelpers });
}

function validate(params: Entry): boolean {
  let notFoundOrNotValid = false;
  const sourceType = getType(params.source);
  notFoundOrNotValid = notFoundOrNotValid || modules[sourceType].validate(params);
  return notFoundOrNotValid;
}

export { getType, fetch, modules, validate };
export type { ModulesKeyType };
