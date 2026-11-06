#!/usr/bin/env bash
# Manual deploy over SSH (run inside the app folder on the server):  ./deploy.sh
set -euo pipefail

git pull --ff-only
npm ci
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
pm2 status events-api