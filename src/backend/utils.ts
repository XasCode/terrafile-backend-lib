import { CliOptions, FsHelpers, Option } from './types';

type ValidOptions<K extends Option> = CliOptions & { fsHelpers: FsHelpers } & Required<Pick<CliOptions, K>>;

function validOptions<K extends Option>(options: CliOptions | undefined, fileOrFolder: K): options is ValidOptions<K> {
  return (
    typeof options === `object` &&
    options?.fsHelpers !== undefined &&
    typeof options[fileOrFolder] === `string` &&
    Object.keys(options).includes(fileOrFolder) &&
    options.fsHelpers.getAbsolutePath(options[fileOrFolder]).value !== undefined
  );
}

export { validOptions };
