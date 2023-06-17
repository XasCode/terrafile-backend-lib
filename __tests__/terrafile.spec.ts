/* eslint-disable no-console */
import { resolve } from 'path';
import fsh from '@jestaubach/fs-helpers';
const fsHelpers = fsh.use(fsh.default);
const { rimrafDir } = fsHelpers;
import { main } from '../src/cli/terrafile';
import { getRandomInt, cli, variations, backendVersions } from './testUtils';
import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';

import { TestDefinition } from '../src/shared/types';

const backends = Object.keys(backendVersions);

// Iterate over many different combinations of valid and invalid cli args.
//   'args' - the combination of args that is being tested.
//   'command' - the backend command to execute; derived from args.
//   'options' - the options to pass to the backend cmd; derived from args.
// Test to make sure the specified args execute the backend command as expected.
//   'error' - null, if not error; or object containing at a minimum an error 'code'.
//   'stdOut' - text expected to be written to stdOut.
//   'stdErr' - text expected to be written to stdErr.
describe.each(variations)(
  `Iterate through test variations.`,
  ({
    // backends,
    args,
    command,
    options,
    error,
    stdOut,
    stdErr,
  }: TestDefinition) => {
    //NOSONAR
    beforeEach(() => {
      rimrafDir(resolve(`.`, `vendor`));
      rimrafDir(resolve(`.`, `bar`));
      vi.resetAllMocks();
    });

    afterEach(() => {
      rimrafDir(resolve(`.`, `vendor`));
      rimrafDir(resolve(`.`, `bar`));
    });

    // run each test against multiple backends
    // i.e. pass the options to the specified command() on the backend
    // backends include:
    //   1) default ('') which is the backend that normally gets called by the frontend,
    //      however we'll test the backends separate from the frontends.
    //   2) mocked ('__mocks__/backend.mock) - this mocks the backend so that we can test
    //      the frontend without actually running the backend. We run the tests against
    //      the default and mocked with the same inputs and expect the same outputs to make
    //      sure that our mock successfully simulates the actual implementation
    it.each(backends)(`Check BE output (BE="%s", args="${args}")`, (backend) => {
      const { install } = backendVersions[backend];
      switch (command) {
        case `install`: {
          install({ ...options, fsHelpers });
          expect(global.spyLog).toHaveBeenCalledWith(stdOut);
          break;
        }
        default: {
          expect(global.spyLog).toBeCalledTimes(0);
        }
      }
    });

    // Test the frontend and the backends. Essentially this tests
    // the frontend cli interface to ensure that it processes the
    // cli arguments, executes the commands with the given options,
    // and produces the same results as the backend tests.
    it.each(backends)(`Check CLI as module (BE="%s", args="${args}")`, (backend) => {
      const myargs = [process.argv[0], resolve(`./dist/terrafile.cjs`), ...(args ? args.split(` `) : [])];
      if (backend.length > 0) {
        main(myargs, backendVersions[backend]);
      } else {
        main(myargs);
      }

      // if we successfully are running the installl command,
      if (command === `install`) {
        expect(global.spyLog).toHaveBeenCalledWith(`${stdOut}`);
        expect(global.spyStdOut).not.toHaveBeenCalled();
        expect(global.spyStdErr).not.toHaveBeenCalled();
        expect(global.spyErr).not.toHaveBeenCalled();
        expect(global.spyExit).not.toHaveBeenCalled();
      } else {
        // if the install command is not run
        [stdOut, stdErr].forEach((cur) => {
          if (cur !== ``) {
            expect(
              cur === stdOut
                ? (process.stdout.write as Mock).mock.calls[0][0]
                : (process.stderr.write as Mock).mock.calls[0][0],
            ).toEqual(`${cur}${cur.length > 0 ? `\n` : ``}`);
          }
        });
        const exitCode = (process.exit as unknown as Mock).mock.calls[0][0];
        expect(exitCode).toEqual(error.code || 0); // no error (null) --> exit(0)
        //expect(exitCode).toEqual(error === null ? 0 : error.code); // no error (null) --> exit(0)
      }
    });

    // Actually executing the CLI commands is time consuming. So we only
    // execute a small sample of the tests.
    if (getRandomInt(0) === 0) {
      it(`Sample CLI (BE="%s", args="${args}")`, async () => {
        const result = await cli(args ? args.split(` `) : []);
        [
          { actual: result.stdout, expected: stdOut },
          { actual: result.stderr, expected: stdErr },
        ].forEach((cur) => {
          // note that actually execing node appears to strip colors
          expect(cur.actual).toContain(`${cur.expected}`.replace('[34m', '').replace('[39m', ''));
        });
        //expect(result.error && result.error.code ? result.error.code : result.error).toEqual(
        //  error === null || error === undefined ? null : error.code,
        //);
        expect(result.error === null ? result.error : result.error.code).toEqual(
          error === null || error.code === undefined ? null : error.code,
        );
      });
    }
  },
);
