# SwiftLint GitHub Action

A GitHub Action that runs SwiftLint to enforce Swift style and conventions. This action supports both repository-specific configurations and provides sensible defaults.

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
  push:
    paths:
      - '**.swift'

jobs:
  swiftlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run SwiftLint
        uses: your-username/swiftlint-action@v1
```

## Inputs

### `working-directory`

Optional. Directory to run SwiftLint in. Defaults to repository root ('.').

## Outputs

### `exit-code`

The exit code from the SwiftLint run. 0 indicates success, non-zero indicates issues were found.

## Configuration

This action will use your repository's `.swiftlint.yml` file if present. If no configuration file is found, it will use a default set of rules that enforce common Swift style guidelines.

## License

MIT