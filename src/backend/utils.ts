import { CliOptions, Option } from './types';

function validOptions(options: CliOptions, fileOrFolder: Option): boolean {
  return (
    typeof options === `object` &&
    options !== null &&
    Object.keys(options).includes(fileOrFolder) &&
    options.fsHelpers.getAbsolutePath(options[fileOrFolder]).value !== undefined
  );
}

export { validOptions };
