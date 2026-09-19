import { Entry } from '../../types';

// Very simplistic validation of terrafile entries.
// If a list of allowed params is provided, this returns a function that
// will check a terrafile entry to make sure that an entry does not have other params.
function Validate(acceptable: string[] = []): (_: Entry) => boolean {
  return (params: Entry): boolean => Object.keys(params).some((param) => !acceptable.includes(param));
}

export default Validate;
