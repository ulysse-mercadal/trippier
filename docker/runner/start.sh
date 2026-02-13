#!/bin/sh

# Start Backend (NestJS)
echo "🚀 Starting Backend on port 3001..."
cd /app/backend
# Ensure PORT env var is set for NestJS
export PORT=3001
bun dist/main.js &
BACKEND_PID=$!

# Start Frontend (Next.js)
echo "🚀 Starting Frontend on port 3000..."
cd /app/frontend
# Next.js start command
bun run start -- -p 3000 &
FRONTEND_PID=$!

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
