#!/usr/bin/env bash
# Deploy EventOps OS to Cloud Run (API + web in one service), backed by Cloud SQL.
# Prerequisites are one-time and documented in deploy/README.md (APIs, Cloud SQL,
# secrets). This script is the repeatable deploy step. Run from the repo root.
set -euo pipefail

PROJECT="${PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-asia-southeast1}"
SERVICE="${SERVICE:-eventops}"
SQL_INSTANCE="${SQL_INSTANCE:-eventops-db}"
GOOGLE_OAUTH_CLIENT_ID="${GOOGLE_OAUTH_CLIENT_ID:-}"   # non-secret; optional until OAuth is set up

CONN="$(gcloud sql instances describe "$SQL_INSTANCE" --project "$PROJECT" --format='value(connectionName)')"

echo "Deploying $SERVICE to $REGION (project $PROJECT, Cloud SQL $CONN)…"

gcloud run deploy "$SERVICE" \
  --project "$PROJECT" \
  --region "$REGION" \
  --source . \
  --allow-unauthenticated \
  --add-cloudsql-instances "$CONN" \
  --cpu 1 --memory 512Mi --min-instances 0 --max-instances 4 \
  --set-env-vars "NODE_ENV=production,ALLOWED_EMAIL_DOMAIN=myatag.com,GOOGLE_SHARED_DRIVE_ID=0AECZvjbndJEEUk9PVA,GOOGLE_EVENTS_FOLDER_ID=1zYQv1LqYJXjrVorqMJlc-5oOZFlI_4ma,GOOGLE_TEMPLATE_DECK_ID=160pXA5mWHB13zPjYKReQZ0Lzqke6ei3fUFbtO1S6jz4,GOOGLE_TEMPLATE_SCORESHEET_ID=1SLan91_0JFrYg5wjCK8R2vNhIOfV6uderIvIftWPzc4,GOOGLE_TEMPLATE_RUNSHEET_ID=1aZU0HC3xXAUDyxklVmN01ccHZo_oOrsASIg4tQ1dboc,GOOGLE_SCORESHEET_TAB=Activity Master${GOOGLE_OAUTH_CLIENT_ID:+,GOOGLE_OAUTH_CLIENT_ID=$GOOGLE_OAUTH_CLIENT_ID}${ENABLE_DEV_LOGIN:+,ENABLE_DEV_LOGIN=$ENABLE_DEV_LOGIN}" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest,GOOGLE_SERVICE_ACCOUNT_KEY=GOOGLE_SERVICE_ACCOUNT_KEY:latest,GOOGLE_OAUTH_CLIENT_SECRET=GOOGLE_OAUTH_CLIENT_SECRET:latest"

URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format='value(status.url)')"
echo
echo "Deployed: $URL"
echo "Next: set WEB_ORIGIN + OAUTH_REDIRECT_URL to this URL (deploy/README.md step 5),"
echo "and add $URL/api/auth/google/callback to the OAuth client."
