import { readFileContents } from './processFile';
import { restoreDirectory } from './restore';
import {
  Backend,
  CliArgs,
  CliOptions,
  Config,
  Entry,
  ExecResult,
  FetchParams,
  FsHelpers,
  Option,
  Path,
  RepoLocation,
  Request,
  Response,
  RetBool,
  RetString,
  RetVal,
  RetPath,
  SourceParts,
  Status,
} from './types';

import { createTargetDirectory } from './venDir';
import chalk from '@xascode/chalk';

async function install(options: CliOptions): Promise<void> {
  console.log(chalk.blue(`Plan: (${options.file}) --> (${options.directory})`));
  const createResult = createTargetDirectory(options);
  if (!createResult.success) {
    console.error(chalk.red(`  ! Failed - create target directory: ${options.directory}`));
    if (createResult.saved !== null) {
      console.error(chalk.blue(`    Restoring ${options.directory}`));
      restoreDirectory(options.directory, options);
    }
    return;
  }
  console.log(chalk.green(`  + Success - create target directory: ${options.directory}`));
  const retVals = await readFileContents(options);
  if (!retVals.success) {
    console.log(chalk.red(`  ! Failed - process terrafile: ${options.file}`));
    if (createResult.saved !== null) {
      console.log(chalk.blue(`    Restoring ${options.directory}`));
      restoreDirectory(options.directory, options);
    }
    return;
  }
  console.log(chalk.green(`  + Success - process terrafile: ${options.file}`));
}

export { install };
export type {
  Backend,
  CliArgs,
  CliOptions,
  Config,
  Entry,
  ExecResult,
  FetchParams,
  FsHelpers,
  Option,
  Path,
  RepoLocation,
  Request,
  Response,
  RetBool,
  RetString,
  RetVal,
  RetPath,
  SourceParts,
  Status,
};
