FROM swift:5.8

LABEL "com.github.actions.name"="SwiftLint"
LABEL "com.github.actions.description"="A GitHub Action that runs SwiftLint with custom and default rules"
LABEL "com.github.actions.icon"="code"
LABEL "com.github.actions.color"="orange"

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/realm/SwiftLint.git && \
    cd SwiftLint && \
    swift build -c release && \
    mv .build/release/swiftlint /usr/local/bin/swiftlint && \
    cd .. && \
    rm -rf SwiftLint

COPY entrypoint.sh /entrypoint.sh
COPY default.swiftlint.yml /default.swiftlint.yml

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]