# GDF Client Form

A simple contact-details form for **Global Detergent Factory**. Clients enter their full name, email, company name and phone number; each submission becomes one row in a Google Sheet.

Built with Next.js. The form posts straight from the visitor's browser to a Google Apps Script web app bound to the Sheet. There is no backend and nothing secret to manage: the only setting is the script's URL, which can add rows but cannot read the Sheet.

## Connect the Google Sheet

Setup takes about five minutes and is done once.

### 1. Create the Sheet and the script

1. Sign in to the company Google account that should own the leads, and create a new Google Sheet, for example **GDF clients**.
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete the sample code and paste the whole of [`google-apps-script/Code.gs`](google-apps-script/Code.gs). Click **Save**.

### 2. Publish it as a web app

1. Click **Deploy → New deployment**, then the gear icon → **Web app**.
2. Set **Execute as: Me** and **Who has access: Anyone**. "Anyone" lets visitors send the form without signing in. They cannot read the Sheet.
3. Click **Deploy** and approve the permissions Google asks for. If Google says the app "hasn't been verified", that's expected for your own script: click **Advanced → Go to … (unsafe) → Allow**.
4. Copy the **Web app URL**. It starts with `https://script.google.com/macros/s/` and ends with `/exec`.

Opening that URL in a browser should show "GDF client form endpoint is running."

### 3. Give the URL to the site

Use either option:

- **Vercel (recommended):** Project → **Settings → Environment Variables** → add `GDF_SIGNUP_URL` with the URL, then **Deployments → ⋯ → Redeploy**.
- **In the code:** paste the URL into `pastedUrl` in [`lib/signup.config.ts`](lib/signup.config.ts), then commit and push.

The environment variable wins when both are set. The build stops with a clear message if the value is not a web app URL. A common mistake is copying the script editor's address instead. While no URL is set, the build prints a warning and the form shows an error message.

### 4. Test it

Open the live site, submit a test entry, and check that the row appears in the **Leads** tab (columns: Submitted at, Full name, Email, Company, Phone). Delete the test row afterwards.

### Changing the script later

Edit the code, then use **Deploy → Manage deployments → Edit → Version: New version → Deploy**. This keeps the same URL, so the site does not need to change. Creating a *new* deployment gives a new URL.

### Notes

- Visitors' browsers cannot read the script's reply from another site. A request that reaches Google counts as sent, and a network failure shows the error message. This is why step 4 matters.
- The script ignores bot submissions that fill the hidden `website` field. It also checks the required fields again and stores text so it cannot run as a spreadsheet formula (this also keeps `+966…` phone numbers intact).
- Share the Sheet only with the people who follow up on leads.

## Deploy to Vercel

1. Push this repo to GitHub, go to **https://vercel.com/new** and import it. The framework preset is detected as **Next.js**; leave the other settings as they are.
2. Expand **Environment Variables** and add `GDF_SIGNUP_URL` (or skip this if you pasted the URL into `lib/signup.config.ts`).
3. Click **Deploy**, then test as in step 4 above.

Every push to `main` redeploys automatically.

## Run locally with Docker

```bash
cp .env.example .env
```

Put the web app URL in `GDF_SIGNUP_URL` in `.env`, then:

```bash
docker compose up --build -d
```

Open http://localhost:3000 (set `HOST_PORT` in `.env` to use a different port). Stop it with `docker compose down`.

## Local development (without Docker)

Requires Node.js 20+.

```bash
npm install
npm run dev
```

## Project structure

```
app/
  page.tsx                    Page with logo + form
  components/ContactForm.tsx  Form, validation and states; posts to the Apps Script
lib/
  signup.config.ts            Where the form sends submissions (URL + check)
  validation.ts               Field validation
google-apps-script/Code.gs    Script to paste into the Google Sheet
public/gdf-logo.png           Company logo
```
