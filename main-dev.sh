#!/bin/bash

# Main development script - forwards to scripts/dev.sh
SCRIPTS_DIR="$(cd "$(dirname "$0")/scripts" && pwd)"
exec "$SCRIPTS_DIR/dev.sh" "$@"