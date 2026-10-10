import { getSaveLocation } from '../backend/venDir';
import { Status, CliOptions } from './types';

function restoreExistingDir(installDir: string, options: CliOptions): string | null {
  let retVal: string | null = null;
  const saveLocation = getSaveLocation(installDir);
  if (options.fsHelpers?.checkIfDirExists(saveLocation).value) {
    options.fsHelpers.rimrafDir(installDir);
    options.fsHelpers.renameDir(saveLocation, installDir);
    retVal = installDir;
  }
  return retVal;
}

function restoreDirectory(installDir: string, options: CliOptions): Status {
  const retVals: Status = { success: false, saved: null, created: null };
  if (options.fsHelpers === undefined) {
    return retVals;
  }
  const absInstallDir = options.fsHelpers.getAbsolutePath(installDir).value;
  if (absInstallDir === undefined) {
    return retVals;
  }
  const restored = restoreExistingDir(absInstallDir, options);
  if (restored !== null) {
    retVals.success = options.fsHelpers.checkIfDirExists(absInstallDir).value === true;
  }
  return retVals;
}

export { restoreDirectory };
