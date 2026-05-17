Write-Host "Diagnosing structure..."

if (Test-Path "founderdeck-api") {
    if (Test-Path "founderdeck-api\artisan") {
        Write-Host "⚠️  WARNING: founderdeck-api\ appears to be a valid Laravel app (artisan found)." -ForegroundColor Yellow
        Write-Host "Please manually decide which backend to keep (FounderDeck\ or founderdeck-api\)."
    } else {
        Write-Host "🗑️  Deleting empty/invalid founderdeck-api\ directory..."
        Remove-Item -Recurse -Force "founderdeck-api"
    }
}

if (Test-Path "node_modules") {
    Write-Host "🗑️  Deleting root-level node_modules\..."
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package.json") {
    Write-Host "🗑️  Deleting root-level package.json..."
    Remove-Item -Force "package.json"
}

if (Test-Path "package-lock.json") {
    Write-Host "🗑️  Deleting root-level package-lock.json..."
    Remove-Item -Force "package-lock.json"
}

if (Test-Path "index.js") {
    Write-Host "🗑️  Deleting root-level index.js..."
    Remove-Item -Force "index.js"
}

if (Test-Path ".env") {
    Write-Host "🗑️  Deleting root-level .env..."
    Remove-Item -Force ".env"
}

Write-Host "`nVerifying correct structure:"
if (Test-Path "FounderDeck\artisan") { Write-Host "✅ FounderDeck\artisan exists" } else { Write-Host "❌ FounderDeck\artisan missing" }
if (Test-Path "FounderDeck\.env") { Write-Host "✅ FounderDeck\.env exists" } else { Write-Host "❌ FounderDeck\.env missing" }
if (Test-Path "founderdeck-web\package.json") { Write-Host "✅ founderdeck-web\package.json exists" } else { Write-Host "❌ founderdeck-web\package.json missing" }
if (Test-Path "founderdeck-web\src") { Write-Host "✅ founderdeck-web\src\ exists" } else { Write-Host "❌ founderdeck-web\src\ missing" }

Write-Host "`nCleanup complete. Next steps: Review the ✅/❌ list above. If anything is ❌, make sure you cloned the repository correctly."
