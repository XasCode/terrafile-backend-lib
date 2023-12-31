import Git from '../../src/backend/moduleSources/common/git';
import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

const { replacePathIfPathParam } = Git().testable;

it.each([
  {
    source: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me`,
    path: `/examples/simple-vpc`,
    rewritten: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/replace-me?ref=v2.78.0`,
    path: `/examples/simple-vpc`,
    rewritten: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0`,
    path: `/examples/simple-vpc`,
    rewritten: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0`,
  },
])(``, ({ source, path, rewritten }) => {
  expect(replacePathIfPathParam(source, path)).toBe(rewritten);
});

export {};
