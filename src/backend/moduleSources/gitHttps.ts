import Git from './common/git';
import Validate from './common/validate';

const acceptable = [`comment`, `source`, `version`, `path`];
const matchStart = `https://`;
const sourceType = `gitHttps`;

const git = Git(matchStart, sourceType);
const validate = Validate(acceptable);

export default { ...git, validate };
