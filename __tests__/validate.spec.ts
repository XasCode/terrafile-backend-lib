import { describe, expect, it } from 'vitest';

import Validate from '../src/backend/moduleSources/common/validate';

describe(`Validate`, () => {
  it(`accepts entries containing only allowed keys`, () => {
    expect(Validate([`source`])({ source: `./module` })).toBe(false);
  });

  it(`rejects entries containing an unsupported key`, () => {
    expect(Validate([`source`])({ source: `./module`, version: `1.0.0` })).toBe(true);
  });

  it(`rejects every key when no allow-list is provided`, () => {
    expect(Validate()({ source: `./module` })).toBe(true);
  });
});