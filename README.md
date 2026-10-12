# GDF Client Form

A simple contact-details form for **Global Detergent Factory**. Clients enter their full name, email, company name and phone number; each submission is appended as a row in a Google Sheet.

Built with Next.js. The browser posts to `/api/submit`, which validates the data and forwards it to a Google Apps Script web app bound to your sheet, so the script URL and secret are never exposed to visitors.

## Secrets

Secrets are **not stored in this repo or typed into local files**. They live in two places only:

| Where                                 | Name                   | Value                                      |
| ------------------------------------- | ---------------------- | ------------------------------------------ |
| Vercel → Settings → Environment Variables | `GOOGLE_SCRIPT_URL`    | Apps Script web app URL (ends in `/exec`)  |
| Vercel → Settings → Environment Variables | `GOOGLE_SCRIPT_SECRET` | A long random string                       |
| Apps Script → Project Settings → Script Properties | `SHARED_SECRET` | The same random string                     |

Both Vercel variables are required; without them the form returns "not configured". The Apps Script rejects any request whose secret doesn't match, so only your deployment can write to the sheet.

Generate a secret with either of:

```bash
openssl rand -hex 32
```

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

## 1. Set up the Google Sheet

1. Create a Google Sheet (or open an existing one).
2. Go to **Extensions → Apps Script**, delete the sample code and paste in [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Click the **gear icon (Project Settings) → Script Properties → Add script property**: name `SHARED_SECRET`, value your generated secret.
4. Click **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Authorize when prompted, then copy the **Web app URL**.

Submissions go to a tab named `Leads`, created with headers on the first submission:

| Timestamp | Full Name | Email | Company | Phone |
| --------- | --------- | ----- | ------- | ----- |

> If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## 2. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel (framework preset: **Next.js**, no other settings needed).
2. Under **Settings → Environment Variables**, add `GOOGLE_SCRIPT_URL` and `GOOGLE_SCRIPT_SECRET`. Tick **Production**, **Preview** and **Development** so local runs can pull them too.
3. Deploy. If you change a variable later, redeploy for it to take effect.

## 3. Run locally with Docker

Pull the variables from Vercel instead of writing them by hand (one-time `link`, then `pull` whenever they change):

```bash
npx vercel link
```

```bash
npx vercel env pull .env --environment=development
```

Then start the container:

```bash
docker compose up --build -d
```

Open http://localhost:3000 (set `HOST_PORT` in `.env` to use a different port). Stop it with `docker compose down`.

`.env` is git-ignored and excluded from the Docker image; values are only passed to the container at runtime.

## Local development (without Docker)

Requires Node.js 20+. Pull the env as above, then:

```bash
npm install
npm run dev
```

## Project structure

```
app/
  page.tsx                    Page with logo + form
  components/ContactForm.tsx  Client-side form, validation and states
  api/submit/route.ts         Validates and forwards to Google Sheets
lib/validation.ts             Shared validation (client + server)
google-apps-script/Code.gs    Script to paste into the Google Sheet
public/gdf-logo.png           Company logo
```
