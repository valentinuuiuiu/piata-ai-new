## Urgent: Revoke and Rotate Exposed Secrets

This file lists immediate actions to revoke and rotate the secrets discovered in the workspace (local `.env` and attachments).

1) Immediate assessment (you are here)
- Confirm which secrets are exposed locally (we found values in `.env`).
- Do NOT reuse any exposed keys; treat them as compromised.

2) High-priority rotation steps
- GitHub Personal Access Token (PAT):
  - Revoke the exposed PAT from https://github.com/settings/tokens (delete it).
  - Create a new PAT with minimal required scopes and store it in a secrets manager (GitHub Secrets, Vault, or CI).
- Stripe Secret Key:
  - Log into Stripe Dashboard → Developers → API keys → Rotate/Regenerate the secret key.
  - Update your environment stores and rotate any keys stored in CI or hosting.
- Supabase Service Role Key / Database credentials:
  - In Supabase dashboard, regenerate the `service_role` key and rotate the database password if possible.
  - Immediately update any running services with new credentials.
- Resend / X (any transactional email provider):
  - Revoke the API key in Resend dashboard and create a new one. Update `RESEND_API_KEY`.
- Vercel / Hosting tokens (e.g., `VERCEL_OIDC_TOKEN`):
  - Revoke any OIDC/Access tokens in Vercel dashboard and rotate the deployment environment secrets.
- Telegram Bot Token:
  - Use BotFather to revoke and create a new bot token.
- N8N API Key:
  - Regenerate the key in your n8n instance and update deployments.

3) Local repo cleanup (already partially done)
- Add `mcp_settings.json` and `.env` to `.gitignore` (done).
- Replace the leaked file with `mcp_settings.template.json` and `.env.template` (create/update). Commit these templates (done).
- Remove any tracked secrets (none found tracked; `.env` was untracked).

4) Purge secrets from git history (if any secret was committed previously)
- If a secret was committed, use `git filter-repo` (recommended) or BFG to remove it from history.
- Example (requires `git-filter-repo`):

```bash
# backup first
git clone --mirror <repo-url> repo-mirror.git
cd repo-mirror.git
# remove the file entirely
git filter-repo --path mcp_settings.json --invert-paths
# push the cleaned mirror to origin (force)
git push --force --all
```

- If you prefer BFG: https://rtyley.github.io/bfg-repo-cleaner/

5) Rotate dependent tokens and credentials in CI/hosting
- Update secrets in GitHub Actions / Vercel / Render / DigitalOcean / Supabase / Heroku.
- Remove any secrets kept in plain repo files.

6) Post-rotation checks
- Run `git grep` for known prefixes (e.g., `sk_live_`, `xai-`, `N8N_API_KEY`, `VERCEL_OIDC_TOKEN`) to ensure no secrets remain committed.
- Confirm services can still deploy and run with new keys.

7) Optional: automate some steps
- Use a secrets manager (HashiCorp Vault / AWS Secrets Manager / GitHub Secrets) and avoid committing keys.
- Add `scripts/rotate-secrets.md` for any programmatic rotations supported by APIs.

If you want, I can:
- Create a `.env.template` (I can add it now).
- Run `git-filter-repo` here if you confirm it and allow me to install tools and force-push (requires coordination).
- Contact third-party dashboards — I cannot rotate keys for you without access; I'll provide exact URLs and API commands.
