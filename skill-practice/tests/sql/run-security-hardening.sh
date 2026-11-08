#!/bin/sh
set -eu
initdb -D /scratch/pg -A trust -U postgres >/dev/null
pg_ctl -D /scratch/pg -l /scratch/postgres.log -o '-k /scratch -h "" -c statement_timeout=3000' -w start >/dev/null
trap 'pg_ctl -D /scratch/pg -m immediate stop >/dev/null 2>&1' EXIT
export PGHOST=/scratch PGUSER=postgres PGDATABASE=postgres
psql -X -q -v ON_ERROR_STOP=1 -f /tests/bootstrap.sql
for migration in /migrations/*.sql; do
  psql -X -q -v ON_ERROR_STOP=1 -f "$migration" >/dev/null
done
psql -X -q -v ON_ERROR_STOP=1 -f /tests/security-hardening.sql
if psql -X -q -v ON_ERROR_STOP=1 -f /rollback.sql >/dev/null 2>/scratch/rollback-error; then
  echo 'FAIL: rollback allowed after 0051' >&2
  exit 1
fi
grep -q 'Rollback blocked: provisioning 0051 requires locale' /scratch/rollback-error
psql -X -q -v ON_ERROR_STOP=1 -f /verify-rollout.sql >/dev/null
echo 'PASS: rollback refused without dropping locale; current rollout checks execute'
