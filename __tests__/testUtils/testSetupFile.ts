import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { populateGlobal } from 'vitest/environments';

// setup(): spyOn/mock console messages, stderr, stdout, and process.exit
((): void => {
  const spyLog = vi.spyOn(console, `log`);
  const spyErr = vi.spyOn(console, `error`);
  const spyStdOut = vi.spyOn(process.stdout, `write`);
  const spyStdErr = vi.spyOn(process.stderr, `write`);
  const spyExit = vi.spyOn(process, `exit`).mockImplementation((): never => {
    throw new Error(`exit`);
  });
  populateGlobal(global, { spyLog, spyErr, spyStdOut, spyStdErr, spyExit });
})();
