FROM golang:1.17-alpine@sha256:99ddec1bbfd6d6bca3f9804c02363daee8c8524dae50df7942e8e60788fd17c9 AS builder
ENV CGO_ENABLED=0
WORKDIR /backend
COPY vm/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY vm/. .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o bin/service

FROM --platform=$BUILDPLATFORM node:17.7-alpine3.14@sha256:539e64749f7dc6c578d744d879fd0ec37f3afe552ae4aca9744cc85121728c4c AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="skill-extension" \
    org.opencontainers.image.description="Running a skill as an Docker Desktop Extension" \
    org.opencontainers.image.vendor="Docker Inc." \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog="" \
    com.docker.skill.api.version="extension/v2"

COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY skill.yaml .
COPY datalog .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/extension-skill-extension.sock
