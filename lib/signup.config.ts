// Where the form sends submissions: the Google Apps Script web app URL
// from README.md → "Connect the Google Sheet" (it ends in /exec).
//
// Either paste it below, or set GDF_SIGNUP_URL in Vercel (Settings → Environment
// Variables) and redeploy. The environment variable wins when both are set.
const pastedUrl = "";

const pattern = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^/]+|macros)\/s\/[\w-]+\/exec$/;

export function signupEndpoint(env: NodeJS.ProcessEnv = process.env): string {
  const url = String(env.GDF_SIGNUP_URL || pastedUrl).trim();
  if (url && !pattern.test(url)) {
    throw new Error(
      `The sign-up URL must be the Apps Script web app URL ending in /exec (Deploy → Manage deployments). Got: ${url}`,
    );
  }
  return url;
}
