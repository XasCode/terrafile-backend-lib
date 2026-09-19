import { ExecFileException } from 'node:child_process';

type Backend = {
  install(_: CliOptions): void;
};

type ExecResult = {
  error?: ExecFileException;
  stdout?: string;
  stderr?: string;
};

type CliArgs = {
  command?: string;
  helpCommand?: string;
  ver?: string;
  help?: string;
  badOption?: string;
  directory?: string;
  file?: string;
};

type FsHelpers = {
  getAbsolutePath: (_: string) => RetPath;
  checkIfFileExists: (_: string) => RetBool;
  checkIfDirExists: (_: string) => RetBool;
  createDir: (_: string) => RetPath;
  renameDir: (_: string, __: string) => RetVal;
  rimrafDir: (_: string) => RetVal;
  readFile: (_: string) => RetString;
  copyDirAbs: (_: string, __: string) => RetVal;
  touchFile: (_: string) => RetVal;
};

type CliOptions = {
  directory?: string;
  file?: string;
  fetcher?: (_: Config) => Promise<RetString>;
  cloner?: (_: string[], __?: string) => Promise<ExecResult>;
  fsHelpers?: FsHelpers;
  createDir?: (_: string) => string;
};

type Status = {
  success: boolean;
  saved?: string;
  created?: string;
  error?: string | null;
  contents?: [string, Record<string, string>][];
  options?: CliOptions;
  process?: () => Promise<Status>;
  validateFormat?: () => Status;
  validateOptions?: () => Status;
  verifyFile?: (_: CliOptions) => Status;
  readFile?: (_: CliOptions) => Status;
  parse?: () => Status;
  validateJson?: () => Status;
  fetcher?: (_: Config) => Promise<RetString>;
  cloner?: (_: string[], __?: string) => Promise<ExecResult>;
  fsHelpers?: FsHelpers;
};

type Option = `file` | `directory`;

type Entry = {
  source?: string;
  version?: string;
  path?: string;
};

type RepoLocation = [string, string, string, string];

type SourceParts = string[];

type RetVal = {
  success: boolean;
  error?: string;
};

interface RetString extends RetVal {
  value?: string;
}

interface RetBool extends RetVal {
  value?: boolean;
}

interface RetPath extends RetVal {
  value?: string;
}

type Config = Record<string, string>;

type Request = {
  method: `get`;
  url: string;
};

type Response = {
  status: number;
  headers?: Record<string, string>;
};

type FetchParams = {
  params: Entry;
  dest: string;
  fetcher: (_: Config) => Promise<RetString>;
  cloner: (_: string[], __?: string) => Promise<ExecResult>;
  fsHelpers: FsHelpers;
};

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
};
