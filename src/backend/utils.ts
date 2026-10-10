import { CliOptions, FsHelpers, Option } from './types';

type ValidOptions<K extends Option> = CliOptions & {
  fsHelpers: FsHelpers;
} & Required<Pick<CliOptions, K>>;

/** Checks that required CLI fields are present and their path can be resolved. */
function validOptions<K extends Option>(
  options: CliOptions | undefined,
  fileOrFolder: K,
): options is ValidOptions<K> {
  const pathValue =
    fileOrFolder === `file` ? options?.file : options?.directory;
  return (
    typeof options === `object` &&
    options?.fsHelpers !== undefined &&
    typeof pathValue === `string` &&
    Object.keys(options).includes(fileOrFolder) &&
    options.fsHelpers.getAbsolutePath(pathValue).value !== undefined
  );
}

export { validOptions };
