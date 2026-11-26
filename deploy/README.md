# Deploying EventOps OS (Cloud Run + Cloud SQL)

One Cloud Run service runs the API and serves the web app (same origin). Postgres
is a small Cloud SQL instance. Secrets live in Secret Manager. Migrations run on
container start. Region: `asia-southeast1` (Singapore).

Run these from Cloud Shell (or any machine with `gcloud`), signed in as an owner.
Set the variables once:

```bash
export PROJECT=gen-lang-client-0095660951     # or your dedicated project
export REGION=asia-southeast1
export SERVICE=eventops
export SQL_INSTANCE=eventops-db
export DB_NAME=eventops
export DB_USER=eventops
gcloud config set project $PROJECT
```

## 1. Enable APIs

```bash
gcloud services enable run.googleapis.com sqladmin.googleapis.com \
  cloudbuild.googleapis.com secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

## 2. Cloud SQL (Postgres 16)

```bash
gcloud sql instances create $SQL_INSTANCE \
  --database-version=POSTGRES_16 --tier=db-f1-micro --region=$REGION

DB_PASS="$(openssl rand -base64 24)"
gcloud sql databases create $DB_NAME --instance=$SQL_INSTANCE
gcloud sql users create $DB_USER --instance=$SQL_INSTANCE --password="$DB_PASS"

CONN="$(gcloud sql instances describe $SQL_INSTANCE --format='value(connectionName)')"
echo "Cloud SQL connection name: $CONN"
```

## 3. Secrets

The app reads its secrets from env vars; we back the sensitive ones with Secret
Manager. `DATABASE_URL` uses the Cloud SQL unix socket.

```bash
# DATABASE_URL (note the ?host=/cloudsql/... socket path)
printf 'postgresql://%s:%s@localhost/%s?host=/cloudsql/%s' \
  "$DB_USER" "$DB_PASS" "$DB_NAME" "$CONN" \
  | gcloud secrets create DATABASE_URL --data-file=-

# Session signing key
openssl rand -hex 32 | gcloud secrets create SESSION_SECRET --data-file=-

# Google service account key (base64), for document generation.
# Use the eventops-generator key you created for the spike:
base64 -w0 ~/key.json | gcloud secrets create GOOGLE_SERVICE_ACCOUNT_KEY --data-file=-

# Google OAuth client secret (from the OAuth client you create — see step 6).
printf '%s' 'PASTE_OAUTH_CLIENT_SECRET' | gcloud secrets create GOOGLE_OAUTH_CLIENT_SECRET --data-file=-
```

Grant the Cloud Run runtime service account access (default compute SA):

```bash
PNUM="$(gcloud projects describe $PROJECT --format='value(projectNumber)')"
RUN_SA="$PNUM-compute@developer.gserviceaccount.com"
for S in DATABASE_URL SESSION_SECRET GOOGLE_SERVICE_ACCOUNT_KEY GOOGLE_OAUTH_CLIENT_SECRET; do
  gcloud secrets add-iam-policy-binding $S \
    --member="serviceAccount:$RUN_SA" --role="roles/secretmanager.secretAccessor"
done
gcloud projects add-iam-policy-binding $PROJECT \
  --member="serviceAccount:$RUN_SA" --role="roles/cloudsql.client"
```

## 4. Deploy

```bash
./deploy/deploy.sh
```

(or run the `gcloud run deploy` inside it directly). It builds the Dockerfile,
attaches the Cloud SQL instance, and wires env + secrets. The first deploy prints
the service URL.

## 5. Point config at the deployed URL

```bash
URL="$(gcloud run services describe $SERVICE --region=$REGION --format='value(status.url)')"
gcloud run services update $SERVICE --region=$REGION \
  --update-env-vars "WEB_ORIGIN=$URL,OAUTH_REDIRECT_URL=$URL/api/auth/google/callback"
echo "App: $URL"
```

## 6. Finish Google OAuth

In Cloud Console → APIs & Services → Credentials → your OAuth client → add the
redirect URI `"$URL/api/auth/google/callback"` (exactly). Put the client **id**
in the deploy env (`GOOGLE_OAUTH_CLIENT_ID`, non-secret) and the **secret** in the
`GOOGLE_OAUTH_CLIENT_SECRET` secret (step 3). Redeploy. "Continue with Google"
now works and dev-login turns off automatically.

## Notes

- `db-f1-micro` is the cheapest tier — fine to start; resize later.
- Migrations apply automatically on each deploy (`prisma migrate deploy`).
- To seed the demo data once: `gcloud sql connect` or run `npm run db:seed` against
  the instance from Cloud Shell with the same `DATABASE_URL` (optional — real
  events are created through the app).
