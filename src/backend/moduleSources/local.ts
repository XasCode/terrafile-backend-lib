import { startsWith } from './common/startsWith';
import { Status, FetchParams } from '../types';
import type { ModulesKeyType } from './';
import Validate from './common/validate';

function match(source: string): ModulesKeyType | `` {
  return startsWith(source, `/`) || startsWith(source, `./`) || startsWith(source, `../`) ? `local` : ``;
}

function copyFromLocalDir({ params, dest, fsHelpers }: FetchParams): Status {
  const retVal = {
    success: false,
    contents: null,
    error: `Error copying from local dir`,
  } as Status;
  if (params.source === undefined) {
    retVal.error = `Local source is required`;
    return retVal;
  }
  const src = fsHelpers.getAbsolutePath(params.source).value;
  if (src === undefined) {
    retVal.error = `Could not resolve local source '${params.source}'`;
    return retVal;
  }
  const dirExists = fsHelpers.checkIfDirExists(src).value;
  if (dirExists) {
    const copyResult = fsHelpers.copyDirAbs(src, dest);
    retVal.success = copyResult.success;
    retVal.contents = [params as [string, Record<string, string>]];
    retVal.error = copyResult.error;
  }
  return retVal;
}

const acceptable = [`comment`, `source`];

const validate = Validate(acceptable);

export default { match, fetch: copyFromLocalDir, validate };
