# SwiftLint GitHub Action

A GitHub Action that runs SwiftLint to enforce Swift style and conventions in your Swift projects.

## Features

- Uses repository's `.swiftlint.yml` if present
- Provides default SwiftLint rules if no configuration is found
- Outputs results in GitHub Actions format
- Configurable working directory

## Usage

Create a workflow file (e.g., `.github/workflows/swiftlint.yml`) in your repository:

```yaml
name: SwiftLint

on:
  pull_request:
    paths:
      - '**.swift'

jobs:
  swiftlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run SwiftLint
        uses: GetAutomaApp/opensource-actions/swiftlint@main
```

## Inputs

### `working-directory`

Optional. Directory to run SwiftLint in. Defaults to repository root ('.').

### `extra_args`

Optional. Additional arguments to pass to SwiftLint. This allows you to override or extend the default configuration. For example:

```yaml
- name: Run SwiftLint
  uses: GetAutomaApp/opensource-actions/swiftlint@main
  with:
    extra_args: "... extra args here ..."
```

Common use cases for `extra_args`:
- Adding more config files "--config some-config-2.yml"
- Enabling / Disabling specific features

## Outputs

### `exit-code`

The exit code from the SwiftLint run. 0 indicates success, non-zero indicates issues were found.

## Configuration

This action uses its own `.swiftlint.yml` file with default rules. You can override or extend these rules using the `extra_args` input parameter as shown above.

## License

MIT
