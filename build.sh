#!/bin/bash
set -e
echo "==> Installing frontend deps"
cd frontend
npm install
npm run build
echo "==> Copying build to backend/static"
rm -rf ../backend/static
cp -r dist ../backend/static
echo "==> Build complete"
