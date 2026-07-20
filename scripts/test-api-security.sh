#!/usr/bin/env sh
set -eu

base_url="${APP_URL:-http://127.0.0.1:3001}"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

wait_code="$(curl --retry 15 --retry-connrefused --retry-delay 1 --silent --output "$tmp_dir/health.json" --write-out '%{http_code}' "$base_url/api/health")"
[ "$wait_code" = 200 ] || { echo "health check failed: $wait_code"; exit 1; }

payment_code="$(curl --silent --output "$tmp_dir/payment.json" --write-out '%{http_code}' -H 'content-type: application/json' -H 'idempotency-key: security-test' --data '{"invoiceId":1,"amountKes":1,"method":"Cash","reference":"SECURITY-TEST"}' "$base_url/api/portal/payments")"
[ "$payment_code" = 401 ] || { echo "unauthenticated payment was not rejected: $payment_code"; exit 1; }

credential_code="$(curl --silent --output "$tmp_dir/credential.json" --write-out '%{http_code}' -H 'content-type: application/json' --data '{"studentId":1,"batchId":1}' "$base_url/api/portal/graduation/credentials")"
[ "$credential_code" = 401 ] || { echo "unauthenticated credential issue was not rejected: $credential_code"; exit 1; }

curl --fail --silent --cookie-jar "$tmp_dir/student.cookies" -H 'content-type: application/json' --data '{"email":"student@rhti.local","password":"Student@RHTI2026"}' --output /dev/null "$base_url/api/auth/login"
curl --fail --silent --cookie "$tmp_dir/student.cookies" --output "$tmp_dir/student-snapshot.json" "$base_url/api/portal/snapshot"
if grep -q '"applications":\[[^]]' "$tmp_dir/student-snapshot.json"; then echo "student snapshot leaked applications"; exit 1; fi
if grep -q '"users":\[[^]]' "$tmp_dir/student-snapshot.json"; then echo "student snapshot leaked user directory"; exit 1; fi

student_payment_code="$(curl --silent --cookie "$tmp_dir/student.cookies" --output "$tmp_dir/student-payment.json" --write-out '%{http_code}' -H 'content-type: application/json' -H 'idempotency-key: student-security-test' --data '{"invoiceId":1,"amountKes":1,"method":"Cash","reference":"STUDENT-SECURITY-TEST"}' "$base_url/api/portal/payments")"
[ "$student_payment_code" = 403 ] || { echo "student obtained finance permission: $student_payment_code"; exit 1; }

echo "API authentication, RBAC, and row-isolation checks passed"
