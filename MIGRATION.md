# Migration Guide

## Unreleased

### Node.js requirement

This package now requires Node.js 22 or newer. Upgrade the runtime used by your application and CI before updating this package.

### TypeScript result handling

Several result fields now explicitly include `null`: `Status.contents`, `Status.saved`, `Status.created`, and `ExecResult.error`. Narrow these values before use. For example:

```ts
if (status.contents !== null && status.contents !== undefined) {
  // Use the validated module entries.
}
```

Malformed or missing module sources and missing processing inputs now return failure statuses instead of reaching unsafe lookups. Callers should handle unsuccessful results before using returned contents or paths.

### Package imports

ESM consumers now resolve the ESM build through `import`; CommonJS consumers continue to resolve the existing UMD/CommonJS build through `require()`. The public API is unchanged.
