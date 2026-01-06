#!/bin/bash
set -e

echo "=== MongoDB Backup Restore Script ==="

# Check if backup directory exists and has files
if [ -d "/backup" ] && [ "$(ls -A /backup/*.bson.gz 2>/dev/null)" ]; then
    echo "Found backup files, checking if restore is needed..."
    
    # Check if database already has data (skip restore if it does)
    COLLECTION_COUNT=$(mongosh --quiet --eval "db.getSiblingDB('jailbreak').getCollectionNames().length")
    
    if [ "$COLLECTION_COUNT" -gt 0 ]; then
        echo "Database 'jailbreak' already has $COLLECTION_COUNT collections. Skipping restore."
        exit 0
    fi
    
    echo "Restoring backup to 'jailbreak' database..."
    
    # Restore all collections from backup
    mongorestore --gzip --dir=/backup --db=jailbreak --drop
    
    echo "=== Backup restore completed! ==="
    
    # Show restored collections
    echo "Restored collections:"
    mongosh --quiet --eval "db.getSiblingDB('jailbreak').getCollectionNames().forEach(c => print('  - ' + c))"
else
    echo "No backup files found in /backup directory. Starting with empty database."
fi

