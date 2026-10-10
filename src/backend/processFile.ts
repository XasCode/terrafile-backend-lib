import path from 'node:path';
import chalk from '@xascode/chalk';

import { validOptions } from '../backend/utils';
import { CliOptions, Option, Status, Config, ExecResult, RetString, FsHelpers } from './types';
import { validate, fetch } from '../backend/moduleSources';

type TerrafileStatus = {
  success: boolean;
  options: CliOptions;
  contents: [string, Record<string, string>][] | null;
  error: string | null;
  json?: unknown;
  validateOptions: () => TerrafileStatus;
  verifyFile: (_options: CliOptions) => TerrafileStatus;
  readFile: (_options: CliOptions) => TerrafileStatus;
  parse: () => TerrafileStatus;
  validateJson: () => TerrafileStatus;
  process: () => Promise<TerrafileStatus>;
};

function validateOptions(this: TerrafileStatus): TerrafileStatus {
  if (!validOptions(this.options, `file` as Option)) {
    this.success = false;
    this.contents = null;
    this.error = `Error: Not valid options`;
    console.log(chalk.red(`  ! Failed - validate options`));
  } else {
    console.log(chalk.green(`  + Success - validate options`));
  }
  return this;
}

function verifyFile(this: TerrafileStatus, opts: CliOptions): TerrafileStatus {
  if (!validOptions(opts, `file`)) {
    this.success = false;
    this.contents = null;
    this.error = `Error: Not valid file options`;
    return this;
  }
  const file = opts.file;
  const absoluteFile = opts.fsHelpers.getAbsolutePath(file).value;
  const fileExists =
    absoluteFile !== undefined &&
    opts.fsHelpers.checkIfFileExists(absoluteFile).value === true;
  if (!fileExists) {
    this.success = false;
    this.contents = null;
    this.error = `Error: ${file} does not exist`;
    console.log(chalk.red(`  ! Failed - verify file: ${file}`));
  } else {
    console.log(chalk.green(`  + Success - verify file: ${file}`));
  }
  return this;
}

function readFile(this: TerrafileStatus, opts: CliOptions): TerrafileStatus {
  if (!validOptions(opts, `file`)) {
    this.success = false;
    this.contents = null;
    this.error = `Error: Not valid file options`;
    return this;
  }
  try {
    const contents = opts.fsHelpers.readFile(opts.file).value;
    if (contents === undefined) {
      throw new Error(`File contents are unavailable`);
    }
    this.json = JSON.parse(contents);
    console.log(chalk.green(`  + Success - read file: ${this.options?.file}`));
  } catch {
    this.success = false;
    this.contents = null;
    this.error = `Error: could not parse ${this.options?.file}`;
    console.log(chalk.red(`  ! Failed - read file: ${this.options?.file}`));
  }
  return this;
}

function parse(this: TerrafileStatus): TerrafileStatus {
  try {
    this.contents = Object.entries(this.json as Record<string, Record<string, string>>);
    console.log(chalk.green(`  + Success - parse json`));
  } catch {
    this.success = false;
    this.contents = null;
    this.error = `Error: could not parse json appropriately`;
    console.log(chalk.red(`  ! Failed - parse json`));
  }
  return this;
}

function validateJson(this: TerrafileStatus): TerrafileStatus {
  if (this.contents === null) {
    this.success = false;
    this.error = `Error: Not valid JSON format`;
    return this;
  }
  const valid = this.contents.reduce((acc: boolean, [key, val]: [string, Record<string, string>]) => {
    const result = !validate(val);
    if (result) {
      console.log(chalk.green(`    + Success - validate - ${key}`));
    } else {
      console.log(chalk.red(`    ! Failed - validate - ${key}`));
    }
    return acc && result;
  }, this.success);
  this.success = valid;
  if (valid) {
    this.error = null;
    console.log(chalk.green(`  + Success - validate json`));
  } else {
    this.error = `Error: Not valid JSON format\n${JSON.stringify(this.contents)}`;
    console.log(chalk.red(`  ! Failed - validate json`));
  }
  this.contents = valid ? this.contents : null;
  return this;
}

async function fetchModules(
  contents: [string, Record<string, string>][],
  dir: string,
  fetcher: (_: Config) => Promise<RetString>,
  cloner: (_: string[], __?: string) => Promise<ExecResult>,
  fsHelpers: FsHelpers,
): Promise<Status[]> {
  return Promise.all(
    contents.map(async ([key, val]) => {
      const destination = fsHelpers.getAbsolutePath(
        `${dir}${path.sep}${key}`,
      ).value;
      if (destination === undefined) {
        return {
          success: false,
          error: `Could not resolve destination for '${key}'`,
        };
      }
      console.log(chalk.blue(`    - Info - fetch: ${key}`));
      return fetch({
        params: val,
        dest: destination,
        fetcher,
        cloner,
        fsHelpers,
      });
    }),
  );
}

async function process(this: TerrafileStatus): Promise<TerrafileStatus> {
  const options = this.options;
  const retVal = { ...this };
  if (this.success) {
    const contents = this.contents;
    const { directory, fetcher, cloner, fsHelpers } = options;
    if (
      contents === null ||
      directory === undefined ||
      fetcher === undefined ||
      cloner === undefined ||
      fsHelpers === undefined
    ) {
      this.success = false;
      this.error = `Error: Required processing options are missing`;
      return this;
    }
    const fetchResults = await fetchModules(
      contents,
      directory,
      fetcher,
      cloner,
      fsHelpers,
    );
    fetchResults.forEach((currentModuleRetVal) => {
      retVal.success = this.success && currentModuleRetVal.success;
      retVal.contents = currentModuleRetVal.contents ?? null;
      retVal.error = this.error || currentModuleRetVal.error || null;
      if (retVal.contents) {
        const fetchedContent = retVal.contents[0] as unknown as { source?: string };
        console.log(chalk.blue(`      - Info - fetch source: ${fetchedContent?.source} --> dest: ${options.directory}`));
      }
    });
    if (retVal.success) {
      console.log(chalk.green(`  + Success - process: ${options.file}`));
    } else {
      console.log(chalk.red(`  ! Failed - process: ${options.file}`));
    }
  }
  return retVal;
}

function Terrafile(options: CliOptions): TerrafileStatus {
  return {
    options,
    success: true,
    contents: null,
    error: null,
    validateOptions,
    verifyFile,
    readFile,
    parse,
    validateJson,
    process,
  };
}

async function readFileContents(options: CliOptions): Promise<Status> {
  return Terrafile(options).validateOptions().verifyFile(options).readFile(options).parse().validateJson().process();
}

export { readFileContents };
