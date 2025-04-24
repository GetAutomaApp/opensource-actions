
# XCTesting GitHub Action

A GitHub Action that runs XCTesting to ensure tests pass before merging PRs / Deploying (uses xcodebuild).

## Features

- Works on both macos to test xcode testing targets
- Allows you to specify multiple testing targets at once 

## Usage

Create a workflow file (e.g., `.github/workflows/test-app.yml`) in your repository:

```yaml
name: Test IOS App

on:
  pull_request:
    paths:
      - '**.swift'

jobs:
  xctesting:
    # Highly recommend to use selfhosted mac runners as they are cheaper
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - uses: irgaly/xcode-cache@v1
        with:
          key: xcode-cache-deriveddata-${{ github.workflow }}
          restore-keys: xcode-cache-deriveddata-${{ github.workflow }}

      - name: Run App Tests
        uses: GetAutomaApp/opensource-actions/xctesting@main
        with:
          working-directory: "./App/AppDirectory/"
          schema: "IOS-ADMIN"
          destination: "platform=iOS Simulator,name=iPhone 16,OS=18.0"
          testing-targets: "IOS-ADMINIntegrationTests,IOS-ADMINUnitTests"
```
### `working-directory`

Optional. Directory to run XCTesting in. Defaults to repository root ('.').

### Schema

Non-Optional. Xcode Schema you want to run the tests for. `Eg: IOS, IOS-ADMIN`

### Destination
Non-Optional. On what you want to run tests (Eg: `platform-iOS Simulator,name iPhone 16,OS=18.0`) (Empty string will show all invalid values)

### Testing Targets
Non-Optional. Comma separated testing targets Eg: IOSUnitTests,IOSUITests

## Outputs

### `exit-code`

The exit code from the SwiftTesting run. 0 indicates success, non-zero indicates issues were found.

## License

MIT
