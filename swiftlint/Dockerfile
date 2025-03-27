FROM alpine:latest

LABEL "com.github.actions.name"="SwiftLint"
LABEL "com.github.actions.description"="A GitHub Action that runs SwiftLint with custom and default rules"
LABEL "com.github.actions.icon"="code"
LABEL "com.github.actions.color"="orange"

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/realm/SwiftLint/releases/latest/download/swiftlint_linux.zip -o swiftlint.zip \
    && unzip swiftlint.zip \
    && rm swiftlint.zip \
    && mv swiftlint /usr/local/bin/

COPY entrypoint.sh /entrypoint.sh
COPY default.swiftlint.yml /default.swiftlint.yml

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
