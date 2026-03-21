#!/bin/bash
# deploy.sh
# Script for initializing project on VPS

echo "Building containers..."
docker-compose build

echo "Installing Laravel Vendor Packages..."
docker-compose run --rm app composer install

echo "Installing React node_modules..."
docker-compose run --rm frontend npm install

echo "Setting up Laravel env..."
cp backend/.env.example backend/.env
docker-compose run --rm app php artisan key:generate

echo "Starting services..."
docker-compose up -d

echo "Running migrations..."
sleep 10 # wait for db to be ready
docker-compose exec app php artisan migrate --force

echo "Deployment complete! Application running on ports 8000 (Backend) and 5173 (Frontend)."
