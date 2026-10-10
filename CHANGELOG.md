# Changelog

All notable changes to this project are documented here.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

- Add explicit package exports for ESM imports and CommonJS `require()` without removing either entry point.
- Require Node.js 22 or newer and enable strict TypeScript checking.
- Reject missing or invalid module sources and report unresolved paths or required processing options as failures.
- Model nullable result fields explicitly in the public types.

### Added

- Add package smoke tests for the built ESM and UMD entry points.
