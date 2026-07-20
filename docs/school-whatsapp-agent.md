# RHTI School WhatsApp Agent

## Isolation model

This integration uses the Radiant business portfolio and WABA while keeping a separate Meta app, phone-number ID, webhook URL, environment variables, application database tables, and message history. Do not reuse the appointment agent's Meta app secret, verify token, phone-number ID, or access token variables.

Configured non-secret identifiers:

- Meta app: `school` (`2221357331931817`)
- WABA: `980908518150007`
- School phone-number ID: `1276369935549330`
- Callback path: `/api/webhooks/meta/school-whatsapp`

## Required configuration

Create a project-local `.env` from `.env.example`. Copy only the Gemini API key value from `/home/buma/projects/whatsapp/.env`. Add the school Meta app secret, a private webhook verify token, and a system-user access token that has access to the school phone number. `PUBLIC_APP_URL` must be the externally reachable HTTPS origin; Meta cannot call `localhost`.

In the school Meta app, configure the WhatsApp callback as:

`https://YOUR-SCHOOL-DOMAIN/api/webhooks/meta/school-whatsapp`

Subscribe to `messages`. Use the same value as `SCHOOL_META_WHATSAPP_VERIFY_TOKEN` during webhook verification.

## Template requirements

Create and obtain approval for:

- `rhti_application_status_v1`: body parameters in order: applicant name, application reference, status.
- `rhti_offer_letter_v1`: document header plus body parameters in order: applicant name, application reference, status.

The offer template's document header receives a signed PDF link valid for 30 days. Status and offer notifications may occur outside the 24-hour customer-service window, so approved templates are required for production.

## Workflow

Inbound messages are signature-verified and restricted to the configured school phone-number ID. The agent answers using live `rhti_programs` and `rhti_knowledge_base` records. `APPLY` starts explicit field collection and displays a final confirmation before inserting into `applications` with `source='whatsapp'`. `STATUS` reads only the latest application associated with the sender's WhatsApp number.

Application status transitions create idempotent outbox entries. The dispatcher uses `FOR UPDATE SKIP LOCKED`, retry backoff, and unique event keys. The admissions status API dispatches immediately after the transaction commits. A scheduler should also call `POST /api/whatsapp/dispatch` with `Authorization: Bearer $WHATSAPP_DISPATCH_SECRET` every minute to retry transient failures.

## Privacy and operations

- Rotate Meta access tokens and app secrets without code changes.
- Never log secrets or raw access tokens.
- Restrict the system-user token to the intended WABA/phone asset.
- Publish privacy and data-deletion URLs in the Meta app configuration.
- Set an appropriate conversation/message retention policy before production.
- Move the Meta app from Development to Live only after webhook, template, privacy, and business-verification checks pass.
