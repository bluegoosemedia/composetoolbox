#!/bin/sh

# Run data initialization
./scripts/init-data.sh

# Start the Next.js server
exec node server.js
