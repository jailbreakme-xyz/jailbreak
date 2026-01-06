#!/bin/bash
set -e

echo "=== Restoring MongoDB backup to Docker container ==="

# Check if mongodb container is running
if ! docker ps --format '{{.Names}}' | grep -q '^mongodb$'; then
    echo "Error: mongodb container is not running. Start it with: docker-compose up -d mongodb"
    exit 1
fi

# Run mongorestore inside the container
echo "Restoring backup files to 'jailbreak' database..."
docker exec mongodb mongorestore --gzip --dir=/backup --db=jailbreak --drop

echo ""
echo "=== Restore completed! ==="
echo ""
echo "Restored collections:"
docker exec mongodb mongosh --quiet --eval "db.getSiblingDB('jailbreak').getCollectionNames().forEach(c => print('  - ' + c))"

