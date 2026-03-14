#!/bin/sh

set -eu

max_attempts="${DB_PUSH_MAX_ATTEMPTS:-20}"
attempt=1

while [ "$attempt" -le "$max_attempts" ]; do
  echo "[$attempt/$max_attempts] syncing database schema"

  if pnpm db:push; then
    exec node server.js
  fi

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "database schema sync failed after $max_attempts attempts" >&2
    exit 1
  fi

  echo "schema sync failed, retrying in 3s" >&2
  attempt=$((attempt + 1))
  sleep 3
done
