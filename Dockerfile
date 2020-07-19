############################
# STEP 1 build executable binary
############################
# golang alpine 1.14.6
# https://hub.docker.com/layers/golang/library/golang/1.14.6-alpine3.12/images/sha256-3fc3fee447e1430c0a68b81cab2c850691b236c4aacb4b694bcbc323a7f1fc29?context=explore
FROM golang@sha256:3fc3fee447e1430c0a68b81cab2c850691b236c4aacb4b694bcbc323a7f1fc29 as builder

# Install git + SSL ca certificates.
# Git is required for fetching the dependencies.
# Ca-certificates is required to call HTTPS endpoints.
RUN apk update && apk add --no-cache git ca-certificates tzdata && update-ca-certificates

# Create appuser
RUN adduser -D -g '' appuser

WORKDIR /usr/src/app

# Pull these out first to take advantage of docker caching
COPY ./go.mod .
COPY ./go.sum .

# Fetch dependencies.
RUN go mod download
RUN go mod verify

# Copy the rest of the code
COPY . .

# Build the binary
RUN GIT_TERMINAL_PROMPT=1 CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o backend .

############################
# STEP 2 build a small image
############################
FROM gcr.io/distroless/static:latest

COPY --from=builder /usr/src/app/backend /usr/local/bin/backend

WORKDIR /app

ENTRYPOINT ["/usr/local/bin/backend"]