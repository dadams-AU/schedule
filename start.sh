#!/bin/bash

set -eo pipefail

# Start Apache in the background
echo "Starting Apache..."
/usr/sbin/apache2ctl -D FOREGROUND &

# Start the Node.js backend application
echo "Starting Node.js backend..."
cd /app/data/backend
npm start
