# Phase 0 Spike — Google Workspace generation

Throwaway script that de-risks the feature EventOps OS is built on. It runs the
seven spike tasks from the Technical Design doc against the **real**
`EVENT OPS OS Events` template folder and prints a PASS/FAIL report plus the
four decisions to capture.

It does **not** touch the production app. It authenticates from your
environment (ADC or a service-account key) — no secret is stored in this repo.

## What it does

1. Auth + list the template folder (confirms Workspace / Shared Drive).
2. Provision: create a `TEST EVENT …` folder + `Decks/ Sheets/ Docs/`, copy the templates in.
3. Docs merge: `replaceAllText` on `{{tokens}}`, then verify none remain.
4. Sheets: write sample scores into a named range (or `A1`), read back.
5. Slides: duplicate a slide + `replaceAllText`.
6. Sharing: grant your ops group / a test viewer, list the result.
7. Ownership: confirm files are **team-owned** (Shared Drive) vs. personal.

## Run it in Google Cloud Shell (recommended)

Open Cloud Shell as the Workspace admin (info@myatag.com), then:

```bash
# 1. Enable the APIs (once per project)
gcloud services enable drive.googleapis.com docs.googleapis.com \
  sheets.googleapis.com slides.googleapis.com

# 2a. Preferred — use the SERVICE ACCOUNT that production will use.
#     Create it, download a key, and add its email to the
#     "EVENT OPS OS Events" Shared Drive as a Content manager (Drive UI →
#     Shared Drive → Manage members). Then:
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# 2b. OR quick path — your own user credentials with Drive scopes:
# gcloud auth application-default login \
#   --scopes=https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/documents,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/presentations

# 3. Point at the template (this is the default; override if it moved)
export TEMPLATE_FOLDER_ID=1fvBGdH5kUBmoKAK4vNZImT2N5D-iVi6C

# Optional: test sharing + choose where the test folder is created
# export OPS_GROUP_EMAIL=ops-team@myatag.com
# export TEST_VIEWER_EMAIL=info@myatag.com
# export PARENT_FOLDER_ID=<folder id, defaults to the template's parent>
# export CLEANUP=1   # trash the test folder when done

# 4. Run
cd spike
npm install
node run.mjs
```

Use **2a (service account)** for the real test: it validates the production
identity and the team-owned ownership model (Task 7). 2b is fine for a first
smoke test but tests *your* account, not the service account.

## Reading the result

The summary lists each task's status. Then paste the console output back here and
I'll turn the findings into the four captured decisions and update the design doc
+ the `api/src/services/google/*` implementations accordingly.

If auth fails with a scope/permission error, the script tells you — it almost
always means the service account isn't a member of the Shared Drive yet, or the
APIs aren't enabled.
