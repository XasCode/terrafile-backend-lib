# Changelog

## [0.2.8](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.7...terrafile-backend-lib-v0.2.8) (2026-10-13)


### Continuous Integration

* **commitlint:** allow 120 char footer ([#125](https://github.com/XasCode/terrafile-backend-lib/issues/125)) ([9126b68](https://github.com/XasCode/terrafile-backend-lib/commit/9126b68ee041e7273e4dc55fb6edb262686ec70e))

## [0.2.7](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.6...terrafile-backend-lib-v0.2.7) (2026-10-13)


### Continuous Integration

* **release-please:** auto merge ([#123](https://github.com/XasCode/terrafile-backend-lib/issues/123)) ([a05b374](https://github.com/XasCode/terrafile-backend-lib/commit/a05b37497cacca2d4f82e437e657b4838de9bd1c))

## [0.2.6](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.5...terrafile-backend-lib-v0.2.6) (2026-10-13)


### Continuous Integration

* **coderabbit:** ignore release please bot ([#119](https://github.com/XasCode/terrafile-backend-lib/issues/119)) ([3746fd8](https://github.com/XasCode/terrafile-backend-lib/commit/3746fd8129f0f078499fd9931bc50e29208b30a1))

## [0.2.5](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.4...terrafile-backend-lib-v0.2.5) (2026-10-13)


### Continuous Integration

* **coderabbit:** add coderabbit config ([#117](https://github.com/XasCode/terrafile-backend-lib/issues/117)) ([c5bd782](https://github.com/XasCode/terrafile-backend-lib/commit/c5bd7827272f9932aefb4051cafe0b3bbe5a3762))

## [0.2.4](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.3...terrafile-backend-lib-v0.2.4) (2026-10-12)


### Continuous Integration

* **release-please:** pin create-github-app-token ([#115](https://github.com/XasCode/terrafile-backend-lib/issues/115)) ([5c53feb](https://github.com/XasCode/terrafile-backend-lib/commit/5c53feb3cd7acf84b261e08f8fc54aadcc1e1ca6))

## [0.2.3](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.2...terrafile-backend-lib-v0.2.3) (2026-10-12)


### Continuous Integration

* **release-please:** add bot ([#112](https://github.com/XasCode/terrafile-backend-lib/issues/112)) ([b29711f](https://github.com/XasCode/terrafile-backend-lib/commit/b29711f2b0d0cf3429ef5d66d6684309aecf59a7))

## [0.2.2](https://github.com/XasCode/terrafile-backend-lib/compare/terrafile-backend-lib-v0.2.1...terrafile-backend-lib-v0.2.2) (2026-10-11)


### Bug Fixes

* **deps:** support current cloner and fetcher releases ([d559c4b](https://github.com/XasCode/terrafile-backend-lib/commit/d559c4b806cf36fa00e0f2a970b4f0629273d1a4))

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
