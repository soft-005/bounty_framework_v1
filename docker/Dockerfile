# KSA Bug Bounty Framework - Security Tools Container
# Multi-stage build: Go tools builder + Alpine runtime

# Stage 1: Build Go-based security tools
FROM golang:1.22-alpine AS go-builder

# Install build dependencies
RUN apk add --no-cache git build-base

# Set Go environment
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64

# Install ProjectDiscovery tools
RUN go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
RUN go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
RUN go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest
RUN go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest
RUN go install -v github.com/projectdiscovery/katana/cmd/katana@latest
RUN go install -v github.com/projectdiscovery/shuffledns/cmd/shuffledns@latest

# Install other Go tools
RUN go install -v github.com/ffuf/ffuf/v2@latest
RUN go install -v github.com/lc/gau/v2/cmd/gau@latest
RUN go install -v github.com/jaeles-project/gospider@latest
RUN go install -v github.com/tomnomnom/assetfinder@latest

# Install Amass (larger tool, do last)
RUN go install -v github.com/owasp-amass/amass/v4/...@master

# Stage 2: Runtime container
FROM alpine:3.19

# Labels
LABEL maintainer="KSA Bug Bounty Framework"
LABEL description="Security tools container for bug bounty reconnaissance"
LABEL version="1.0.0"

# Install runtime dependencies
RUN apk add --no-cache \
    bash \
    curl \
    wget \
    git \
    python3 \
    py3-pip \
    bind-tools \
    whois \
    nmap \
    jq \
    ca-certificates \
    tzdata \
    libpcap \
    netcat-openbsd

# Copy Go binaries from builder
COPY --from=go-builder /go/bin/subfinder /usr/local/bin/
COPY --from=go-builder /go/bin/httpx /usr/local/bin/
COPY --from=go-builder /go/bin/nuclei /usr/local/bin/
COPY --from=go-builder /go/bin/naabu /usr/local/bin/
COPY --from=go-builder /go/bin/dnsx /usr/local/bin/
COPY --from=go-builder /go/bin/katana /usr/local/bin/
COPY --from=go-builder /go/bin/shuffledns /usr/local/bin/
COPY --from=go-builder /go/bin/ffuf /usr/local/bin/
COPY --from=go-builder /go/bin/gau /usr/local/bin/
COPY --from=go-builder /go/bin/gospider /usr/local/bin/
COPY --from=go-builder /go/bin/assetfinder /usr/local/bin/
COPY --from=go-builder /go/bin/amass /usr/local/bin/

# Create app directories
RUN mkdir -p /app/data /app/output /app/wordlists /app/templates

# Download common wordlists
RUN wget -q -O /app/wordlists/subdomains.txt \
    https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/DNS/subdomains-top1million-5000.txt

# Update nuclei templates
RUN nuclei -update-templates -silent || true

# Create non-root user for security
RUN adduser -D -h /app -s /bin/bash ksa
RUN chown -R ksa:ksa /app

# Set working directory
WORKDIR /app

# Volume mounts
VOLUME ["/app/data", "/app/output"]

# Default user
USER ksa

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD subfinder -version || exit 1

# Default command - keep container running
CMD ["tail", "-f", "/dev/null"]
