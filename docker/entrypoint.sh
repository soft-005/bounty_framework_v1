#!/bin/bash
# KSA Tools Container Entrypoint
# Executes commands safely with output capture

set -e

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Function to execute a command with timeout
execute_with_timeout() {
    local timeout=$1
    shift
    local cmd="$@"

    log "Executing: $cmd"
    log "Timeout: ${timeout}s"

    # Execute with timeout
    timeout "$timeout" $cmd
    local exit_code=$?

    log "Exit code: $exit_code"
    return $exit_code
}

# Check if command is provided
if [ $# -eq 0 ]; then
    log "No command provided. Container will stay running."
    exec tail -f /dev/null
fi

# Get timeout from environment or default to 5 minutes
TIMEOUT=${EXEC_TIMEOUT:-300}

# Execute the command
execute_with_timeout "$TIMEOUT" "$@"
