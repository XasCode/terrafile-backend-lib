import Git from './common/git';
import Validate from './common/validate';

const acceptable = [`comment`, `source`, `version`, `path`];
const matchStart = `git@`;
const sourceType = `gitSSH`;

const git = Git(matchStart, sourceType);
const validate = Validate(acceptable);

export default { ...git, validate };
