#!/bin/sh
# A push deploys nothing. This does.
cd "$(dirname "$0")" && npx wrangler deploy
