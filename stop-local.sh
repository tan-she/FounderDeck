#!/bin/bash

echo "Stopping FounderDeck local services..."

for pid_file in logs/*.pid; do
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        service_name=$(basename "$pid_file" .pid)
        if ps -p "$pid" > /dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            # wait a bit and kill -9 if still running
            sleep 1
            if ps -p "$pid" > /dev/null; then
                kill -9 "$pid"
            fi
        else
            echo "$service_name (PID: $pid) is not running."
        fi
        rm "$pid_file"
    fi
done

# Double check port usage to make sure everything is killed
echo "Ensuring ports 8000, 8080, and 5173 are freed..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "All services stopped."
