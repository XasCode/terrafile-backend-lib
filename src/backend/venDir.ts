import * as path from 'node:path';
import { validOptions } from '../backend/utils';
import { CliOptions, Option, Status } from './types';

function cleanUpOldSaveLocation(dir: string, options: CliOptions): void {
  options.fsHelpers?.rimrafDir(dir);
}

function getSaveLocation(dir: string): string {
  return path.resolve(dir, `..`, `.terrafile.save`);
}

function renameExistingDir(
  installDir: string,
  options: CliOptions,
): string | null {
  let retVal: string | null = null;
  if (options.fsHelpers?.checkIfDirExists(installDir).value) {
    const saveLocation = getSaveLocation(installDir);
    cleanUpOldSaveLocation(saveLocation, options);
    options.fsHelpers.renameDir(installDir, saveLocation);
    retVal = saveLocation;
  }
  return retVal;
}

function createNewDir(
  installDir: string,
  options: CliOptions,
): string | null {
  const createdStartingAt = options.fsHelpers?.createDir(installDir).value;
  return createdStartingAt ?? null;
}

function createTargetDirectory(options: CliOptions): Status {
  const retVals: Status = { success: false, saved: null, created: null };
  const useCreateDir = options?.createDir ?? createNewDir;
  if (validOptions(options, `directory` as Option)) {
    const installDir = options.fsHelpers.getAbsolutePath(options.directory).value;
    if (installDir === undefined) {
      return retVals;
    }
    retVals.saved = renameExistingDir(installDir, options);
    retVals.created = useCreateDir(installDir, options);
    retVals.success =
      options.fsHelpers.checkIfDirExists(installDir).value === true;
  }
  return retVals;
}

export { createTargetDirectory, getSaveLocation };
