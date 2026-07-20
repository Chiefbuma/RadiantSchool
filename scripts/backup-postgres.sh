#!/usr/bin/env sh
set -eu

backup_dir="${1:-./backups}"
retention_days="${BACKUP_RETENTION_DAYS:-14}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
docker exec rhit-postgres pg_dump -U "${POSTGRES_USER:-rhit}" -d "${POSTGRES_DB:-rhit}" --format=custom --no-owner --no-acl > "$backup_dir/radiant-school-$timestamp.dump"
find "$backup_dir" -type f -name 'radiant-school-*.dump' -mtime "+$retention_days" -delete
echo "Backup created: $backup_dir/radiant-school-$timestamp.dump"
