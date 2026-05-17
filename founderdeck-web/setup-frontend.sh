#!/bin/bash

cd "$(dirname "$0")" || exit

echo "Setting up FounderDeck React Frontend..."

# 1. Check Node version
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node Version: $NODE_VERSION"
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "✅ Node version is 18+"
    else
        echo "❌ ERROR: Node 18 or higher is required!"
        exit 1
    fi
else
    echo "❌ ERROR: Node is not installed or not in PATH."
    exit 1
fi

# 2. Check .env.local
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "⚠️ .env.local created from example — fill in your values if needed."
else
    echo "✅ .env.local already exists."
fi

# 3. Install dependencies
echo "Running npm install..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ NPM dependencies installed."
else
    echo "❌ ERROR: NPM install failed."
    exit 1
fi

# 4. Check required packages
echo "Verifying essential packages in node_modules..."
check_pkg() {
    if [ -d "node_modules/$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
    fi
}

check_pkg "react"
check_pkg "react-dom"
check_pkg "react-router-dom"
check_pkg "@tanstack/react-query"
check_pkg "zustand"
check_pkg "axios"
check_pkg "laravel-echo"
check_pkg "pusher-js"
check_pkg "tailwindcss"
check_pkg "framer-motion"
check_pkg "react-hook-form"
check_pkg "zod"
check_pkg "@hookform/resolvers"
check_pkg "lucide-react"
check_pkg "sonner"

# 5. Build dry-run
echo "Running build dry-run..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful."
else
    echo "❌ ERROR: Build failed. Check the errors above."
    exit 1
fi

echo ""
echo "Frontend ready. Run: npm run dev"
