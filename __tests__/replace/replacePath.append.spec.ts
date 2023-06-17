import Git from '../../src/backend/moduleSources/common/git';
import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

const { replacePathIfPathParam } = Git().testable;

it.each([
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git`,
    path: `/examples/simple-vpc`,
  },
  {
    comment: `Git monorepo module (SSH)`,
    source: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git`,
    path: `/examples/simple-vpc`,
  },
])(`should append path - %s`, ({ source, path }) => {
  expect(replacePathIfPathParam(source, path)).toBe(`${source}/${path}`);
});

export {};
