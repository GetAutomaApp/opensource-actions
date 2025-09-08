# Release GitHub Action

A GitHub Action that makes releasing code easier by using a declarative `release-config.json` file to create a release.

## Features

- Automatically creates GitHub releases based on a configuration file.
- Determines the next semantic version (major, minor, patch) automatically.
- Generates release notes from commit history, contributors, and diff links.
- Supports uploading release assets.
- Customizable release titles and descriptions using placeholders.

## Usage

Create a workflow file (e.g., `.github/workflows/release.yml`) in your repository. This action is designed to be run after your build and test steps, and it expects the `release-config.json` and any assets to be placed in a specific directory before it runs.

```yaml
name: Create Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Your build and test steps would go here.
      # 2. Prepare the release files.
      - name: Prepare Release Files
        run: |
          mkdir -p /tmp/release-action/assets
          # Create your release-config.json
          echo '{"bump": "patch", "title": "New Release v{action-new-version}"}' > /tmp/release-action/release-config.json
          # Add any build artifacts to the assets directory
          # echo "My awesome asset" > /tmp/release-action/assets/my-asset.txt

      - name: Create Release
        uses: GetAutomaApp/opensource-actions/release@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

### `github-token`

**Required**. The GitHub token used to create the release.

### `config-path`

Optional. The path to the release configuration file.
**Default**: `/tmp/release-action/release-config.json`

### `assets-path`

Optional. The path to the directory containing assets to upload with the release.
**Default**: `/tmp/release-action/assets`

## Outputs

### `release-url`

The URL of the created GitHub release.

### `release-id`

The ID of the created GitHub release.

## Configuration

The action is controlled by a `release-config.json` file.

### Example `release-config.json`

```json
{
  "bump": "patch",
  "title": "Release v{action-new-version}",
  "description": "This release includes the latest changes from the main branch.",
  "description-adders": [
    "commits",
    "contributors",
    "diff-from-previous-release"
  ]
}
```

### Configuration Options

- `bump`: (Optional) The semantic version bump type. Can be `major`, `minor`, `patch`, or `pre-release`. It can also be determined from a placeholder value (e.g., a commit message containing `#major`). Defaults to `patch`.
- `title`: (Optional) The title of the release. Supports placeholders. Defaults to the new version tag (e.g., `v1.2.4`).
- `description`: (Optional) The main body content for the release description. Supports placeholders.
- `description-adders`: (Optional) An array of description descriptors to automatically add content to the description. See the "Description Descriptors" section below for available options.

### Placeholders

You can use the following placeholders in your `title` and `description` fields:

- `{commit-sha}`: The full SHA of the trigger commit.
- `{commit-short-sha}`: The short 7-character SHA of the trigger commit.
- `{commit-message}`: The message of the trigger commit.
- `{commit-author}`: The author of the trigger commit.
- `{action-new-version}`: The newly determined version for the release.
- `{action-tag}`: The newly created tag for the release (e.g., `v1.2.4`).

### Description Descriptors

You can automatically add content to your release description using the `description-adders` array in your `release-config.json`. These descriptors allow you to enrich your release notes with dynamic content.

The available descriptors are:

- `commits`: Appends a formatted list of commits since the last release. This includes the commit message and a short SHA for each commit under a `### Commits included` heading.
- `contributors`: Appends a list of contributors who have made commits since the last release. This will add a `### Contributors` section, mentioning each contributor by their GitHub username.
- `diff-from-previous-release`: Appends a link to the diff between the new and the previous release tags. This adds a `### Diff From Previous Release` section with a direct link to the comparison on GitHub.

## License

MIT