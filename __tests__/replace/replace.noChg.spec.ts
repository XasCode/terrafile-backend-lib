import { Entry } from '../../src/backend';
import Git from '../../src/backend/moduleSources/common/git';
import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

const { replacePathIfPathParam, replaceUrlVersionIfVersionParam } = Git().testable;

it.each([
  {
    source: `./__tests__/modules/test-module`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=v2.78.0`,
  },
  {
    source: `git@github.com:terraform-aws-modules/terraform-aws-vpc.git`,
  },
  {
    source: `git@github.com:xascode/terraform-aws-modules/terraform-aws-vpc.git?ref=v2.78.0`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc`,
  },
  {
    source: `https://github.com/terraform-aws-modules/terraform-aws-vpc.git//examples/simple-vpc?ref=master`,
  },
])(``, ({ source, path, version }: Entry): void => {
  expect(replacePathIfPathParam(source, path)).toBe(source);
  expect(replaceUrlVersionIfVersionParam(source, version)).toBe(source);
});

export {};
