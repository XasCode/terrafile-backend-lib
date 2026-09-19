# Release Process

Adapted from the "Standard" release process described in [this Cloud Four article on publishing an updated version of an npm package](https://cloudfour.com/thinks/how-to-publish-an-updated-version-of-an-npm-package/).

## Build

### Safety Checks

- git pull
- git status
- npm ci
- npm test

### Prepare the release

- npm run build

### Update the version number

- npm version [patch|minor|major]

## Publish

### Publish to npm

- npm publish --access=public

### git push

- git push -u origin --tags

## Debugging

### Make changes available for use

- npm run build
- npm link

### Use as a dependency in another project

- npm link ../terrafile-backend-lib
- (test changes)

### Uninstall linked dependency

- npm unlink ../terrafile-backend-lib
