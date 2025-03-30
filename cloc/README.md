# CLOC GitHub Action

A GitHub Action that runs CLOC (Count Lines of Code) with a default configuration and customizable overrides. This action helps you analyze and count lines of code in your repository.

## Features

- Automatically excludes common build and dependency directories (node_modules, build, dist)
- Configurable working directory
- Customizable CLOC arguments
- Returns exit code for workflow control

## Usage

Create a workflow file (e.g., `.github/workflows/cloc.yml`) in your repository:

```yaml
name: CLOC

on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  cloc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Count Lines of Code
        uses: GetAutomaApp/opensource-actions/cloc@main
```

## Inputs

### `working-directory`

Optional. Directory to run CLOC in. Defaults to repository root ('.').

### `extra_args`

Optional. Additional arguments to pass to CLOC. This allows you to override or extend the default configuration. For example:

```yaml
- name: Count Lines of Code
  uses: GetAutomaApp/opensource-actions/cloc@main
  with:
    working-directory: 'src'
    extra_args: "--exclude-ext=json,md --by-file"
```

## Outputs

### `exit-code`

The exit code from the CLOC run. A non-zero exit code indicates that CLOC encountered an error during execution.

## Default Configuration

By default, this action excludes the following directories:
- node_modules
- build
- dist

You can override or extend these exclusions using the `extra_args` input.
