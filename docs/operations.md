# Radiant School production operations

## Database backups

Run `sh scripts/backup-postgres.sh /secure/backup/path` from the deployment host. Store copies off-site using encrypted object storage. The default local retention is 14 days and can be changed with `BACKUP_RETENTION_DAYS`.

Verify every backup before relying on it:

```sh
createdb radiant_restore_test
pg_restore --exit-on-error --clean --if-exists --no-owner --dbname radiant_restore_test radiant-school-TIMESTAMP.dump
psql radiant_restore_test -c "SELECT count(*) FROM portal_students"
dropdb radiant_restore_test
```

Production should use managed PostgreSQL point-in-time recovery in addition to logical backups. Keep at least 35 days of WAL/PITR history, encrypt backups at rest, restrict restore credentials, and perform a documented restore drill each quarter.

## Health and monitoring

`GET /api/health` checks application-to-PostgreSQL connectivity. Monitor HTTP status, latency, database pool saturation, failed logins, failed notifications, payment reconciliation queues, and migration status. Alert on any 5xx rate increase or backup/restore failure.

## Security operations

- Rotate database and seeded administrator credentials before deployment.
- Terminate active sessions after role or employment changes.
- Review the append-only `portal_audit_logs` table regularly.
- Run the application behind TLS and a trusted reverse proxy.
- Do not expose PostgreSQL publicly in production.
- Apply migrations through a single controlled deployment job.
