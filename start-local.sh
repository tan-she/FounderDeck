#!/bin/bash

# Create logs directory
mkdir -p logs

echo "Starting FounderDeck local services..."

# 1. Laravel API Server
echo "Starting Laravel API Server on port 8000..."
nohup php founderdeck-api/artisan serve --port=8000 > logs/laravel-api.log 2>&1 &
echo $! > logs/laravel-api.pid

# 2. Queue Worker
echo "Starting Queue Worker..."
nohup php founderdeck-api/artisan queue:work --tries=3 > logs/queue-worker.log 2>&1 &
echo $! > logs/queue-worker.pid

# 3. Reverb WebSocket Server
echo "Starting Reverb WebSocket Server on port 8080..."
nohup php founderdeck-api/artisan reverb:start --port=8080 > logs/reverb.log 2>&1 &
echo $! > logs/reverb.pid

# 4. Task Scheduler
echo "Starting Laravel Task Scheduler..."
nohup php founderdeck-api/artisan schedule:work > logs/scheduler.log 2>&1 &
echo $! > logs/scheduler.pid

# 5. React Vite Dev Server
echo "Starting React Vite Dev Server..."
cd founderdeck-web
nohup npm run dev > ../logs/vite.log 2>&1 &
echo $! > ../logs/vite.pid
cd ..

echo "All services started!"
echo "Check the 'logs/' directory for output logs."
echo "Active PIDs are stored in logs/*.pid files."
