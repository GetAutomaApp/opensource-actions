# SwiftTesting GitHub Action

A GitHub Action that runs SwiftTesting to ensure tests pass before merging PRs / Deploying.

## Features

- Installs docker & docker-compose if required
- Works on both macos & linux machines
- Allows you to specify if you want to `docker-compose`` or not.

## Usage

Create a workflow file (e.g., `.github/workflows/test-service.yml`) in your repository:

```yaml
name: Swift Testing

on:
  pull_request:
    paths:
      - '**.swift'

jobs:
  swiftlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run SwiftTesting
        uses: GetAutomaApp/opensource-actions/swifttesting@main
```

## Inputs

### `working-directory`

Optional. Directory to run Swift Testing in. Defaults to repository root ('.').

### `compose`

Optional. (defaults to string `true`). Whether or not to install docker & docker-compose. And to run `docker compose up -d`

### `compose-file`

Optional. If specified this will be relative to the `working-directory` path. If `compose` is true & this is not set it uses the root `working-directory/docker-compose.yml`

Eg: `../project-dependencies.compose.yml`


Common use cases for `compose-file`:
- Project level compose-file with required dependencies for sub-projects / swift packages (monorepos)

## Outputs

### `exit-code`

The exit code from the SwiftTesting run. 0 indicates success, non-zero indicates issues were found.

## License

MIT
