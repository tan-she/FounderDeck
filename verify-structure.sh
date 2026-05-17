#!/bin/bash

# Target Structure verification script
TOTAL=0
FOUND=0

check_path() {
    local path=$1
    TOTAL=$((TOTAL + 1))
    if [ -e "$path" ]; then
        echo "✅ $path"
        FOUND=$((FOUND + 1))
    else
        echo "❌ $path"
    fi
}

echo "Verifying FounderDeck backend structure..."
check_path "FounderDeck/app/Http/Controllers/Api"
check_path "FounderDeck/app/Http/Middleware"
check_path "FounderDeck/app/Http/Requests"
check_path "FounderDeck/app/Http/Resources"
check_path "FounderDeck/app/Models"
check_path "FounderDeck/app/Events"
check_path "FounderDeck/app/Policies"
check_path "FounderDeck/app/Console/Commands"
check_path "FounderDeck/app/Mail"
check_path "FounderDeck/bootstrap"
check_path "FounderDeck/config"
check_path "FounderDeck/database/migrations"
check_path "FounderDeck/database/seeders"
check_path "FounderDeck/routes/api.php"
check_path "FounderDeck/storage"
check_path "FounderDeck/.env"
check_path "FounderDeck/.env.example"
check_path "FounderDeck/.gitignore"
check_path "FounderDeck/artisan"
check_path "FounderDeck/composer.json"
check_path "FounderDeck/composer.lock"

echo ""
echo "Verifying founderdeck-web frontend structure..."
check_path "founderdeck-web/src/api"
check_path "founderdeck-web/src/components"
check_path "founderdeck-web/src/lib"
check_path "founderdeck-web/src/pages"
check_path "founderdeck-web/src/store"
check_path "founderdeck-web/public"
check_path "founderdeck-web/.env.local"
check_path "founderdeck-web/.gitignore"
check_path "founderdeck-web/index.html"
check_path "founderdeck-web/package.json"
check_path "founderdeck-web/tailwind.config.js"
check_path "founderdeck-web/vite.config.js"

echo ""
echo "Verification Complete: $FOUND/$TOTAL files/folders found."
