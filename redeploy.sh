#!/bin/bash
# redeploy.sh
# Script to update and restart the application on the server

echo "Pulling latest changes from git..."
git pull origin main

echo "Rebuilding and restarting containers..."
docker-compose up -d --build

echo "Updating dependencies (Backend)..."
docker-compose exec app composer install --no-dev --optimize-autoloader

echo "Updating dependencies (Frontend)..."
docker-compose exec frontend npm install

echo "Running database migrations..."
docker-compose exec app php artisan migrate --force

echo "Clearing cache..."
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan view:clear

echo "Redeployment complete!"
