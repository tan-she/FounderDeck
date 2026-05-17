#!/bin/bash
echo "Diagnosing structure..."

if [ -d "founderdeck-api" ]; then
  if [ -f "founderdeck-api/artisan" ]; then
    echo "⚠️  WARNING: founderdeck-api/ appears to be a valid Laravel app (artisan found)."
    echo "Please manually decide which backend to keep (FounderDeck/ or founderdeck-api/)."
  else
    echo "🗑️  Deleting empty/invalid founderdeck-api/ directory..."
    rm -rf founderdeck-api/
  fi
fi

if [ -d "node_modules" ]; then
  echo "🗑️  Deleting root-level node_modules/..."
  rm -rf node_modules/
fi

if [ -f "package.json" ]; then
  echo "🗑️  Deleting root-level package.json..."
  rm -f package.json
fi

if [ -f "package-lock.json" ]; then
  echo "🗑️  Deleting root-level package-lock.json..."
  rm -f package-lock.json
fi

if [ -f "index.js" ]; then
  echo "🗑️  Deleting root-level index.js..."
  rm -f index.js
fi

if [ -f ".env" ]; then
  echo "🗑️  Deleting root-level .env..."
  rm -f .env
fi

echo ""
echo "Verifying correct structure:"
[ -f "FounderDeck/artisan" ] && echo "✅ FounderDeck/artisan exists" || echo "❌ FounderDeck/artisan missing"
[ -f "FounderDeck/.env" ] && echo "✅ FounderDeck/.env exists" || echo "❌ FounderDeck/.env missing"
[ -f "founderdeck-web/package.json" ] && echo "✅ founderdeck-web/package.json exists" || echo "❌ founderdeck-web/package.json missing"
[ -d "founderdeck-web/src" ] && echo "✅ founderdeck-web/src/ exists" || echo "❌ founderdeck-web/src/ missing"

echo ""
echo "Cleanup complete. Next steps: Review the ✅/❌ list above. If anything is ❌, make sure you cloned the repository correctly."
