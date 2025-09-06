# Tiny Command Line Arguments Parser

Here's what you need to know to contribute.

## Expectations for features and bug fixes

Fork the project.

This is a quick and dirty little project that does what I need; I'm only going to put *minimal* effort into changes to fix my issues and am unlikely to put much effort into fixing your problems. If you want fixes your best bet is to fork the project and fix it there.

If you really think a fix is needed here, prepare a pull request describing the defect and the required fix.

## Build\Test\Maintenance commands

- `npm run install`
  Installs tools and dependencies and generally sets up the repo for development.

- `npm run build`
  Builds the project. The output of the build lives in `./dist`

- `npm run watch`
  Watches for changes in sources and rebuilds the project. The output of the build lives in `./dist`

- `npm run check`
  Checks the project for linting and formating errors. (is automatically run by `git push`)

- `npm run fix`
  Fixes the linting and formating errors in the project that it can (is automatically run by `git commit`).

- `npm run test`
  Runs unit tests for the project

- `npm run watch-test`
  Watches for changes in tests and retests the project

- `npm run ci`
  Does as many CI checks as possible locally.

My general workflow is to

1. run `npm run watch` while developing.
2. run `npm run watch-test` when updating tests.
3. Fix lint and format errors raised by `git commit` or `git push`
