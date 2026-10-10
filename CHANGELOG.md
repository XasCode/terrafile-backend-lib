# Changelog

## [0.2.1](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.0...terrafile-backend-lib-v0.2.1) (2026-10-10)


### Bug Fixes

* correct package repository metadata ([1f84020](https://github.com/XasCode/terrafile-backend-lib/commit/1f840209fa980167858b3dcecfdbcf9d4fbfd152))
* correct package repository metadata ([15b8255](https://github.com/XasCode/terrafile-backend-lib/commit/15b82553f2c697e4408528efc8a1eead32b6b5f3))

## [0.2.0](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.1.11...terrafile-backend-lib-v0.2.0) (2026-10-10)


### ⚠ BREAKING CHANGES

* **module-sources:** validate malformed module inputs

### Bug Fixes

* **ci:** repair Snyk policy and report handling ([101c7bd](https://github.com/XasCode/terrafile-backend-lib/commit/101c7bd14fbd31489555ddc3ef057baca3e07919))
* **module-sources:** validate malformed module inputs ([02cec48](https://github.com/XasCode/terrafile-backend-lib/commit/02cec48b3cedf9a70c294c08056a27223fed86dd))
* reject unavailable Terrafile contents ([eb01579](https://github.com/XasCode/terrafile-backend-lib/commit/eb01579a17a82790cf71da33a551800df51ad4da))

## Changelog

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
