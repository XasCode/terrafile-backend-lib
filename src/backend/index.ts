import { readFileContents } from './processFile';
import { restoreDirectory } from './restore';
import type { CliOptions } from './types';

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

async function install(options: CliOptions, createDirectory = createTargetDirectory): Promise<void> {
  if (!options.directory) {
    console.error(chalk.red(`  ! Target directory is required`));
    return;
  }

  const directory = options.directory;

  console.log(chalk.blue(`Plan: (${options.file}) --> (${directory})`));
  const createResult = createDirectory(options);
  if (!createResult.success) {
    console.error(chalk.red(`  ! Failed - create target directory: ${directory}`));
    if (!createResult.saved) {
      return;
    }
    console.error(chalk.blue(`    Restoring ${directory}`));
    restoreDirectory(directory, options);
    return;
  }
  console.log(chalk.green(`  + Success - create target directory: ${directory}`));
  const retVals = await readFileContents(options);
  if (!retVals.success) {
    console.log(chalk.red(`  ! Failed - process terrafile: ${options.file}`));
    if (createResult.saved) {
      console.log(chalk.blue(`    Restoring ${directory}`));
      restoreDirectory(directory, options);
    }
    return;
  }
  console.log(chalk.green(`  + Success - process terrafile: ${options.file}`));
}

export { install };
