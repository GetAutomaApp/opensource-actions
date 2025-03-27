#!/bin/bash

set -e

if [ -f ".swiftlint.yml" ]; then
    echo "Using repository's .swiftlint.yml configuration"
    CONFIG_FILE=".swiftlint.yml"
else
    echo "No .swiftlint.yml found in repository, using default configuration"
    CONFIG_FILE="/default.swiftlint.yml"
fi

swiftlint lint --config "$CONFIG_FILE" --reporter github-actions-logging

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "SwiftLint completed successfully"
else
    echo "SwiftLint found issues"
fi

exit $EXIT_CODE